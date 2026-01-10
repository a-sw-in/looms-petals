import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update refund request status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { refundId, status, adminNotes, processedBy } = body;

    if (!refundId || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update refund request
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    if (processedBy) {
      updateData.processed_by = processedBy;
      updateData.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .update(updateData)
      .eq('id', refundId)
      .select()
      .single();

    if (error) {
      console.error('Error updating refund request:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update refund request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Refund request updated successfully',
      data,
    });
  } catch (error) {
    console.error('Error processing refund update:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
