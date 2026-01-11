# Brevo (Sendinblue) Email Setup Guide

## Why Brevo for Admin Emails?

✅ **9,000 FREE emails/month** (300/day)  
✅ Professional email delivery  
✅ Better than Resend's 3,000/month free tier  
✅ No credit card required for free tier  

---

## Setup Steps

### 1. Create Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click **Sign up free**
3. Fill in your details:
   - Email: `aswinsanthoshachus@gmail.com`
   - Company: `Looms & Petals`
4. Verify your email

### 2. Get API Key

1. Log into Brevo dashboard
2. Click your name (top right) → **SMTP & API**
3. Click **Create a new API key**
4. Name it: `Looms-Petals-Admin-Emails`
5. Copy the API key (starts with `xkeysib-...`)

### 3. Configure Sender Email

1. In Brevo dashboard, go to **Senders & IP**
2. Click **Add a sender**
3. Use one of these options:

   **Option A: Use your Gmail (Recommended for testing)**
   ```
   Email: aswinsanthoshachus@gmail.com
   Name: Looms & Petals
   ```

   **Option B: Use custom domain (For production)**
   ```
   Email: admin@loomsandpetals.com
   Name: Looms & Petals Admin
   ```

4. Verify the sender email (check your inbox)

### 4. Update .env.local

```env
# Replace 'your_brevo_api_key_here' with actual key
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=aswinsanthoshachus@gmail.com
```

---

## Email Flow Configuration

### Current Setup:

| Email Type | Service | Recipient | Limit |
|------------|---------|-----------|-------|
| **OTP/Verification** | Nodemailer (Gmail) | User | 500/day |
| **Order Confirmation** | Nodemailer (Gmail) | User | 500/day |
| **Order Notification** | Brevo | Admin | 300/day |
| **Contact Form** | Brevo | Admin | 300/day |
| **FAQ/Issue Report** | Brevo | Admin | 300/day |

### Advantages:

- ✅ User emails (OTP, confirmations) use Gmail = More personal, better inbox delivery
- ✅ Admin notifications use Brevo = Higher limits, professional tracking
- ✅ Combined: **500 user emails + 300 admin emails per day**
- ✅ Totally FREE!

---

## Testing

After setup, test the contact form:

1. Go to `http://localhost:3000/contact`
2. Fill out the form and submit
3. Check these:
   - ✅ User receives confirmation email (via Gmail)
   - ✅ Admin receives notification at `aswinsanthoshachus@gmail.com` (via Brevo)
   - ✅ Check Brevo dashboard for delivery stats

---

## Brevo Dashboard Features

- 📊 **Statistics**: Track email delivery, opens, clicks
- 📧 **Email logs**: See all sent emails
- 🚫 **Blacklist**: Manage bounced emails
- 📱 **SMS**: 20 free SMS credits included!

---

## Troubleshooting

### "BREVO_API_KEY not set" error
- Make sure you've added the API key to `.env.local`
- Restart your dev server: `npm run dev`

### Emails not arriving
- Check Brevo dashboard → **Logs** → **Email Activity**
- Verify sender email is confirmed in Brevo
- Check spam folder

### Rate limit exceeded
- Free tier: 300 emails/day, 9,000/month
- Upgrade to paid plan if needed (starts at $25/month for 20,000 emails)

---

## Need More Emails?

If you exceed limits, consider:

1. **Brevo Paid**: $25/month for 20,000 emails
2. **SendGrid**: $19.95/month for 50,000 emails
3. **Use both services**: Gmail (user) + Brevo (admin) = Best of both worlds!

---

## Files Modified

- ✅ `lib/email.ts` - Added Brevo for admin emails
- ✅ `app/api/contact/route.ts` - Brevo for admin, Gmail for users
- ✅ `.env.local` - Added Brevo configuration
- ✅ `.env.example` - Updated template

---

**Your admin email (`aswinsanthoshachus@gmail.com`) will now receive:**
- Order notifications
- Contact form submissions  
- FAQ/Help requests

All via Brevo's reliable infrastructure! 🎉
