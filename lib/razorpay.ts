import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature
 * @returns boolean indicating if signature is valid
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return false;
    }

    // Create the expected signature
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 * @param body - Raw request body
 * @param signature - Webhook signature from header
 * @returns boolean indicating if webhook is valid
 */
export function verifyRazorpayWebhook(
  body: string,
  signature: string
): boolean {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return false;
    }

    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

/**
 * Create Razorpay order with validation
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, string>
) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    // Validate amount (should be in paise/cents)
    if (amount < 100) {
      throw new Error('Amount must be at least ₹1 (100 paise)');
    }

    if (amount > 1000000000) {
      throw new Error('Amount exceeds maximum limit');
    }

    // Create order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount), // Ensure integer
        currency,
        receipt,
        notes: notes || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay API error: ${error.error?.description || 'Unknown error'}`);
    }

    const order = await response.json();
    return { success: true, order };
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchRazorpayPayment(paymentId: string) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment details');
    }

    const payment = await response.json();
    return { success: true, payment };
  } catch (error: any) {
    console.error('Razorpay payment fetch error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Initiate refund
 */
export async function initiateRazorpayRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const body: any = {
      notes: notes || {},
    };

    // If amount specified, it's a partial refund
    if (amount) {
      body.amount = Math.round(amount);
    }

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Refund failed: ${error.error?.description || 'Unknown error'}`);
    }

    const refund = await response.json();
    return { success: true, refund };
  } catch (error: any) {
    console.error('Razorpay refund error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate payment amount matches order amount
 */
export function validatePaymentAmount(
  expectedAmount: number,
  receivedAmount: number,
  tolerance: number = 0 // Allow 0 difference by default
): boolean {
  const difference = Math.abs(expectedAmount - receivedAmount);
  return difference <= tolerance;
}
