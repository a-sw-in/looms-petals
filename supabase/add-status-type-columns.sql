-- Add status and type columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'normal' CHECK (status IN ('normal', 'trending', 'featured', 'most_bought', 'new_arrival', 'sale')),
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'clothing' CHECK (type IN ('clothing', 'jewelry', 'accessories', 'footwear'));

-- Create indexes for better filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- Update existing products to have default values
UPDATE products SET status = 'normal' WHERE status IS NULL;
UPDATE products SET type = 'clothing' WHERE type IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('status', 'type')
ORDER BY ordinal_position;

-- Show all products with new columns
SELECT id, name, category, status, type, is_featured, created_at FROM products LIMIT 10;
