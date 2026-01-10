-- Create refund_requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  reason TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled')),
  refund_amount DECIMAL(10, 2),
  payment_method VARCHAR(50),
  refund_mode VARCHAR(50),
  upi_id VARCHAR(255),
  bank_account_number VARCHAR(100),
  bank_ifsc_code VARCHAR(20),
  bank_account_holder_name VARCHAR(255),
  admin_notes TEXT,
  processed_by VARCHAR(255),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_customer_email ON refund_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON refund_requests(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_refund_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_refund_requests_updated_at
  BEFORE UPDATE ON refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_refund_requests_updated_at();

-- Add comments for documentation
COMMENT ON TABLE refund_requests IS 'Stores customer refund requests for delivered orders';
COMMENT ON COLUMN refund_requests.id IS 'Unique identifier for the refund request';
COMMENT ON COLUMN refund_requests.order_id IS 'Reference to the order being refunded';
COMMENT ON COLUMN refund_requests.customer_email IS 'Email of the customer requesting refund';
COMMENT ON COLUMN refund_requests.customer_name IS 'Name of the customer';
COMMENT ON COLUMN refund_requests.reason IS 'Reason for requesting the refund';
COMMENT ON COLUMN refund_requests.pickup_address IS 'Address where the product should be collected';
COMMENT ON COLUMN refund_requests.status IS 'Current status of the refund request';
COMMENT ON COLUMN refund_requests.refund_amount IS 'Amount to be refunded';
COMMENT ON COLUMN refund_requests.payment_method IS 'Original payment method used for the order';
COMMENT ON COLUMN refund_requests.razorpay_payment_id IS 'Razorpay payment ID from the original order';
COMMENT ON COLUMN refund_requests.refund_mode IS 'Mode for refund: upi or bank';
COMMENT ON COLUMN refund_requests.upi_id IS 'Customer UPI ID for refund';
COMMENT ON COLUMN refund_requests.bank_account_number IS 'Customer bank account number for refund';
COMMENT ON COLUMN refund_requests.bank_ifsc_code IS 'Customer bank IFSC code for refund';
COMMENT ON COLUMN refund_requests.bank_account_holder_name IS 'Bank account holder name';
COMMENT ON COLUMN refund_requests.admin_notes IS 'Internal notes from admin regarding the refund';
COMMENT ON COLUMN refund_requests.processed_by IS 'Admin user who processed the refund';
COMMENT ON COLUMN refund_requests.processed_at IS 'Timestamp when the refund was processed';
COMMENT ON COLUMN refund_requests.created_at IS 'Timestamp when the refund request was created';
COMMENT ON COLUMN refund_requests.updated_at IS 'Timestamp when the refund request was last updated';
