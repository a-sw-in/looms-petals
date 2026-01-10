-- ============================================
-- CLEANUP AND FIX RLS POLICIES
-- ============================================
-- This script removes all conflicting policies and applies the correct ones
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies to start fresh
-- ============================================

-- Drop orders policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Orders must use API" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Orders cannot be updated directly" ON orders;
DROP POLICY IF EXISTS "Orders cannot be deleted directly" ON orders;

-- Drop products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Products cannot be inserted directly" ON products;
DROP POLICY IF EXISTS "Products cannot be updated directly" ON products;
DROP POLICY IF EXISTS "Products cannot be deleted directly" ON products;
DROP POLICY IF EXISTS "Service role full access" ON products;

-- Drop refund_requests policies
DROP POLICY IF EXISTS "Refunds must use API" ON refund_requests;
DROP POLICY IF EXISTS "Users can view own refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Refunds cannot be updated directly" ON refund_requests;
DROP POLICY IF EXISTS "Refunds cannot be deleted directly" ON refund_requests;

-- Drop faqs policies
DROP POLICY IF EXISTS "Allow public read access" ON faqs;
DROP POLICY IF EXISTS "Allow admin insert" ON faqs;
DROP POLICY IF EXISTS "Allow admin update" ON faqs;
DROP POLICY IF EXISTS "Allow admin delete" ON faqs;

-- Drop admin_sessions policies
DROP POLICY IF EXISTS "Service role can manage sessions" ON admin_sessions;

-- Step 2: Apply CORRECT policies only
-- ============================================

-- ORDERS TABLE POLICIES
-- ============================================

-- Allow users to view their own orders (by email)
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (
  customer_email = (current_setting('request.jwt.claims', true)::json->>'email')
);

-- Block direct INSERT - must use API with service role
CREATE POLICY "Orders must use API"
ON orders FOR INSERT
WITH CHECK (false);

-- Block direct UPDATE - must use API with service role
CREATE POLICY "Orders cannot be updated directly"
ON orders FOR UPDATE
WITH CHECK (false);

-- Block direct DELETE - must use API with service role
CREATE POLICY "Orders cannot be deleted directly"
ON orders FOR DELETE
USING (false);


-- PRODUCTS TABLE POLICIES
-- ============================================

-- Allow everyone to view active products only
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (is_active = true);

-- Block direct INSERT - must use API with service role
CREATE POLICY "Products cannot be inserted directly"
ON products FOR INSERT
WITH CHECK (false);

-- Block direct UPDATE - must use API with service role
CREATE POLICY "Products cannot be updated directly"
ON products FOR UPDATE
WITH CHECK (false);

-- Block direct DELETE - must use API with service role
CREATE POLICY "Products cannot be deleted directly"
ON products FOR DELETE
USING (false);


-- REFUND_REQUESTS TABLE POLICIES
-- ============================================

-- Allow users to view their own refund requests
CREATE POLICY "Users can view own refund requests"
ON refund_requests FOR SELECT
USING (
  customer_email = (current_setting('request.jwt.claims', true)::json->>'email')
);

-- Block direct INSERT - must use API with service role
CREATE POLICY "Refunds must use API"
ON refund_requests FOR INSERT
WITH CHECK (false);

-- Block direct UPDATE - must use API with service role
CREATE POLICY "Refunds cannot be updated directly"
ON refund_requests FOR UPDATE
WITH CHECK (false);

-- Block direct DELETE - must use API with service role
CREATE POLICY "Refunds cannot be deleted directly"
ON refund_requests FOR DELETE
USING (false);


-- Step 3: Verify RLS is enabled on all tables
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Note: FAQs and admin_sessions can be managed through API routes
-- If you want RLS on these tables, uncomment below:

-- ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public can read FAQs" ON faqs FOR SELECT USING (true);
-- CREATE POLICY "FAQs must use API for changes" ON faqs FOR ALL USING (false);

-- ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Sessions must use API" ON admin_sessions FOR ALL USING (false);


-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your policies are correct:

-- Check active policies
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('orders', 'products', 'refund_requests');
