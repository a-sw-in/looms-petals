import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const { amount, currency } = await request.json();

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
                { success: false, message: 'Razorpay API keys not configured' },
                { status: 500 }
            );
        }

        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        return NextResponse.json({
            success: true,
            orderId: order.id,
        });
    } catch (error) {
        console.error('Razorpay Order creation error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
