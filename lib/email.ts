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

export async function sendIssueEmail(issueData: any, userData: any) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail || !process.env.RESEND_API_KEY) {
    console.warn('Missing email configuration (ADMIN_EMAIL or RESEND_API_KEY)');
    return { success: false, message: 'Email configuration missing' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: adminEmail,
      subject: `New Issue Reported - ${userData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #c53030; border-bottom: 2px solid #eee; padding-bottom: 10px;">New Issue Report</h1>
          
          <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border: 1px solid #feb2b2; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #c53030;">Issue Description</h3>
            <p style="white-space: pre-wrap;">${issueData.description}</p>
          </div>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Reporter Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0;"><strong>User ID:</strong></td><td>${userData.id}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Name:</strong></td><td>${userData.name}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${userData.email}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Phone:</strong></td><td>${userData.phone || 'N/A'}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Age:</strong></td><td>${userData.age || 'N/A'}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Gender:</strong></td><td>${userData.gender || 'N/A'}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Address:</strong></td><td>${userData.address || 'N/A'}</td></tr>
            </table>
          </div>

          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            Reported on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend issue email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Failed to send issue email:', err);
    return { success: false, error: err };
  }
}
