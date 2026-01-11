'use client';

import styles from '../privacy-policy/policy.module.css';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function CookiePolicyPage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Cookie Policy</h1>
          <p className={styles.subtitle}>
            Last updated: January 11, 2026
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>What Are Cookies?</h2>
            <p className={styles.text}>
              Cookies are small text files that are placed on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences, understanding how you use our site, 
              and improving our services.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How We Use Cookies</h2>
            <p className={styles.text}>
              Looms & Petals uses cookies for various purposes, including:
            </p>
            <ul className={styles.list}>
              <li>Enabling essential website functionality</li>
              <li>Remembering your login status and preferences</li>
              <li>Maintaining your shopping cart items</li>
              <li>Understanding how visitors use our website</li>
              <li>Improving website performance and user experience</li>
              <li>Providing personalized content and recommendations</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Types of Cookies We Use</h2>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>1. Essential Cookies</h3>
              <p className={styles.text}>
                These cookies are necessary for the website to function properly. They enable core functionality such as:
              </p>
              <ul className={styles.list}>
                <li>Security and authentication</li>
                <li>Shopping cart functionality</li>
                <li>Session management</li>
                <li>Payment processing</li>
              </ul>
              <p className={styles.text}>
                <strong>You cannot opt out of essential cookies</strong> as they are required for the website to work.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>2. Performance Cookies</h3>
              <p className={styles.text}>
                These cookies help us understand how visitors interact with our website by collecting anonymous information:
              </p>
              <ul className={styles.list}>
                <li>Pages visited and time spent</li>
                <li>Navigation patterns</li>
                <li>Error messages encountered</li>
                <li>Device and browser information</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>3. Functional Cookies</h3>
              <p className={styles.text}>
                These cookies enable enhanced functionality and personalization:
              </p>
              <ul className={styles.list}>
                <li>Remembering your preferences (language, region)</li>
                <li>Storing your login information</li>
                <li>Customizing content based on your interests</li>
                <li>Remembering items in your wishlist</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>4. Targeting/Advertising Cookies</h3>
              <p className={styles.text}>
                These cookies may be set by our advertising partners to:
              </p>
              <ul className={styles.list}>
                <li>Build a profile of your interests</li>
                <li>Show relevant advertisements on other websites</li>
                <li>Measure the effectiveness of advertising campaigns</li>
                <li>Prevent the same ad from being shown repeatedly</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Third-Party Cookies</h2>
            <p className={styles.text}>
              We may use services from third-party providers that set cookies on your device. These include:
            </p>
            <ul className={styles.list}>
              <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
              <li><strong>Razorpay:</strong> For secure payment processing</li>
              <li><strong>Social Media Platforms:</strong> For social sharing functionality</li>
              <li><strong>Email Service Providers:</strong> For marketing communications</li>
            </ul>
            <p className={styles.text}>
              These third parties have their own privacy policies. We recommend reviewing their policies to understand 
              how they use cookies.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Managing Your Cookie Preferences</h2>
            <p className={styles.text}>
              You have several options to manage cookies:
            </p>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Browser Settings</h3>
              <p className={styles.text}>
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className={styles.list}>
                <li>Block all cookies</li>
                <li>Accept only first-party cookies</li>
                <li>Delete cookies after browsing</li>
                <li>Receive notifications when cookies are set</li>
              </ul>
              <p className={styles.text}>
                Please note that blocking essential cookies may prevent certain features of our website from functioning properly.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Browser-Specific Instructions</h3>
              <ul className={styles.list}>
                <li><strong>Google Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Microsoft Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Mobile Devices</h3>
              <p className={styles.text}>
                On mobile devices, you can manage cookies through your browser app settings or by adjusting your 
                device's privacy settings.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cookie Retention</h2>
            <p className={styles.text}>
              Cookies have different lifespans:
            </p>
            <ul className={styles.list}>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
            </ul>
            <p className={styles.text}>
              We regularly review our cookie usage and retention periods to ensure they are necessary and proportionate.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Do Not Track Signals</h2>
            <p className={styles.text}>
              Some browsers support "Do Not Track" (DNT) signals. However, there is currently no industry standard 
              for responding to DNT signals. We do not currently respond to DNT signals, but we are committed to 
              respecting your privacy choices.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Changes to This Cookie Policy</h2>
            <p className={styles.text}>
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or 
              our business practices. We will notify you of any significant changes by updating the "Last updated" 
              date at the top of this page.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Your Consent</h2>
            <p className={styles.text}>
              By continuing to use our website, you consent to our use of cookies as described in this policy. 
              If you do not agree to our use of cookies, you should change your browser settings or discontinue 
              use of our website.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p className={styles.text}>
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
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
