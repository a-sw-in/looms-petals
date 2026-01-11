import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { failedOrderId, customerName, customerEmail, customerMessage, failedOrderDetails } = body;

        if (!customerEmail || !customerMessage || !failedOrderId) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if support request already submitted
        if (!supabaseAdmin) {
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        const { data: existingOrder, error: checkError } = await supabaseAdmin
            .from('failed_orders')
            .select('support_request_submitted')
            .eq('id', failedOrderId)
            .single();

        if (checkError) {
            console.error('Error checking failed order:', checkError);
            return NextResponse.json(
                { success: false, message: 'Failed to verify order' },
                { status: 500 }
            );
        }

        if (existingOrder?.support_request_submitted) {
            return NextResponse.json(
                { success: false, message: 'Support request already submitted for this order' },
                { status: 400 }
            );
        }

        const brevoApiKey = process.env.BREVO_API_KEY;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

        if (!brevoApiKey) {
            console.error('BREVO_API_KEY not set');
            return NextResponse.json(
                { success: false, message: 'Email service not configured' },
                { status: 500 }
            );
        }

        // Prepare email content
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #7a2d2d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .label { font-weight: bold; color: #7a2d2d; margin-top: 10px; }
                    .value { margin-bottom: 10px; }
                    .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
                    .customer-message { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Failed Order Support Request</h1>
                    </div>
                    <div class="content">
                        <div class="alert">
                            <strong>⚠️ Action Required:</strong> A customer has submitted a support request for a failed order.
                        </div>

                        <div class="section">
                            <h2 style="color: #7a2d2d; margin-top: 0;">Customer Information</h2>
                            <div class="label">Name:</div>
                            <div class="value">${customerName}</div>
                            <div class="label">Email:</div>
                            <div class="value">${customerEmail}</div>
                            <div class="label">Phone:</div>
                            <div class="value">${failedOrderDetails.customer_phone}</div>
                        </div>

                        <div class="section">
                            <h2 style="color: #7a2d2d; margin-top: 0;">Failed Order Details</h2>
                            <div class="label">Failed Order ID:</div>
                            <div class="value">#${failedOrderId}</div>
                            <div class="label">Attempt Date:</div>
                            <div class="value">${new Date(failedOrderDetails.created_at).toLocaleString()}</div>
                            <div class="label">Failure Reason:</div>
                            <div class="value">${failedOrderDetails.failure_reason?.replace(/_/g, ' ').toUpperCase()}</div>
                            <div class="label">Failure Message:</div>
                            <div class="value">${failedOrderDetails.failure_message}</div>
                            <div class="label">Amount:</div>
                            <div class="value">₹${Number(failedOrderDetails.submitted_total || 0).toLocaleString()}</div>
                        </div>

                        ${failedOrderDetails.razorpay_payment_id ? `
                        <div class="section">
                            <h2 style="color: #7a2d2d; margin-top: 0;">Payment Information</h2>
                            <div class="label">Razorpay Payment ID:</div>
                            <div class="value"><code>${failedOrderDetails.razorpay_payment_id}</code></div>
                            ${failedOrderDetails.razorpay_order_id ? `
                            <div class="label">Razorpay Order ID:</div>
                            <div class="value"><code>${failedOrderDetails.razorpay_order_id}</code></div>
                            ` : ''}
                        </div>
                        ` : ''}

                        <div class="section">
                            <h2 style="color: #7a2d2d; margin-top: 0;">Customer's Message</h2>
                            <div class="customer-message">
                                ${customerMessage.replace(/\n/g, '<br>')}
                            </div>
                        </div>

                        <div class="section">
                            <h2 style="color: #7a2d2d; margin-top: 0;">Next Steps</h2>
                            <ol>
                                <li>Verify the payment status in Razorpay dashboard</li>
                                <li>Contact the customer at ${customerEmail} or ${failedOrderDetails.customer_phone}</li>
                                <li>Process refund if payment was captured</li>
                                <li>Mark as resolved in admin dashboard</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email via Brevo API
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: process.env.BREVO_SENDER_NAME || 'Looms & Petals',
                    email: process.env.BREVO_SENDER_EMAIL || 'noreply@loomspetals.com',
                },
                to: [{ email: adminEmail }],
                replyTo: { email: customerEmail, name: customerName },
                subject: `Failed Order Support Request - ID #${failedOrderId}`,
                htmlContent: emailHtml,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Brevo API error:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to send email' },
                { status: 500 }
            );
        }

        // Mark support request as submitted
        const { error: updateError } = await supabaseAdmin
            .from('failed_orders')
            .update({
                support_request_submitted: true,
                support_request_submitted_at: new Date().toISOString()
            })
            .eq('id', failedOrderId);

        if (updateError) {
            console.error('Error updating failed order:', updateError);
            // Don't fail the request if email was sent successfully
        }

        return NextResponse.json({
            success: true,
            message: 'Support request sent successfully'
        });

    } catch (error) {
        console.error('Failed to send support request email:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to send support request' },
            { status: 500 }
        );
    }
}
