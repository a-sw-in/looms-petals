import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcrypt';

// GET - Fetch all users or a specific user by email/id
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    let query = supabase.from('users').select('*');

    if (id) {
      // Fetch user by ID
      const { data, error } = await query.eq('id', id).single();
      
      if (error) {
        return NextResponse.json(
          { success: false, message: 'User not found', error: error.message },
          { status: 404 }
        );
      }

      // Remove sensitive data
      const { password, reset_password_token, verification_token, ...safeData } = data;

      return NextResponse.json(
        { success: true, data: safeData },
        { status: 200 }
      );
    } else if (email) {
      // Fetch user by email
      const { data, error } = await query.eq('email', email.toLowerCase()).single();
      
      if (error) {
        return NextResponse.json(
          { success: false, message: 'User not found', error: error.message },
          { status: 404 }
        );
      }

      // Remove sensitive data
      const { password, reset_password_token, verification_token, ...safeData } = data;

      return NextResponse.json(
        { success: true, data: safeData },
        { status: 200 }
      );
    } else {
      // Fetch all users
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json(
          { success: false, message: 'Failed to fetch users', error: error.message },
          { status: 500 }
        );
      }

      // Remove sensitive data from all users
      const safeData = data.map(({ password, reset_password_token, verification_token, ...user }) => user);

      return NextResponse.json(
        {
          success: true,
          count: safeData.length,
          data: safeData,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please provide name, email, and password',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: body.name,
          email: body.email.toLowerCase(),
          password: hashedPassword,
          phone: body.phone || null,
          address: body.address || null,
          role: body.role || 'user',
          avatar: body.avatar || null,
          is_verified: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('User creation error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create user',
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Remove sensitive data from response
    const { password, reset_password_token, verification_token, ...userResponse } = data;

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update user data
export async function PUT(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Don't allow password and sensitive token updates through this route
    delete body.password;
    delete body.reset_password_token;
    delete body.verification_token;
    delete body.role; // Prevent role escalation
    delete body.id; // Prevent ID changes

    // Validate email if being updated
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
      body.email = body.email.toLowerCase();
    }

    const { data, error } = await supabase
      .from('users')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { success: false, message: 'User not found or update failed', error: error.message },
        { status: 404 }
      );
    }

    // Remove sensitive data from response
    const { password, reset_password_token, verification_token, ...userResponse } = data;

    return NextResponse.json(
      {
        success: true,
        message: 'User updated successfully',
        data: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user exists before deletion
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single();

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users (optional security measure)
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { success: false, message: 'Deletion failed', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
        data: { id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
