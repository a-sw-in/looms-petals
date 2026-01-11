import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

        // Fetch failed orders for this email
        const { data: failedOrders, error } = await supabaseAdmin
            .from('failed_orders')
            .select('*')
            .eq('customer_email', email)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching failed orders:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch failed orders' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            failedOrders: failedOrders || []
        });

    } catch (error) {
        console.error('Failed orders fetch error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
