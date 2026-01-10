# Gmail Setup Guide for Nodemailer

## 📧 How to Configure Gmail for OTP Emails

### Step 1: Create a Gmail App Password

1. Go to your **Google Account**: https://myaccount.google.com/
2. Navigate to **Security** (left sidebar)
3. Scroll down to **"How you sign in to Google"**
4. Click on **"2-Step Verification"**
   - If not enabled, enable it first (required for App Passwords)
5. Scroll to bottom and click **"App passwords"**
6. Create a new app password:
   - App name: `Looms Petals OTP`
   - Click **Generate**
   - Copy the 16-character password (shown once only)

### Step 2: Add to .env.local

Add these variables to your `.env.local` file:

```env
# Gmail Configuration for OTP Emails
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Example:**
```env
GMAIL_USER=loomspetals@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ What Changed

### Files Modified:
1. **lib/nodemailer.ts** (NEW)
   - Gmail transporter configuration
   - Beautiful OTP email template
   - Handles email sending with error handling

2. **app/api/auth/send-otp/route.ts**
   - Replaced Resend API with Nodemailer
   - Now sends to ANY email address (not just verified)

3. **app/api/auth/forgot-password/route.ts**
   - Replaced Resend SDK with Nodemailer
   - Sends password reset OTPs to any user

### Old Environment Variables (Can Remove):
```env
# RESEND_API_KEY=re_xxxxx    ❌ No longer needed
# EMAIL_FROM=onboarding@...  ❌ No longer needed
```

---

## 📊 Benefits

| Feature | Resend (Free) | Nodemailer + Gmail |
|---------|---------------|-------------------|
| Daily Limit | 100 emails | 500 emails |
| Recipients | Only verified | **Any email** ✅ |
| Cost | Free tier | **Completely free** ✅ |
| Setup | API key | Gmail password |

---

## 🧪 Testing

1. Try registering with a new email
2. Check if OTP arrives in inbox/spam
3. Test forgot password flow
4. Verify OTP works correctly

---

## 🚨 Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Check 2-Step Verification is enabled

### Emails not sending
- Check `.env.local` has both `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- Restart development server after adding env variables
- Check console logs for error messages

### Emails going to spam
- Normal for new sending domains
- Ask users to check spam folder
- Mark as "Not Spam" to improve deliverability

---

## 📝 Notes

- Gmail allows **500 emails per day** for free accounts
- Emails are sent from your Gmail address
- No payment or verification required
- Works immediately after setup
