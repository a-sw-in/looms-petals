// app/components/ProductCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/products/products.module.css'; // Reusing the same styles

// Define the Product type matching your data structure
type Product = {
  id: number;
  slug: string;
  name: string;
  images: string | string[]; // Can be JSON string or array
  price: number;
  discount_price?: number | null;
  stock: number;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();

  if (!product) {
    return null;
  }

  const handleProductClick = () => {
    const slug = product.slug || product.id;
    router.push(`/product/${slug}`);
  };

  const displayPrice = product.discount_price ?? product.price;
  const originalPrice = product.discount_price ? product.price : null;
  
  // Get image URL - image_url is ALSO a JSON string!
  let imageUrl = '';
  
  if ((product as any).image_url) {
    const rawImageUrl = (product as any).image_url;
    if (typeof rawImageUrl === 'string') {
      try {
        const parsed = JSON.parse(rawImageUrl);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imageUrl = parsed[0];
        } else {
          imageUrl = rawImageUrl;
        }
      } catch {
        imageUrl = rawImageUrl;
      }
    } else if (Array.isArray(rawImageUrl) && rawImageUrl.length > 0) {
      imageUrl = rawImageUrl[0];
    }
  }

  return (
    <div className={styles.productCard} onClick={handleProductClick}>
      <div className={styles.imageWrapper} style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {product.stock === 0 && <div className={styles.outOfStock}>Out of Stock</div>}
      </div>
      <div className={styles.details}>
        <h3 className={styles.productName}>{product.name}</h3>
        <div className={styles.priceContainer}>
          <p className={styles.price}>₹{displayPrice.toLocaleString()}</p>
          {originalPrice && (
            <p className={styles.originalPrice}>₹{originalPrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
