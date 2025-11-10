"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./BrandProducts.module.css";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  category: string;
  brand: string;
  image_url: string;
  stock: number;
  status: string;
  type: string;
};

export default function BrandProductsPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    const fetchBrandProducts = async () => {
      try {
        const response = await fetch("/api/admin/products");
        const data = await response.json();

        if (data.success) {
          // Decode brand name from slug
          const slug = params.brandSlug as string;
          const decodedBrand = decodeURIComponent(slug.replace(/-/g, ' '));
          
          // Filter products by brand (case-insensitive)
          const brandProducts = data.data.filter(
            (product: Product) => 
              product.brand?.toLowerCase() === decodedBrand.toLowerCase()
          );

          if (brandProducts.length > 0) {
            setBrandName(brandProducts[0].brand);
            setProducts(brandProducts);
          } else {
            // Brand not found, redirect back
            router.push('/brands');
          }
        }
      } catch (error) {
        console.error("Failed to fetch brand products:", error);
        router.push('/brands');
      } finally {
        setLoading(false);
      }
    };

    if (params.brandSlug) {
      fetchBrandProducts();
    }
  }, [params.brandSlug, router]);

  const handleProductClick = (product: Product) => {
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    router.push(`/product/${slug}-${product.id}`);
  };

  // Helper function to parse image URL
  const getImageUrl = (imageUrl: string, productId: number) => {
    if (!imageUrl) return `https://picsum.photos/seed/${productId}/600/700`;
    
    try {
      const parsed = JSON.parse(imageUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
      return imageUrl;
    } catch {
      return imageUrl;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.skeleton} style={{ width: '200px', height: '40px' }} />
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.productCard} style={{ background: "#f0f0f0" }}>
              <div style={{ height: "100%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        ← Back to Brands
      </button>

      <div className={styles.header}>
        <h1 className={styles.brandTitle}>{brandName}</h1>
        <p className={styles.productCount}>{products.length} Products Available</p>
      </div>

      <div className={styles.grid}>
        {products.map((product) => {
          const discount = product.discount_price
            ? Math.round(((product.price - product.discount_price) / product.price) * 100)
            : 0;

          return (
            <div
              key={product.id}
              className={styles.productCard}
              onClick={() => handleProductClick(product)}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={getImageUrl(product.image_url, product.id)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                {product.status !== "normal" && (
                  <span className={`${styles.badge} ${styles[product.status]}`}>
                    {product.status.replace("_", " ").toUpperCase()}
                  </span>
                )}
                {discount > 0 && (
                  <span className={styles.discountBadge}>{discount}% OFF</span>
                )}
              </div>

              <div className={styles.details}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.category}>{product.category}</p>
                
                <div className={styles.priceSection}>
                  <div className={styles.priceRow}>
                    <span className={styles.currentPrice}>
                      ₹{product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span className={styles.originalPrice}>₹{product.price}</span>
                    )}
                  </div>
                </div>

                <div className={styles.stock}>
                  {product.stock > 0 ? (
                    <span className={styles.inStock}>In Stock ({product.stock})</span>
                  ) : (
                    <span className={styles.outOfStock}>Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
