# Failed Orders Setup Guide

## Overview
This feature tracks failed order attempts where customers made online payments but the order failed during verification. This helps identify customers who need refunds or support.

## Database Setup

### 1. Create the Failed Orders Table
Run the SQL file in your Supabase dashboard:
```
supabase/create-failed-orders-table.sql
```

**Location**: SQL Editor in Supabase Dashboard
**What it does**: Creates a `failed_orders` table with all necessary fields and indexes

## Features Implemented

### 1. Backend (Order Processing)
- **Location**: `app/api/orders/route.ts`
- **Tracks failures for**:
  - Price verification mismatches
  - Razorpay signature verification failures
  - Payment amount mismatches
  - Invalid payment status

### 2. Admin API
- **Location**: `app/api/admin/failed-orders/route.ts`
- **Endpoints**:
  - `GET /api/admin/failed-orders` - Fetch all failed orders
  - `PATCH /api/admin/failed-orders` - Update failed order status

### 3. Admin Dashboard Tab
- **Location**: `app/admin/dashboard/page.jsx`
- **Features**:
  - View all failed orders in a table
  - Shows: Email, Date, Amount, Failure Reason, Status
  - Click "View Details" to see full information
  - Mark orders as resolved with admin notes

## Failed Order Details Modal Shows:
- ✅ Customer information (name, email, phone)
- ✅ Full shipping address
- ✅ Order items and prices
- ✅ Submitted vs Calculated totals
- ✅ Payment details (Razorpay payment ID, order ID)
- ✅ Failure reason and message
- ✅ Resolution status and admin notes
- ✅ Ability to mark as resolved

## Usage

### For Admins:
1. Go to Admin Dashboard
2. Click on "Failed Orders" tab
3. Review failed payment attempts
4. Click "View Details" to see complete information
5. Mark as resolved after handling refund/support

### Failure Reasons:
- **price_verification**: Frontend price didn't match database price
- **signature_verification**: Razorpay signature validation failed
- **amount_mismatch**: Payment amount didn't match order total
- **payment_status_invalid**: Payment not captured/authorized

## Customer Support Flow:
1. Check failed orders tab daily
2. For each pending failed order:
   - Verify payment was actually made (check Razorpay payment ID)
   - Contact customer via email/phone
   - Process refund if needed
   - Add admin notes explaining resolution
   - Mark as resolved

## Security Notes:
- Only logged-in admins can access this data
- Payment signatures are stored for verification purposes
- All timestamps are recorded for audit trail
