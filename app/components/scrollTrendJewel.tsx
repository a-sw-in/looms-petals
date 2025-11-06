'use client'
import React, { useRef } from 'react';
import Image from 'next/image';
import styles from './ScrollTrend.module.css';

interface BrandCard {
  brand: string;
  logo?: string; // optional; we will use text when omitted
  price: string;
  priceType: 'MIN.' | 'STARTING' | 'UP TO';
  discount?: string;
  image: string;
}

const brandCards: BrandCard[] = [
  {
    brand: 'SKECHERS',
    price: '1799',
    priceType: 'UP TO',
    discount: '40% OFF',
    image: 'https://picsum.photos/id/237/800/600'
  },
  {
    brand: 'MONROW',
    price: '3999',
    priceType: 'MIN.',
    image: 'https://picsum.photos/id/238/800/600'
  },
  {
    brand: 'U.S. POLO ASSN.',
    price: '3299',
    priceType: 'MIN.',
    image: 'https://picsum.photos/id/239/800/600'
  },
  {
    brand: 'LOTTO',
    price: '3999',
    priceType: 'MIN.',
    image: 'https://picsum.photos/id/240/800/600'
  },
  {
    brand: 'Hush Puppies',
    price: '3999',
    priceType: 'MIN.',
    image: 'https://picsum.photos/id/241/800/600'
  }
];

const ScrollTrend = () => {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(`.${styles.card}`) as HTMLElement | null;
    const gap = 24; // must match CSS gap
    const amount = card ? card.offsetWidth + gap : 320;
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Latest jewels</h2>
      <div className={styles.carousel} ref={trackRef}>
        {brandCards.map((card, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.innerPanel}>
              <div className={styles.logoContainer}>
                {card.logo ? (
                  <Image src={card.logo} alt={card.brand} fill style={{ objectFit: 'contain' }} />
                ) : (
                  <div className={styles.brandText}>{card.brand}</div>
                )}
              </div>

              <div className={styles.meta}>
                {card.priceType === 'UP TO' ? (
                  <>
                    <span className={styles.priceType}>UP TO</span>
                    <div className={styles.discountBig}>{card.discount}</div>
                  </>
                ) : (
                  <>
                    <span className={styles.priceType}>{card.priceType}</span>
                    <div className={styles.price}>
                      <span className={styles.rupee}>₹</span>
                      {card.price}
                    </div>
                  </>
                )}
              </div>
              {/* Image moved inside innerPanel so it clips within the rounded/bordered panel */}
              <div className={styles.imageContainer}>
                <Image src={card.image} alt={`${card.brand} Product`} fill style={{ objectFit: 'contain' }} />
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

export default ScrollTrend;
