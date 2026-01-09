import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAdmin() {
    try {
        console.log('[FAQ Auth] Starting admin verification...');
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        console.log('[FAQ Auth] Token found:', !!token);
        if (!token) {
            console.log('[FAQ Auth] No admin_token cookie found');
            return null;
        }

        console.log('[FAQ Auth] Checking session in database...');
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('admin_sessions')
            .select('*')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        console.log('[FAQ Auth] Session query result:', { session: !!session, error: sessionError?.message });
        if (sessionError || !session) {
            console.log('[FAQ Auth] Session validation failed');
            return null;
        }

        console.log('[FAQ Auth] Fetching user with ID:', session.user_id);
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', session.user_id)
            .eq('role', 'admin')
            .single();

        console.log('[FAQ Auth] User query result:', { user: !!user, role: user?.role, error: userError?.message });
        if (userError || !user) {
            console.log('[FAQ Auth] User validation failed');
            return null;
        }

        console.log('[FAQ Auth] Admin verified successfully');
        return user;
    } catch (error) {
        console.error('[FAQ Auth] Exception during verification:', error.message);
        return null;
    }
}

export async function GET() {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function POST(request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, category } = body;

    const { data, error } = await supabaseAdmin
        .from('faqs')
        .insert([{ question, answer, category }])
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function PUT(request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, question, answer, category } = body;

    const { data, error } = await supabaseAdmin
        .from('faqs')
        .update({ question, answer, category, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function DELETE(request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabaseAdmin
        .from('faqs')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: 'FAQ deleted successfully' });
}
