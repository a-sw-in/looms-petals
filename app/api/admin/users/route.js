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
    } catch {
        return null;
    }
}

// GET - Fetch all users
export async function GET() {
    try {
        const admin = await verifyAdmin();

        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, name, email, phone, address, age, gender, role, is_verified, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch users error:', error);
            return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Users API error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE - Remove a user
export async function DELETE(request) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
        }

        // Prevent self-deletion
        if (id === admin.id) {
            return NextResponse.json({ success: false, message: 'Cannot delete yourself' }, { status: 403 });
        }

        // Check if target user is an admin (optional security)
        const { data: targetUser } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', id)
            .single();

        if (targetUser && targetUser.role === 'admin') {
            return NextResponse.json({ success: false, message: 'Cannot delete another admin' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete user error:', error);
            return NextResponse.json({ success: false, message: 'Failed to delete user' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('User delete error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
