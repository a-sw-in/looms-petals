'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ProductCard from '@/app/components/ProductCard';
import styles from '@/app/products/products.module.css';

type Product = {
  id: number;
  slug: string;
  name: string;
  images: string | string[]; // Can be JSON string or array
  price: number;
  discount_price: number | null;
  stock: number;
  type: string;
  category: string;
  description: string;
};

export default function CollectionPage({ params }: { params: Promise<{ collectionName: string }> }) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { collectionName } = use(params); // Unwrap the Promise

  useEffect(() => {
    fetchProducts();
  }, [collectionName]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      const data = await response.json();

      console.log('=== FULL API RESPONSE ===', data);

      if (data.success && data.data) {
        const allProducts = data.data;
        console.log('Total products from API:', allProducts.length);
        console.log('Collection name:', collectionName);
        
        // Filter products
        const filtered = filterProductsByCollection(allProducts, collectionName);
        console.log('Filtered products:', filtered.length);
        
        setProducts(filtered);
      } else {
        console.error('API did not return success or data');
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProductsByCollection = (allProducts: Product[], collection: string) => {
    const searchTerm = decodeURIComponent(collection).toLowerCase();
    console.log('Search Term:', searchTerm);

    // Normalize "jewellery" to "jewelry" to match database
    const normalizedTerm = searchTerm === 'jewellery' ? 'jewelry' : searchTerm;
    console.log('Normalized Term:', normalizedTerm);

    // For ALL categories, search in ALL columns (case insensitive)
    return allProducts.filter(product => {
      // Build searchable text from all available fields
      const fields = [
        product.name,
        product.description,
        product.category,
        product.type,
        (product as any).subcategory,
        (product as any).brand,
        (product as any).status,
      ];
      
      const searchableText = fields
        .filter(Boolean)
        .map(field => String(field))
        .join(' ')
        .toLowerCase();

      console.log(`Product: ${product.name}, Type: ${product.type}, Searchable: ${searchableText.substring(0, 100)}`);
      
      const matches = searchableText.includes(normalizedTerm);
      if (matches) {
        console.log(`✓ MATCH: ${product.name}`);
      }
      
      return matches;
    });
  };

  const pageTitle = decodeURIComponent(collectionName).replace(/\b\w/g, l => l.toUpperCase());

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{pageTitle}</h1>
            <p className={styles.subtitle}>Loading products...</p>
          </div>
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.imageWrapper} style={{ background: '#f0f0f0' }}>
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    Loading...
                  </div>
                </div>
                <div className={styles.details}>
                  <h3 className={styles.productName}>•••</h3>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← Back
        </button>
        <div className={styles.header}>
          <h1 className={styles.title}>{pageTitle}</h1>
          <p className={styles.subtitle}>
            {products.length > 0 ? `${products.length} products found` : 'No products found'}
          </p>
        </div>
        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
            <p>No products available in this collection.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
