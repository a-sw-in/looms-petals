import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AdminVerificationResult {
  authorized: boolean;
  user?: {
    id: number;
    email: string;
    role: string;
  };
  error?: string;
}

/**
 * Verify that the current user is an admin
 * @param request - The Next.js request object
 * @returns Object with authorization status
 */
export async function verifyAdmin(request: NextRequest | Request): Promise<AdminVerificationResult> {
  try {
    // Get session from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { authorized: false, error: 'No session found' };
    }

    // Extract session cookie
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('admin_session='));
    
    if (!sessionCookie) {
      return { authorized: false, error: 'No admin session' };
    }

    const sessionId = sessionCookie.split('=')[1];
    
    // Verify session in database
    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('admin_email, expires_at')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return { authorized: false, error: 'Invalid session' };
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_id', sessionId);
      
      return { authorized: false, error: 'Session expired' };
    }

    // Get admin user details
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('email', session.admin_email)
      .single();

    if (adminError || !admin) {
      return { authorized: false, error: 'Admin not found' };
    }

    // Check if user has admin role
    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      return { authorized: false, error: 'Insufficient permissions' };
    }

    return {
      authorized: true,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { authorized: false, error: 'Verification failed' };
  }
}

/**
 * Middleware wrapper to protect admin routes
 * @param handler - The API route handler
 * @returns Protected handler function
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: { admin: any }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const verification = await verifyAdmin(request);

    if (!verification.authorized) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    // Add admin info to context
    return handler(request, { ...context, admin: verification.user });
  };
}

/**
 * Verify user session (for regular users)
 */
export async function verifyUserSession(request: NextRequest | Request): Promise<{
  authorized: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return { authorized: false, error: 'No session found' };
    }

    // Extract session cookie
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('session='));
    
    if (!sessionCookie) {
      return { authorized: false, error: 'No session' };
    }

    const sessionId = sessionCookie.split('=')[1];
    
    // Verify session in database
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return { authorized: false, error: 'Invalid session' };
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_id', sessionId);
      
      return { authorized: false, error: 'Session expired' };
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      return { authorized: false, error: 'User not found' };
    }

    return {
      authorized: true,
      user,
    };
  } catch (error) {
    console.error('User verification error:', error);
    return { authorized: false, error: 'Verification failed' };
  }
}

/**
 * Middleware wrapper to protect user routes
 */
export function withUserAuth(
  handler: (request: NextRequest, context: { user: any }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const verification = await verifyUserSession(request);

    if (!verification.authorized) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, { ...context, user: verification.user });
  };
}
