import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { formData, items, total, paymentDetails, userId } = body;

        if (!formData || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid order data' },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            console.error('Supabase Admin client not initialized');
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        let paymentStatus = 'pending';

        // Payment Verification for Online Orders
        if (formData.paymentMethod === 'online') {
            if (!paymentDetails || !paymentDetails.razorpay_payment_id || !paymentDetails.razorpay_order_id || !paymentDetails.razorpay_signature) {
                return NextResponse.json(
                    { success: false, message: 'Payment verification failed: Missing details' },
                    { status: 400 }
                );
            }

            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(paymentDetails.razorpay_order_id + "|" + paymentDetails.razorpay_payment_id);
            const generated_signature = hmac.digest('hex');

            if (generated_signature === paymentDetails.razorpay_signature) {
                paymentStatus = 'paid';
            } else {
                return NextResponse.json(
                    { success: false, message: 'Payment verification failed: Invalid signature' },
                    { status: 400 }
                );
            }
        }


        // 1 & 2. Atomic Stock Validation and Deduction
        // We use the custom PostgreSQL function 'deduct_order_stock' to handle this
        // in a single database transaction to prevent race conditions (overselling).
        const { data: stockResult, error: rpcError } = await supabaseAdmin.rpc('deduct_order_stock', {
            items_json: items
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

        // 3. Create Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert([
                {
                    user_id: userId || null,
                    customer_name: formData.fullName,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    shipping_address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pinCode,
                    country: formData.country,
                    items: items, // JSONB structure
                    total_amount: total,
                    payment_method: formData.paymentMethod,
                    payment_status: paymentStatus,
                }
            ])
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json(
                { success: false, message: 'Failed to place order. Please try again.' },
                { status: 500 }
            );
        }

        // 4. Send Email Notification (Async - don't block response)
        // We await it here to ensure it tries to send, but wrapped in try-catch in utility causing no crash
        // For better performance in high-scale, this should be a background job.
        console.log('Attempting to send order email...');
        const emailResult = await sendOrderEmail(order);
        console.log('Email sending result:', emailResult);

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
