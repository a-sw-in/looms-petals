import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '@/lib/nodemailer';

// Brevo API helper for admin emails
async function sendBrevoEmail(to: string, subject: string, htmlContent: string, replyTo?: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (!brevoApiKey) {
    console.warn('BREVO_API_KEY not set');
    return { success: false };
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
          name: 'Looms & Petals Contact',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@loomsandpetals.com',
        },
        to: [{ email: to }],
        replyTo: replyTo ? { email: replyTo } : undefined,
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    return { success: response.ok };
  } catch (err) {
    console.error('Brevo email error:', err);
    return { success: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Admin email from environment variable
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;

    if (!adminEmail) {
      console.error('Admin email not configured');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const transporter = createTransporter();

    // Admin HTML content
    const adminHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 12px 12px 0 0; 
          }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .info-row { 
            display: flex; 
            padding: 15px; 
            border-bottom: 1px solid #f0f0f0; 
            align-items: center;
          }
          .info-row:last-child { border-bottom: none; }
          .info-label { 
            font-weight: 600; 
            color: #667eea; 
            min-width: 120px;
            display: inline-block;
          }
          .info-value { color: #333; }
          .message-box { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 20px;
            border-left: 4px solid #667eea;
          }
          .message-box h3 { 
            margin-top: 0; 
            color: #667eea;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .message-content { 
            color: #555; 
            line-height: 1.8;
            white-space: pre-wrap;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #999; 
            font-size: 13px; 
          }
          .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Looms & Petals - Contact Form</p>
          </div>
          <div class="content">
            <div style="margin-bottom: 20px;">
              <span class="badge">${subject}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">👤 Name:</span>
              <span class="info-value">${name}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">📧 Email:</span>
              <span class="info-value"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></span>
            </div>
            
            ${phone ? `
            <div class="info-row">
              <span class="info-label">📱 Phone:</span>
              <span class="info-value"><a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a></span>
            </div>
            ` : ''}
            
            <div class="info-row">
              <span class="info-label">📋 Subject:</span>
              <span class="info-value">${subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
            </div>
            
            <div class="message-box">
              <h3>💬 Message</h3>
              <div class="message-content">${message}</div>
            </div>
            
            <div class="footer">
              <p><strong>Quick Reply:</strong> You can reply directly to this email to respond to ${name}</p>
              <p style="margin-top: 10px;">Received on ${new Date().toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full',
                timeStyle: 'short'
              })}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin via Brevo
    await sendBrevoEmail(
      adminEmail,
      `New Contact Form Submission: ${subject}`,
      adminHtmlContent,
      email
    );

    // User confirmation email disabled - can be enabled later
    // const userMailOptions = {
    //   from: `"Looms & Petals" <${process.env.GMAIL_USER}>`,
    //   to: email,
    //   subject: 'Thank you for contacting Looms & Petals',
    //   html: `...`
    // };
    // await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending contact form:', error);
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
