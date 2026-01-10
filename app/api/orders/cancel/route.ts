import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { orderId, customerEmail } = await request.json();

    if (!orderId || !customerEmail) {
      return NextResponse.json(
        { success: false, message: 'Order ID and customer email are required' },
        { status: 400 }
      );
    }

    // Fetch the order
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

    // Check if order is already cancelled
    if (order.is_cancelled || order.order_status?.toLowerCase() === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Order is already cancelled' },
        { status: 400 }
      );
    }

    // Check if order can be cancelled (not delivered, shipped, or cancelled)
    const status = order.order_status?.toLowerCase();
    if (status === 'delivered' || status === 'shipped' || status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel orders that are shipped or delivered' },
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

    const cancelReason = 'User cancelled the order during processing';

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        is_cancelled: true,
        cancelled_at: new Date().toISOString(),
        cancelled_by: customerEmail,
        cancel_reason: cancelReason
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      needsRefundDetails: order.payment_method?.toLowerCase() !== 'cod',
      order: {
        id: order.id,
        payment_method: order.payment_method,
        shipping_address: order.shipping_address
      }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
