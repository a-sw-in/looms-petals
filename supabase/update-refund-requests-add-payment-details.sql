-- Add payment details columns to existing refund_requests table
-- Run this if the table already exists without these columns
-- Note: razorpay_payment_id and razorpay_order_id are fetched from orders table via JOIN

ALTER TABLE refund_requests 
ADD COLUMN IF NOT EXISTS refund_mode VARCHAR(50),
ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS bank_account_holder_name VARCHAR(255);

-- Add comments for the new columns
COMMENT ON COLUMN refund_requests.refund_mode IS 'Mode for refund: upi or bank (for COD orders)';
COMMENT ON COLUMN refund_requests.upi_id IS 'Customer UPI ID for refund (COD orders)';
COMMENT ON COLUMN refund_requests.bank_account_number IS 'Customer bank account number for refund (COD orders)';
COMMENT ON COLUMN refund_requests.bank_ifsc_code IS 'Customer bank IFSC code for refund (COD orders)';
COMMENT ON COLUMN refund_requests.bank_account_holder_name IS 'Bank account holder name (COD orders)';

