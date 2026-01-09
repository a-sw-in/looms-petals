import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(order: any) {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.warn('ADMIN_EMAIL env var is not set. Skipping email notification.');
        return { success: false, message: 'Admin email not configured' };
    }

    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY env var is not set. Skipping email notification.');
        return { success: false, message: 'Resend API key not configured' };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: adminEmail,
            subject: `New Order Received - #${order.id}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #7a2d2d; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Order #${order.id}</h1>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Customer Details</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Email:</strong> ${order.customer_email}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Address:</strong><br/>
            ${order.shipping_address}<br/>
            ${order.city}, ${order.state} - ${order.pincode}<br/>
            ${order.country}
            </p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #eee; text-align: left;">
                  <th style="padding: 10px;">Item</th>
                  <th style="padding: 10px;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">
                      <strong>${item.name}</strong>
                      ${item.selectedSize ? `<br/><small>Size: ${item.selectedSize}</small>` : ''}
                      ${item.selectedColor ? `<br/><small>Color: ${item.selectedColor}</small>` : ''}
                    </td>
                    <td style="padding: 10px;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right;">₹${item.price || item.discount_price}</td>
                    <td style="padding: 10px; text-align: right;">₹${(item.price || item.discount_price) * item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="font-weight: bold; background: #f9f9f9;">
                  <td colspan="3" style="padding: 10px; text-align: right;">Total Amount:</td>
                  <td style="padding: 10px; text-align: right;">₹${order.total_amount}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #eef; padding: 15px; border-radius: 8px;">
            <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
            <p><strong>Order Status:</strong> ${order.order_status.toUpperCase()}</p>
          </div>

          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated notification from Looms & Petals.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend email error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Failed to send email:', err);
        return { success: false, error: err };
    }
}
