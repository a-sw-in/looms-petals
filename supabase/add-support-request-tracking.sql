-- Add support request tracking columns to failed_orders table
ALTER TABLE failed_orders 
ADD COLUMN IF NOT EXISTS support_request_submitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS support_request_submitted_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN failed_orders.support_request_submitted IS 'Whether customer has submitted a support request for this failed order';
COMMENT ON COLUMN failed_orders.support_request_submitted_at IS 'Timestamp when support request was submitted';
