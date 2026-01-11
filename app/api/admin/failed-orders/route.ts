import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Verify admin authentication
async function verifyAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !supabaseAdmin) {
            return null;
        }

        const { data: session, error: sessionError } = await supabaseAdmin
            .from('admin_sessions')
            .select('*')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (sessionError || !session) return null;

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', session.user_id)
            .eq('role', 'admin')
            .single();

        if (userError || !user) return null;
        return user;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    try {
        // Check admin authentication
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch failed orders
        if (!supabaseAdmin) {
            return NextResponse.json(
                { success: false, message: 'Database not configured' },
                { status: 500 }
            );
        }

        const { data: failedOrders, error } = await supabaseAdmin
            .from('failed_orders')
            .select('*')
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
            data: failedOrders
        });

    } catch (error) {
        console.error('Failed orders fetch error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Update failed order (mark as resolved, add admin notes)
export async function PATCH(request: Request) {
    try {
        // Check admin authentication
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, resolved, admin_notes } = body;

        const updateData: any = {};
        if (typeof resolved !== 'undefined') {
            updateData.resolved = resolved;
            if (resolved) {
                updateData.resolved_at = new Date().toISOString();
            }
        }
        if (admin_notes !== undefined) {
            updateData.admin_notes = admin_notes;
        }

        if (!supabaseAdmin) {
            return NextResponse.json(
                { success: false, message: 'Database not configured' },
                { status: 500 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('failed_orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating failed order:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to update failed order' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Failed order update error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
