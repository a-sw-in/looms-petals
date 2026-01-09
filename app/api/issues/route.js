import { NextResponse } from 'next/server';
import { sendIssueEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { description, userId } = body;

        if (!description || !userId) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Fetch full user data from Supabase to include in the email
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            console.error('Error fetching user for issue report:', userError);
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const result = await sendIssueEmail({ description }, userData);

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Issue reported successfully' });
        } else {
            return NextResponse.json({ success: false, message: result.message || 'Failed to send email' }, { status: 500 });
        }
    } catch (err) {
        console.error('Issue API error:', err);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
