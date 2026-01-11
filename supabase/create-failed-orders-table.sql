-- Create failed_orders table to track payment verification failures
-- This helps identify customers who paid but order failed due to verification issues
CREATE TABLE IF NOT EXISTS failed_orders (
  id SERIAL PRIMARY KEY,
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  
  -- Shipping Address
  shipping_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  
  -- Order Details
  items JSONB NOT NULL,
  submitted_total DECIMAL(10, 2) NOT NULL,
  calculated_total DECIMAL(10, 2),
  
  -- Payment Information
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature TEXT,
  payment_amount INTEGER, -- Amount in paise from Razorpay
  
  -- Failure Information
  failure_reason VARCHAR(100) NOT NULL, -- 'price_verification', 'signature_verification', 'amount_mismatch', 'payment_status_invalid'
  failure_message TEXT,
  
  -- Metadata
  user_id INTEGER,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  support_request_submitted BOOLEAN DEFAULT false,
  support_request_submitted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_failed_orders_email ON failed_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_failed_orders_phone ON failed_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_failed_orders_razorpay_payment ON failed_orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_failed_orders_created_at ON failed_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_orders_resolved ON failed_orders(resolved);
CREATE INDEX IF NOT EXISTS idx_failed_orders_failure_reason ON failed_orders(failure_reason);

-- Add comment to table
COMMENT ON TABLE failed_orders IS 'Tracks failed order attempts where customer paid online but order failed verification';
COMMENT ON COLUMN failed_orders.failure_reason IS 'Type of failure: price_verification, signature_verification, amount_mismatch, payment_status_invalid';
COMMENT ON COLUMN failed_orders.resolved IS 'Whether admin has reviewed and resolved this failed order';
