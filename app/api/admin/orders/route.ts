import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Verify admin authentication (reuse logic or import middleware if available)
async function verifyAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !supabaseAdmin) return null;

        const { data: session } = await supabaseAdmin
            .from('admin_sessions')
            .select('*')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (!session || !supabaseAdmin) return null;

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', session.user_id)
            .eq('role', 'admin')
            .single();

        return user;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch orders error:', error);
            return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: orders });
    } catch (error) {
        console.error('Orders API error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        const body = await request.json();
        const { id, status, type } = body; // type is 'payment' or 'order'

        if (!id || !status || !type) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const updateData: any = {};
        if (type === 'payment') {
            updateData.payment_status = status;
        } else if (type === 'order') {
            updateData.order_status = status;
        }

        const { error } = await supabaseAdmin
            .from('orders')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Update order error:', error);
            return NextResponse.json({ success: false, message: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Order updated successfully' });

    } catch (error) {
        console.error('Order update API error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
