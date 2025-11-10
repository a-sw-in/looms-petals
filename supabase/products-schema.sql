-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  image_url TEXT,
  images JSONB DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  sizes JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT
  USING (is_active = true);

-- Admin can do everything
CREATE POLICY "Admin can manage products" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Create admin_sessions table for admin auth
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);

-- Sample products data (optional)
INSERT INTO products (name, description, price, discount_price, category, brand, image_url, stock, is_featured) VALUES
('Elegant Silk Saree', 'Beautiful handwoven silk saree with intricate designs', 5999.00, 4999.00, 'Sarees', 'Traditional Weaves', 'https://picsum.photos/seed/saree1/400/600', 15, true),
('Designer Lehenga', 'Stunning bridal lehenga with heavy embroidery', 15999.00, 12999.00, 'Lehengas', 'Royal Collection', 'https://picsum.photos/seed/lehenga1/400/600', 8, true),
('Gold Plated Necklace', 'Elegant gold plated necklace set', 2999.00, 2499.00, 'Jewelry', 'Looms & Petals', 'https://picsum.photos/seed/jewelry1/400/600', 25, false),
('Banarasi Saree', 'Pure banarasi silk saree in rich colors', 7999.00, 6999.00, 'Sarees', 'Traditional Weaves', 'https://picsum.photos/seed/saree2/400/600', 12, true);
