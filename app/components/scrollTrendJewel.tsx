'use client'
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ScrollTrend.module.css';
import Loader from './Loader';

interface BrandCard {
  brand: string;
  price: string;
  priceType: 'MIN.' | 'STARTING';
  image: string;
  productCount: number;
}

const ScrollTrendJewel = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [brandCards, setBrandCards] = useState<BrandCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/admin/products');
        const data = await response.json();

        if (data.success) {
          console.log('All products:', data.data); // Debug log
          
          // Filter jewelry products only
          const jewelryProducts = data.data.filter(
            (product: any) => {
              const category = product.category?.toLowerCase();
              console.log('Product category:', category); // Debug log
              return category === 'jewellery' || category === 'jewelry';
            }
          );

          console.log('Jewelry products found:', jewelryProducts.length); // Debug log

          // Group by brand and get minimum price and image for each
          const brandMap = new Map<string, { minPrice: number; image: string; count: number }>();
          
          jewelryProducts.forEach((product: any) => {
            if (product.brand) {
              const price = product.discount_price || product.price;
              const existing = brandMap.get(product.brand);
              
              // Parse image_url to get the first image if it's an array
              let imageUrl = `https://picsum.photos/seed/${product.brand}/800/600`;
              if (product.image_url) {
                try {
                  const images = JSON.parse(product.image_url);
                  imageUrl = Array.isArray(images) && images.length > 0 && images[0]
                    ? images[0]
                    : (product.image_url || imageUrl);
                } catch {
                  imageUrl = product.image_url || imageUrl;
                }
              }
              
              console.log('Brand:', product.brand, 'Image:', imageUrl); // Debug log
              
              if (!existing || price < existing.minPrice) {
                brandMap.set(product.brand, {
                  minPrice: price,
                  image: imageUrl,
                  count: existing ? existing.count + 1 : 1
                });
              } else {
                brandMap.set(product.brand, {
                  ...existing,
                  count: existing.count + 1
                });
              }
            }
          });

          // Convert to array and take first 4
          const brands = Array.from(brandMap.entries())
            .map(([brand, data]) => ({
              brand,
              price: data.minPrice.toString(),
              priceType: 'MIN.' as const,
              image: data.image,
              productCount: data.count
            }))
            .slice(0, 4);

          console.log('Final brand cards:', brands); // Debug log
          setBrandCards(brands);
        }
      } catch (error) {
        console.error('Failed to fetch jewelry brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const scrollByCards = (dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`) as HTMLElement | null;
    const gap = 24;
    const amount = card ? card.offsetWidth + gap : 320;
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (brandCards.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>LATEST JEWELS</h2>
        <button 
          className={styles.viewAllBtn}
          onClick={() => router.push('/brands/jewelry')}
        >
          View All Jewelry Brands →
        </button>
      </div>
      <div className={styles.carousel} ref={trackRef}>
        {brandCards.map((card, index) => (
          <div 
            key={index} 
            className={styles.card}
            onClick={() => router.push(`/brands/${encodeURIComponent(card.brand.toLowerCase().replace(/\s+/g, '-'))}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.innerPanel}>
              <div className={styles.logoContainer}>
                <div className={styles.brandText}>{card.brand}</div>
              </div>

              <div className={styles.meta}>
                <span className={styles.priceType}>{card.priceType}</span>
                <div className={styles.price}>
                  <span className={styles.rupee}>₹</span>
                  {card.price}
                </div>
                <span className={styles.productCount}>{card.productCount} Products</span>
              </div>
              
              <div className={styles.imageContainer}>
                <img 
                  src={card.image} 
                  alt={`${card.brand} Product`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  onError={(e) => {
                    console.error(`Failed to load image for ${card.brand}: ${card.image}`);
                    e.currentTarget.src = `https://picsum.photos/seed/${card.brand}/800/600`;
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className={`${styles.navButton} ${styles.prevButton}`} onClick={() => scrollByCards('prev')} aria-label="Previous">
        <span>❮</span>
      </button>
      <button className={`${styles.navButton} ${styles.nextButton}`} onClick={() => scrollByCards('next')} aria-label="Next">
        <span>❯</span>
      </button>
    </div>
  );
};

export default ScrollTrendJewel;
