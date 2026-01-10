-- Add Razorpay payment tracking fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Add index for faster lookups by Razorpay order ID
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Add comment for documentation
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay Order ID for online payments';
COMMENT ON COLUMN orders.razorpay_payment_id IS 'Razorpay Payment ID after successful payment';
COMMENT ON COLUMN orders.razorpay_signature IS 'Razorpay signature for payment verification';
