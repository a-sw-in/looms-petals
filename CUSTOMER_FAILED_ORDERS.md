# Customer Failed Orders Feature

## Overview
Customers can now view their failed order attempts and raise support requests directly through the platform.

## Implementation

### 1. **Customer Failed Orders Page** 
   - **Path**: `/failed-orders`
   - **Access**: Only logged-in users
   - **Features**:
     - Lists all failed order attempts for the logged-in user
     - Shows price, date, and failure reason
     - Click to view full details
     - Raise support requests with custom messages

### 2. **API Endpoints**

#### Get User's Failed Orders
- **Endpoint**: `GET /api/users/failed-orders?email={email}`
- **Returns**: List of failed orders for the user's email

#### Submit Support Request
- **Endpoint**: `POST /api/users/failed-orders/support-request`
- **Body**:
  ```json
  {
    "failedOrderId": number,
    "customerName": string,
    "customerEmail": string,
    "customerMessage": string,
    "failedOrderDetails": object
  }
  ```
- **Action**: Sends email to admin via Brevo with full details

### 3. **My Orders Page Enhancement**
- **Added**: "Failed Orders" button in top right
- **Styling**: Warning-colored button with alert icon
- **Action**: Navigates to `/failed-orders` page

## User Flow

1. **View Failed Orders**
   - User goes to My Orders page
   - Clicks "Failed Orders" button
   - Sees list of all failed attempts

2. **View Details**
   - Click on any failed order
   - Modal opens showing:
     - Failure reason and message
     - Order amount and date
     - Products in cart
     - Payment information (if available)

3. **Raise Support Request**
   - In the modal, scroll to "Raise a Support Request" section
   - Type message describing the issue
   - Click "Submit Support Request"
   - Email sent to admin with all details

4. **Admin Receives Email**
   - Formatted HTML email via Brevo
   - Contains all customer and order information
   - Includes customer's message
   - Reply-to set to customer's email
   - Next steps guidance included

## Email Content Sent to Admin

- **Subject**: Failed Order Support Request - ID #{failedOrderId}
- **Includes**:
  - Customer information (name, email, phone)
  - Failed order details (ID, date, amount, failure reason)
  - Payment information (Razorpay IDs if available)
  - Customer's support message
  - Suggested next steps for resolution

## Environment Variables Required

```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@loomspetals.com
BREVO_SENDER_NAME=Looms & Petals
ADMIN_EMAIL=admin@loomspetals.com
```

## Security Features

- Only authenticated users can view their own failed orders
- Email verification matches logged-in user
- Support requests include full audit trail
- Admin receives all context for verification

## UI Features

- **Responsive design** - Works on mobile and desktop
- **Color-coded alerts** - Yellow/warning theme for failed orders
- **Smooth animations** - Hover effects and transitions
- **Clear messaging** - User-friendly explanations
- **Inline help** - Instructions for raising requests

## Customer Benefits

1. **Transparency** - See exactly what went wrong
2. **Self-service** - Raise support requests without calling
3. **Tracking** - View all failed attempts in one place
4. **Quick resolution** - Direct communication with support team
5. **Payment proof** - Payment IDs included for verification
