# 🧪 Security Testing Guide - Order & Payment Flow

## ⚡ Quick Test Checklist

### **Test 1: Fake Payment Prevention** 🔴 CRITICAL

**Objective:** Verify system rejects fake payment IDs

```bash
# Attack Simulation
POST /api/orders
{
  "paymentDetails": {
    "razorpay_payment_id": "fake_12345",
    "razorpay_order_id": "order_real",
    "razorpay_signature": "invalid_signature"
  }
}

Expected: ❌ 400 "Payment verification failed: Invalid signature"
```

**Manual Test:**
1. Open checkout page
2. Open browser DevTools → Network tab
3. Start Razorpay payment
4. Cancel payment window
5. Try to manually send order request with fake payment_id
6. **Should FAIL with error**

✅ **PASS:** Order rejected  
❌ **FAIL:** Order created → **CRITICAL BUG**

---

### **Test 2: Price Manipulation** 🔴 CRITICAL

**Objective:** Verify server recalculates prices

```bash
# Attack Simulation (Browser Console)
# Original: Saree ₹5,000 x 1 = ₹5,000
# Modified: Saree ₹1 x 1 = ₹1

fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [{ id: 1, price: 1, quantity: 1 }],  // Fake price
    total: 1  // Should be 5000
  })
})

Expected: ❌ 400 "Price verification failed"
```

**Manual Test:**
1. Add ₹5,000 saree to cart
2. Open DevTools → Console
3. Paste attack code above
4. **Should FAIL with price mismatch error**

✅ **PASS:** Order rejected  
❌ **FAIL:** Order created with ₹1 → **CRITICAL BUG**

---

### **Test 3: Stock Overselling** 🟠 HIGH RISK

**Objective:** Prevent ordering out-of-stock items

```bash
# Scenario: Product has 1 item in stock
# 5 people try to order simultaneously

Expected: 
- Person 1: ✅ Order succeeds
- Person 2-5: ❌ "Insufficient stock"
```

**Manual Test:**
1. Set product stock to 1 in admin panel
2. Open checkout in 2 browser tabs
3. Add item to cart in both tabs
4. Click "Place Order" in both tabs simultaneously
5. **Only ONE order should succeed**

✅ **PASS:** Only 1 order created, stock = 0  
❌ **FAIL:** Both orders created, stock = -1 → **HIGH RISK BUG**

---

### **Test 4: Duplicate Order Prevention** 🟡 MEDIUM RISK

**Objective:** Prevent accidental double submissions

```bash
# Scenario: User clicks "Place Order" 5 times rapidly

Expected:
- Click 1: ✅ Order created
- Clicks 2-5: ❌ "Duplicate order detected"
```

**Manual Test:**
1. Complete checkout form
2. Open DevTools → Network tab
3. Click "Place Order" button 5 times quickly
4. **Only 1 order should be created**
5. Wait 1 minute, try again → Should work

✅ **PASS:** Only 1 order created  
❌ **FAIL:** 5 orders created → **CUSTOMER COMPLAINT**

---

### **Test 5: Rate Limiting** 🟡 MEDIUM RISK

**Objective:** Prevent spam/DDoS on order endpoint

```bash
# Scenario: 35 order attempts in 1 minute

Expected:
- Attempts 1-30: ✅ Processed
- Attempts 31-35: ❌ 429 "Too many attempts"
```

**Manual Test:**
1. Write a simple script to submit 35 orders
2. Run in 1 minute
3. **After 30 attempts, should get rate limited**

```javascript
// Quick test script
for (let i = 0; i < 35; i++) {
  fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ test: true })
  }).then(r => console.log(i, r.status));
}
```

✅ **PASS:** Requests 31-35 return 429  
❌ **FAIL:** All 35 processed → **DDoS VULNERABLE**

---

### **Test 6: Payment Amount Verification** 🔴 CRITICAL

**Objective:** Ensure payment amount matches order

```bash
# Scenario: 
# - Create Razorpay order for ₹5,000
# - Complete payment for ₹100
# - Try to create order with ₹5,000 payment_id

Expected: ❌ "Payment amount verification failed"
```

**Manual Test:**
1. Complete real Razorpay test payment
2. Note the payment_id
3. Try to use it for higher-value order
4. **Should detect amount mismatch**

✅ **PASS:** Order rejected  
❌ **FAIL:** Order created → **REVENUE LOSS**

---

## 🚀 Automated Test Suite

**Create:** `tests/security/fraud-prevention.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';

describe('Fraud Prevention', () => {
  it('should reject fake payment signatures', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        paymentDetails: {
          razorpay_payment_id: 'fake',
          razorpay_order_id: 'fake',
          razorpay_signature: 'fake'
        }
      })
    });
    
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: expect.stringContaining('verification failed')
    });
  });

  it('should recalculate prices server-side', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: 1, price: 1, quantity: 1 }], // Fake price
        total: 1
      })
    });
    
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      message: expect.stringContaining('Price verification')
    });
  });

  // Add more tests...
});
```

---

## 📋 **Pre-Launch Security Checklist**

### Environment Variables
- [ ] `RAZORPAY_KEY_ID` is set
- [ ] `RAZORPAY_KEY_SECRET` is set (never expose!)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-side only

### Payment Testing (Razorpay Test Mode)
- [ ] Test successful payment flow
- [ ] Test failed payment (declined card)
- [ ] Test payment cancellation
- [ ] Verify order only created on success
- [ ] Check payment status in Razorpay dashboard

### Stock Management
- [ ] Order with stock = 0 → Rejected
- [ ] Order reduces stock immediately
- [ ] Failed order restores stock
- [ ] Concurrent orders don't oversell

### Security
- [ ] Cannot modify prices via DevTools
- [ ] Cannot submit fake payment_id
- [ ] Cannot create duplicate orders
- [ ] Rate limiting works (30/min)
- [ ] All errors logged properly

### Email Notifications
- [ ] Admin receives order notification
- [ ] Order details are correct
- [ ] Email contains payment status
- [ ] Brevo API key configured

---

## 🐛 **Common Issues & Solutions**

### Issue 1: "Payment verification failed"
**Cause:** Razorpay test keys not configured  
**Fix:** Add `RAZORPAY_KEY_SECRET` to `.env.local`

### Issue 2: "Price verification failed"
**Cause:** Frontend cart has old cached prices  
**Fix:** Clear cart and refresh page

### Issue 3: "Insufficient stock"
**Cause:** Product actually out of stock  
**Fix:** Update stock in admin panel or database

### Issue 4: Rate limit hit during testing
**Cause:** Too many test requests  
**Fix:** Wait 1 minute or restart dev server

---

## 🔒 **Production Deployment Checklist**

```bash
# 1. Verify environment variables
echo $RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# 2. Test in Razorpay test mode
npm run dev
# Complete test order

# 3. Switch to live mode (production only!)
# Update keys to live keys in production .env

# 4. Deploy
git push origin main
# Vercel auto-deploys

# 5. Post-deploy verification
# Place real test order
# Verify in Razorpay dashboard
# Check admin email received
# Confirm stock decremented
```

---

## ✅ **Success Criteria**

Your site is ready for launch when:

- ✅ All 6 manual tests pass
- ✅ Payment verification works with Razorpay test mode
- ✅ Price manipulation is blocked
- ✅ Stock overselling is prevented
- ✅ Duplicate orders are rejected
- ✅ Rate limiting works
- ✅ Admin emails are received
- ✅ Zero TypeScript errors
- ✅ Zero console errors during checkout

**Expected Test Results:**
- ✅ **6/6 tests passing**
- ✅ **0 vulnerabilities** (npm audit)
- ✅ **100% fraud prevention**

---

## 📊 **Monitoring After Launch**

**Daily Checks:**
1. Review failed payment logs
2. Check for price mismatch errors
3. Monitor stock discrepancies
4. Review duplicate order rejections

**Weekly:**
1. Audit successful orders
2. Verify payment amounts match order totals
3. Check for unusual patterns

**Monthly:**
1. Review security logs
2. Update dependencies (npm audit)
3. Test fraud scenarios again

---

**Current Status:** 🟢 **Ready for Testing**  
**Next Step:** Run manual tests above  
**Target:** 6/6 tests passing before launch

Good luck! 🚀
