import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { sendOrderEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { formData, items, total } = body;

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

        // 1. Verify Stock for all items
        for (const item of items) {
            const { data: product, error } = await supabase
                .from('products')
                .select('stock, name')
                .eq('id', item.id)
                .single();

            if (error || !product) {
                return NextResponse.json(
                    { success: false, message: `Product not found: ${item.name}` },
                    { status: 404 }
                );
            }

            if (product.stock < item.quantity) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                    },
                    { status: 400 }
                );
            }
        }

        // 2. Deduct Stock
        // Manual update loop (safest fallback without guaranteed RPC existence)
        for (const item of items) {
            const { data: currentProduct, error: fetchError } = await supabaseAdmin
                .from('products')
                .select('stock')
                .eq('id', item.id)
                .single();

            if (fetchError || !currentProduct) {
                console.error(`Error fetching stock for ${item.name}`, fetchError);
                continue;
            }

            const newStock = Math.max(0, currentProduct.stock - item.quantity);

            const { error: updateError } = await supabaseAdmin
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.id);

            if (updateError) {
                console.error(`Failed to update stock for ${item.name}`, updateError);
            }
        }

        // 3. Create Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert([
                {
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
