import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Verify admin authentication
async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
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
      return null;
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Admin verification error:', error);
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
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, message: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

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
          image_url: Array.isArray(body.image_url) ? JSON.stringify(body.image_url) : (body.image_url || null),
          images: body.images || [],
          stock: parseInt(body.stock) || 0,
          sizes: body.sizes || [],
          colors: body.colors || [],
          status: body.status || 'normal',
          type: body.type || 'clothing',
          is_featured: body.is_featured || false,
          is_active: body.is_active !== false,
          searchkey: body.searchkey || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create product', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product created successfully', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update product (Admin only)
export async function PUT(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData = {
      name: body.name,
      description: body.description || null,
      price: parseFloat(body.price),
      discount_price: body.discount_price ? parseFloat(body.discount_price) : null,
      category: body.category,
      subcategory: body.subcategory || null,
      brand: body.brand || null,
      image_url: Array.isArray(body.image_url) ? JSON.stringify(body.image_url) : (body.image_url || null),
      stock: parseInt(body.stock) || 0,
      status: body.status || 'normal',
      type: body.type || 'clothing',
      is_featured: body.is_featured || false,
      is_active: body.is_active !== false,
      searchkey: body.searchkey || null,
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product updated successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (Admin only)
export async function DELETE(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Product deleted successfully', data: { id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
