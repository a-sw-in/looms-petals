import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';
import { apiRateLimit } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

// Store recent order attempts to prevent duplicates
const recentOrders = new Map<string, number>();

// Helper function to log failed order attempts
async function logFailedOrder(
    formData: any,
    items: any[],
    submittedTotal: number,
    calculatedTotal: number | null,
    paymentDetails: any,
    failureReason: string,
    failureMessage: string,
    userId?: string
) {
    try {
        await supabaseAdmin?.from('failed_orders').insert([{
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pinCode,
            country: formData.country,
            items: items,
            submitted_total: submittedTotal,
            calculated_total: calculatedTotal,
            razorpay_order_id: paymentDetails?.razorpay_order_id || null,
            razorpay_payment_id: paymentDetails?.razorpay_payment_id || null,
            razorpay_signature: paymentDetails?.razorpay_signature || null,
            failure_reason: failureReason,
            failure_message: failureMessage,
            user_id: userId || null
        }]);
        console.log('✅ Failed order logged for review:', formData.email);
    } catch (error) {
        console.error('❌ Failed to log failed order:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting - 1 order per minute per IP
        const rateLimit = apiRateLimit(request);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { success: false, message: 'Too many order attempts. Please wait a moment.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { formData, items, total, paymentDetails, userId } = body;

        if (!formData || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid order data' },
                { status: 400 }
            );
        }

        // 2. Order Deduplication - Prevent duplicate submissions
        const orderHash = `${formData.email}-${JSON.stringify(items)}-${total}`;
        const lastOrderTime = recentOrders.get(orderHash);
        const now = Date.now();
        
        if (lastOrderTime && (now - lastOrderTime) < 60000) { // 1 minute window
            return NextResponse.json(
                { success: false, message: 'Duplicate order detected. Please wait before resubmitting.' },
                { status: 400 }
            );
        }
        
        recentOrders.set(orderHash, now);
        
        // Cleanup old entries (older than 5 minutes)
        for (const [hash, time] of recentOrders.entries()) {
            if (now - time > 300000) {
                recentOrders.delete(hash);
            }
        }

        if (!supabaseAdmin) {
            console.error('Supabase Admin client not initialized');
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        // 3. SERVER-SIDE PRICE CALCULATION - NEVER TRUST FRONTEND
        let calculatedTotal = 0;
        const validatedItems = [];
        
        for (const item of items) {
            // Fetch actual price from database
            const { data: product, error: productError } = await supabaseAdmin
                .from('products')
                .select('discount_price, stock, name')
                .eq('id', item.id)
                .single();
            
            if (productError || !product) {
                return NextResponse.json(
                    { success: false, message: `Invalid product: ${item.name || item.id}` },
                    { status: 400 }
                );
            }
            
            // Use database discount price, NOT frontend price
            const itemTotal = product.discount_price * item.quantity;
            calculatedTotal += itemTotal;
            
            validatedItems.push({
                ...item,
                price: product.discount_price, // Enforce server-side discount price
                name: product.name,
            });
        }
        
        // 4. Verify total amount matches calculation (tolerance: ₹1 for rounding)
        const priceDifference = Math.abs(calculatedTotal - total);
        if (priceDifference > 1) {
            console.error('Price manipulation detected:', {
                submitted: total,
                calculated: calculatedTotal,
                difference: priceDifference
            });
            
            // Log failed order if online payment was attempted
            if (formData.paymentMethod === 'online' && paymentDetails) {
                await logFailedOrder(
                    formData,
                    validatedItems,
                    total,
                    calculatedTotal,
                    paymentDetails,
                    'price_verification',
                    `Price mismatch: submitted ₹${total}, calculated ₹${calculatedTotal}`,
                    userId
                );
            }
            
            return NextResponse.json(
                { success: false, message: 'Price verification failed. Please refresh and try again.' },
                { status: 400 }
            );
        }

        let paymentStatus = 'pending';

        // 5. Payment Verification for Online Orders
        if (formData.paymentMethod === 'online') {
            if (!paymentDetails || !paymentDetails.razorpay_payment_id || !paymentDetails.razorpay_order_id || !paymentDetails.razorpay_signature) {
                return NextResponse.json(
                    { success: false, message: 'Payment verification failed: Missing details' },
                    { status: 400 }
                );
            }

            // Verify Razorpay signature
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id);
            const generated_signature = hmac.digest('hex');

            if (generated_signature !== paymentDetails.razorpay_signature) {
                console.error('Payment signature verification failed:', {
                    order_id: paymentDetails.razorpay_order_id,
                    payment_id: paymentDetails.razorpay_payment_id
                });
                
                // Log failed order - signature verification failed
                await logFailedOrder(
                    formData,
                    validatedItems,
                    total,
                    calculatedTotal,
                    paymentDetails,
                    'signature_verification',
                    'Razorpay signature verification failed',
                    userId
                );
                
                return NextResponse.json(
                    { success: false, message: 'Payment verification failed: Invalid signature' },
                    { status: 400 }
                );
            }
            
            // Additional verification: Fetch payment details from Razorpay
            try {
                console.log('🔍 Starting Razorpay payment verification...');
                console.log('🔑 Environment Check:', {
                    hasKeyId: !!process.env.RAZORPAY_KEY_ID,
                    hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
                    keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 8)
                });
                
                const paymentResponse = await fetch(
                    `https://api.razorpay.com/v1/payments/${paymentDetails.razorpay_payment_id}`,
                    {
                        headers: {
                            'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
                        },
                    }
                );
                
                console.log('📡 Razorpay API Response Status:', paymentResponse.status);
                console.log('📡 Response OK?', paymentResponse.ok);
                
                if (paymentResponse.ok) {
                    const paymentData = await paymentResponse.json();
                    console.log('💳 Payment Data Retrieved:', {
                        status: paymentData.status,
                        amount: paymentData.amount,
                        currency: paymentData.currency,
                        method: paymentData.method
                    });
                    
                    // Verify payment status
                    if (paymentData.status !== 'captured' && paymentData.status !== 'authorized') {
                        console.error('❌ Payment status not valid:', paymentData.status);
                        
                        // Log failed order - invalid payment status
                        await logFailedOrder(
                            formData,
                            validatedItems,
                            total,
                            calculatedTotal,
                            { ...paymentDetails, payment_amount: paymentData.amount },
                            'payment_status_invalid',
                            `Payment status is ${paymentData.status}, expected captured or authorized`,
                            userId
                        );
                        
                        return NextResponse.json(
                            { success: false, message: 'Payment not completed. Status: ' + paymentData.status },
                            { status: 400 }
                        );
                    }
                    
                    // Verify payment amount matches order total (in paise)
                    const expectedAmount = Math.round(calculatedTotal * 100);
                    console.log('💰 Amount Check:', {
                        expected: expectedAmount,
                        received: paymentData.amount,
                        difference: Math.abs(paymentData.amount - expectedAmount)
                    });
                    
                    if (Math.abs(paymentData.amount - expectedAmount) > 100) { // 1 rupee tolerance
                        console.error('❌ Payment amount mismatch:', {
                            expected: expectedAmount,
                            received: paymentData.amount
                        });
                        
                        // Log failed order - amount mismatch
                        await logFailedOrder(
                            formData,
                            validatedItems,
                            total,
                            calculatedTotal,
                            { ...paymentDetails, payment_amount: paymentData.amount },
                            'amount_mismatch',
                            `Amount mismatch: expected ₹${expectedAmount/100}, received ₹${paymentData.amount/100}`,
                            userId
                        );
                        
                        return NextResponse.json(
                            { success: false, message: 'Payment amount verification failed' },
                            { status: 400 }
                        );
                    }
                    
                    console.log('✅ Payment verification successful!');
                    paymentStatus = 'paid';
                } else {
                    const errorText = await paymentResponse.text();
                    console.error('❌ Razorpay API Error:', {
                        status: paymentResponse.status,
                        statusText: paymentResponse.statusText,
                        errorBody: errorText
                    });
                    return NextResponse.json(
                        { success: false, message: 'Payment verification failed with gateway' },
                        { status: 400 }
                    );
                }
            } catch (verifyError) {
                console.error('❌ Razorpay verification exception:', verifyError);
                return NextResponse.json(
                    { success: false, message: 'Payment verification error' },
                    { status: 500 }
                );
            }
        }


        // 6. Atomic Stock Validation and Deduction
        // We use the custom PostgreSQL function 'deduct_order_stock' to handle this
        // in a single database transaction to prevent race conditions (overselling).
        const { data: stockResult, error: rpcError } = await supabaseAdmin.rpc('deduct_order_stock', {
            items_json: validatedItems // Use server-validated items with correct prices
        });

        if (rpcError) {
            console.error('RPC Error (deduct_order_stock):', rpcError);
            return NextResponse.json(
                { success: false, message: 'Stock verification failed due to a server error.' },
                { status: 500 }
            );
        }

        if (!stockResult.success) {
            return NextResponse.json(
                { success: false, message: stockResult.message },
                { status: 400 }
            );
        }

        // 7. Create Order with validated data
        const orderData: any = {
            user_id: userId || null,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pinCode,
            country: formData.country,
            items: validatedItems, // Use validated items with server-side prices
            total_amount: calculatedTotal, // Use server-calculated total
            payment_method: formData.paymentMethod,
            payment_status: paymentStatus,
        };

        // Add Razorpay payment details for online payments
        if (formData.paymentMethod === 'online' && paymentDetails) {
            orderData.razorpay_order_id = paymentDetails.razorpay_order_id || null;
            orderData.razorpay_payment_id = paymentDetails.razorpay_payment_id || null;
            orderData.razorpay_signature = paymentDetails.razorpay_signature || null;
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json(
                { success: false, message: 'Failed to place order. Please try again.' },
                { status: 500 }
            );
        }

        // 8. Send Email Notification (Async - don't block response)
        // We await it here to ensure it tries to send, but wrapped in try-catch in utility causing no crash
        // For better performance in high-scale, this should be a background job.
        console.log('Attempting to send order email...');
        const emailResult = await sendOrderEmail(order);
        console.log('Email sending result:', emailResult);

        // Clear order deduplication hash after successful order
        recentOrders.delete(orderHash);

        return NextResponse.json({ success: true, orderId: order.id }, { status: 200 });

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch orders' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, orders }, { status: 200 });

    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
