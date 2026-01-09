-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- Optional if we allow guest checkout, but usually good to link
  
  -- Customer Details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Address
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- Order Details
  items JSONB NOT NULL, -- Stores snapshot of items: [{id, name, quantity, price, ...}]
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  order_status TEXT DEFAULT 'processing', -- processing, shipped, delivered, cancelled
  
  -- Metadata
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow users to view their own orders (if we had auth fully integrated for customers)
-- For now, maybe allow anon insert for guest checkout flow if Supabase Auth isn't strict?
-- NOTE: In a real app, you'd stricter policies.
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (true); -- simplified for demo; ideally auth.uid() = user_id OR public if guest

-- Admin policies (assuming admin role or similar)
-- This might need adjustment based on your specific auth setup
-- CREATE POLICY "Admins can view all orders" ON orders ...
