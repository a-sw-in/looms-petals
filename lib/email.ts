// Brevo (Sendinblue) - STRICTLY for admin emails only
async function sendBrevoEmail(to: string, subject: string, htmlContent: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (!brevoApiKey) {
    console.error('BREVO_API_KEY not set. Cannot send admin email.');
    return { success: false, message: 'Brevo API key not configured' };
  }

  try {
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
          email: process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER,
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo API error:', error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log('✅ Admin email sent via Brevo to:', to);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to send Brevo email:', err);
    return { success: false, error: err };
  }
}

export async function sendOrderEmail(order: any) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL env var is not set. Skipping email notification.');
    return { success: false, message: 'Admin email not configured' };
  }

  try {
    const htmlContent = `
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
      `;

    // Send via Brevo (admin notification only)
    return await sendBrevoEmail(
      adminEmail,
      `New Order #${order.id} - ${order.customer_name}`,
      htmlContent
    );
  } catch (err) {
    console.error('Failed to send order email:', err);
    return { success: false, error: err };
  }
}

export async function sendIssueEmail(issueData: any, userData: any) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('Missing email configuration (ADMIN_EMAIL)');
    return { success: false, message: 'Email configuration missing' };
  }

  try {
    const htmlContent = `
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
      `;

    // Send via Brevo (admin emails only)
    return await sendBrevoEmail(
      adminEmail,
      `New Issue Reported - ${userData.name}`,
      htmlContent
    );
  } catch (err) {
    console.error('Failed to send issue email:', err);
    return { success: false, error: err };
  }
}

export async function sendRefundRequestEmail(refundData: any, orderData: any) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL env var is not set. Skipping refund notification.');
    return { success: false, message: 'Admin email not configured' };
  }

  try {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #d97706; border-bottom: 2px solid #eee; padding-bottom: 10px;">🔄 Refund Request #${refundData.id}</h1>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #d97706;">Refund Details</h3>
            <p><strong>Order ID:</strong> #${refundData.order_id}</p>
            <p><strong>Refund Amount:</strong> ₹${refundData.refund_amount}</p>
            <p><strong>Status:</strong> <span style="color: #d97706; font-weight: bold;">${refundData.status.toUpperCase()}</span></p>
            <p><strong>Payment Method:</strong> ${refundData.payment_method.toUpperCase()}</p>
            ${refundData.refund_mode ? `<p><strong>Refund Mode:</strong> ${refundData.refund_mode.toUpperCase()}</p>` : ''}
          </div>

          <div style="background: #fff5f5; padding: 20px; border-radius: 8px; border: 1px solid #feb2b2; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #c53030;">Reason for Refund</h3>
            <p style="white-space: pre-wrap;">${refundData.reason}</p>
          </div>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Customer Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0;"><strong>Name:</strong></td><td>${refundData.customer_name}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${refundData.customer_email}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Pickup Address:</strong></td><td>${refundData.pickup_address}</td></tr>
            </table>
          </div>

          ${refundData.refund_mode === 'upi' && refundData.upi_id ? `
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #93c5fd;">
            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">UPI Refund Details</h3>
            <p><strong>UPI ID:</strong> ${refundData.upi_id}</p>
          </div>
          ` : ''}

          ${refundData.refund_mode === 'bank' && refundData.bank_account_number ? `
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #93c5fd;">
            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Bank Refund Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0;"><strong>Account Holder:</strong></td><td>${refundData.bank_account_holder_name}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Account Number:</strong></td><td>${refundData.bank_account_number}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>IFSC Code:</strong></td><td>${refundData.bank_ifsc_code}</td></tr>
            </table>
          </div>
          ` : ''}

          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            Requested on: ${new Date(refundData.created_at).toLocaleString()}
          </p>
        </div>
      `;

    // Send via Brevo (admin notification only)
    return await sendBrevoEmail(
      adminEmail,
      `Refund Request #${refundData.id} - Order #${refundData.order_id}`,
      htmlContent
    );
  } catch (err) {
    console.error('Failed to send refund request email:', err);
    return { success: false, error: err };
  }
}
