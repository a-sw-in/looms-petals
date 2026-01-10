import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, reason, pickupAddress, customerEmail, customerName, refundMode, upiId, bankAccountNumber, bankIfscCode, bankAccountHolderName } = body;

    // Validate required fields
    if (!orderId || !reason || !pickupAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_email', customerEmail)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate refund details only for COD orders
    if (order.payment_method?.toLowerCase() === 'cod') {
      if (refundMode === 'upi' && !upiId) {
        return NextResponse.json(
          { success: false, message: 'UPI ID is required for UPI refunds' },
          { status: 400 }
        );
      }

      if (refundMode === 'bank' && (!bankAccountNumber || !bankIfscCode || !bankAccountHolderName)) {
        return NextResponse.json(
          { success: false, message: 'Bank account details are required for bank refunds' },
          { status: 400 }
        );
      }
    }

    // Check if order is delivered or cancelled by user
    const isDelivered = order.order_status?.toLowerCase() === 'delivered';
    const isCancelledByUser = order.is_cancelled === true || order.order_status?.toLowerCase() === 'cancelled';
    
    if (!isDelivered && !isCancelledByUser) {
      return NextResponse.json(
        { success: false, message: 'Only delivered or cancelled orders can be refunded' },
        { status: 400 }
      );
    }

    // Check if refund request already exists
    const { data: existingRefund } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (existingRefund) {
      return NextResponse.json(
        { success: false, message: 'A refund request already exists for this order' },
        { status: 400 }
      );
    }

    // Create refund request
    const { data: refundRequest, error: refundError } = await supabase
      .from('refund_requests')
      .insert({
        order_id: orderId,
        customer_email: customerEmail,
        customer_name: customerName,
        reason: reason,
        pickup_address: pickupAddress,
        status: 'pending',
        refund_amount: order.total_amount,
        payment_method: order.payment_method,
        refund_mode: refundMode,
        upi_id: refundMode === 'upi' ? upiId : null,
        bank_account_number: refundMode === 'bank' ? bankAccountNumber : null,
        bank_ifsc_code: refundMode === 'bank' ? bankIfscCode : null,
        bank_account_holder_name: refundMode === 'bank' ? bankAccountHolderName : null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (refundError) {
      console.error('Error creating refund request:', refundError);
      return NextResponse.json(
        { success: false, message: 'Failed to create refund request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted successfully',
      refundRequest,
    });
  } catch (error) {
    console.error('Error processing refund request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch refund requests (for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query = supabase
      .from('refund_requests')
      .select(`
        *,
        orders!inner (
          razorpay_payment_id,
          razorpay_order_id
        )
      `);

    if (email) {
      query = query.eq('customer_email', email);
    }

    const { data: refundsData, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching refund requests:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch refund requests' },
        { status: 500 }
      );
    }

    // Flatten the nested orders data into refund object
    const refunds = refundsData?.map(refund => ({
      ...refund,
      razorpay_payment_id: refund.orders?.razorpay_payment_id || null,
      razorpay_order_id: refund.orders?.razorpay_order_id || null,
    })) || [];

    return NextResponse.json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
