'use client';

import styles from './policy.module.css';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Last updated: January 11, 2026
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Introduction</h2>
            <p className={styles.text}>
              Welcome to Looms & Petals. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our 
              website and make purchases from our online store.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Information We Collect</h2>
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Personal Information</h3>
              <p className={styles.text}>
                When you place an order or register on our site, we may collect the following personal information:
              </p>
              <ul className={styles.list}>
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Shipping and billing address</li>
                <li>Payment information (processed securely through payment gateways)</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Automatically Collected Information</h3>
              <p className={styles.text}>
                When you browse our website, we may automatically collect:
              </p>
              <ul className={styles.list}>
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Pages viewed and time spent</li>
                <li>Referring website addresses</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
            <p className={styles.text}>We use your personal information to:</p>
            <ul className={styles.list}>
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your customer service requests</li>
              <li>Improve our website and services</li>
              <li>Send promotional emails (with your consent)</li>
              <li>Prevent fraudulent transactions and protect our users</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Information Sharing and Disclosure</h2>
            <p className={styles.text}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className={styles.list}>
              <li><strong>Service Providers:</strong> Payment processors, shipping companies, and email service providers</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Data Security</h2>
            <p className={styles.text}>
              We implement industry-standard security measures to protect your personal information. This includes:
            </p>
            <ul className={styles.list}>
              <li>SSL encryption for data transmission</li>
              <li>Secure payment processing through trusted gateways</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal data</li>
            </ul>
            <p className={styles.text}>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your 
              personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Privacy Rights</h2>
            <p className={styles.text}>You have the right to:</p>
            <ul className={styles.list}>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className={styles.text}>
              To exercise these rights, please contact us at {process.env.NEXT_PUBLIC_ADMIN_EMAIL}.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cookies and Tracking Technologies</h2>
            <p className={styles.text}>
              We use cookies and similar tracking technologies to enhance your browsing experience. For detailed 
              information about how we use cookies, please refer to our <a href="/cookie-policy" className={styles.link}>Cookie Policy</a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Children's Privacy</h2>
            <p className={styles.text}>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Changes to This Privacy Policy</h2>
            <p className={styles.text}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this 
              Privacy Policy periodically.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p className={styles.text}>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> {process.env.NEXT_PUBLIC_ADMIN_EMAIL}</p>
              <p><strong>Phone:</strong> {process.env.NEXT_PUBLIC_ADMIN_PHONE}</p>
              <p><strong>Address:</strong> {process.env.NEXT_PUBLIC_COMPANY_ADDRESS}, {process.env.NEXT_PUBLIC_COMPANY_CITY}, {process.env.NEXT_PUBLIC_COMPANY_STATE} {process.env.NEXT_PUBLIC_COMPANY_PINCODE}, {process.env.NEXT_PUBLIC_COMPANY_COUNTRY}</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
