-- Add cancellation fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_is_cancelled ON orders(is_cancelled);

-- Add comments
COMMENT ON COLUMN orders.is_cancelled IS 'Indicates if the order has been cancelled by user or admin';
COMMENT ON COLUMN orders.cancelled_at IS 'Timestamp when the order was cancelled';
COMMENT ON COLUMN orders.cancelled_by IS 'Email of user who cancelled the order';
COMMENT ON COLUMN orders.cancel_reason IS 'Reason for order cancellation';
