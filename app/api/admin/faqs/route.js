import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAdmin() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) return false;

    const { data: session, error } = await supabaseAdmin
        .from('admin_sessions')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

    return !!session;
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
