import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated 404 */}
        <div className={styles.errorCode}>
          <span className={styles.digit}>4</span>
          <span className={styles.digitMiddle}>0</span>
          <span className={styles.digit}>4</span>
        </div>

        {/* Message */}
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.description}>
          Oops! The page you're looking for seems to have wandered off. 
          Let's get you back on track.
        </p>

        {/* Interactive buttons */}
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Back to Home
          </Link>
          <Link href="/products" className={styles.secondaryButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Shop Now
          </Link>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinks}>
          <p className={styles.quickLinksTitle}>Quick Links</p>
          <div className={styles.linkGrid}>
            <Link href="/collections/saree" className={styles.quickLink}>Sarees</Link>
            <Link href="/jewellery" className={styles.quickLink}>Jewellery</Link>
            <Link href="/contact" className={styles.quickLink}>Contact Us</Link>
            <Link href="/faq" className={styles.quickLink}>FAQs</Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>
    </div>
  );
}
