import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Verify admin authentication
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    console.log('🔐 Verifying admin, token:', token ? 'Found' : 'Not found');

    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    // Get session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      console.log('❌ Session not found or expired:', sessionError?.message);
      return null;
    }

    console.log('✅ Session found, user_id:', session.user_id);

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      console.log('❌ User not found:', userError?.message);
      return null;
    }

    if (user.role !== 'admin') {
      console.log('❌ User is not admin, role:', user.role);
      return null;
    }

    console.log('✅ Admin verified:', user.email);
    return user;
  } catch (error) {
    console.error('❌ verifyAdmin error:', error);
    return null;
  }
}

// GET - Fetch all products or specific product
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let query = supabase.from('products').select('*');

    if (id) {
      const { data, error } = await query.eq('id', id).single();
      
      if (error) {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 200 });
    }

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, count: data.length, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product (Admin only)
export async function POST(request) {
  try {
    console.log('\n========== CREATE PRODUCT ==========');
    const admin = await verifyAdmin();
    if (!admin) {
      console.log('❌ Unauthorized - no admin session');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Admin verified:', admin.email);

    const body = await request.json();
    console.log('📦 Product data received:', body);

    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Inserting product into database...');
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([
        {
          name: body.name,
          description: body.description || null,
          price: parseFloat(body.price),
          discount_price: body.discount_price ? parseFloat(body.discount_price) : null,
          category: body.category,
          subcategory: body.subcategory || null,
          brand: body.brand || null,
          image_url: body.image_url || null,
          images: body.images || [],
          stock: parseInt(body.stock) || 0,
          sizes: body.sizes || [],
          colors: body.colors || [],
          status: body.status || 'normal',
          type: body.type || 'clothing',
          is_featured: body.is_featured || false,
          is_active: body.is_active !== false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create product', error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Product created successfully:', data.id);

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update product (Admin only)
export async function PUT(request) {
  try {
    console.log('\n========== UPDATE PRODUCT ==========');
    const admin = await verifyAdmin();
    if (!admin) {
      console.log('❌ Unauthorized');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('❌ Missing product ID');
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('📦 Updating product:', id);

    const updateData = {
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price),
      discount_price: body.discount_price ? parseFloat(body.discount_price) : null,
      category: body.category,
      subcategory: body.subcategory || null,
      brand: body.brand || null,
      image_url: body.image_url || null,
      stock: parseInt(body.stock) || 0,
      status: body.status || 'normal',
      type: body.type || 'clothing',
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false,
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update product' },
        { status: 500 }
      );
    }

    console.log('✅ Product updated successfully');

    return NextResponse.json(
      { success: true, message: 'Product updated successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (Admin only)
export async function DELETE(request) {
  try {
    console.log('\n========== DELETE PRODUCT ==========');
    const admin = await verifyAdmin();
    if (!admin) {
      console.log('❌ Unauthorized');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('❌ Missing product ID');
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting product:', id);

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Delete error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete product' },
        { status: 500 }
      );
    }

    console.log('✅ Product deleted successfully');

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully', data: { id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
