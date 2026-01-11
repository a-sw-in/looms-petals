'use client';

import styles from '../privacy-policy/policy.module.css';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfServicePage() {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            Last updated: January 11, 2026
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Agreement to Terms</h2>
            <p className={styles.text}>
              Welcome to Looms & Petals. By accessing or using our website and services, you agree to be bound by 
              these Terms of Service. If you do not agree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Use of Our Services</h2>
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Eligibility</h3>
              <p className={styles.text}>
                You must be at least 18 years old to use our services. By using our website, you represent and 
                warrant that you are of legal age to form a binding contract.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Account Registration</h3>
              <p className={styles.text}>
                When creating an account, you agree to:
              </p>
              <ul className={styles.list}>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Product Information and Pricing</h2>
            <p className={styles.text}>
              We strive to ensure that product descriptions, images, and prices are accurate. However:
            </p>
            <ul className={styles.list}>
              <li>Colors may vary slightly due to screen settings and photography</li>
              <li>Handmade items may have minor variations</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to correct pricing errors</li>
              <li>Product availability is not guaranteed until order confirmation</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Orders and Payment</h2>
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Order Acceptance</h3>
              <p className={styles.text}>
                All orders are subject to acceptance. We reserve the right to refuse or cancel any order for reasons including:
              </p>
              <ul className={styles.list}>
                <li>Product unavailability</li>
                <li>Pricing or product description errors</li>
                <li>Suspected fraudulent transactions</li>
                <li>Violation of terms of service</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Payment Methods</h3>
              <p className={styles.text}>
                We accept the following payment methods:
              </p>
              <ul className={styles.list}>
                <li>Credit/Debit Cards (via Razorpay)</li>
                <li>UPI Payments</li>
                <li>Net Banking</li>
                <li>Cash on Delivery (COD)</li>
              </ul>
              <p className={styles.text}>
                By providing payment information, you authorize us to charge the total amount of your order.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Shipping and Delivery</h2>
            <p className={styles.text}>
              Shipping times and costs vary based on location and shipping method. We are not responsible for:
            </p>
            <ul className={styles.list}>
              <li>Delays caused by shipping carriers</li>
              <li>Incorrect addresses provided by customers</li>
              <li>Failed delivery attempts due to recipient unavailability</li>
              <li>Customs delays or fees for international orders</li>
            </ul>
            <p className={styles.text}>
              Risk of loss and title for purchased items pass to you upon delivery to the carrier.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Returns and Refunds</h2>
            <p className={styles.text}>
              Our return and refund policy includes:
            </p>
            <ul className={styles.list}>
              <li>7-day return window for delivered items</li>
              <li>Items must be unused, unworn, and in original condition with tags</li>
              <li>Proof of purchase required</li>
              <li>Refunds processed within 7-10 business days after approval</li>
              <li>Shipping costs are non-refundable unless item is defective</li>
            </ul>
            <p className={styles.text}>
              Certain items may not be eligible for return. Please contact customer service for specific cases.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Intellectual Property</h2>
            <p className={styles.text}>
              All content on this website, including text, graphics, logos, images, and software, is the property 
              of Looms & Petals and protected by copyright and intellectual property laws. You may not:
            </p>
            <ul className={styles.list}>
              <li>Copy, reproduce, or distribute our content without permission</li>
              <li>Use our brand name, trademarks, or logos</li>
              <li>Create derivative works from our content</li>
              <li>Use automated systems to access our website</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>User Conduct</h2>
            <p className={styles.text}>
              You agree not to:
            </p>
            <ul className={styles.list}>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful code or viruses</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass or harm other users</li>
              <li>Interfere with website operations</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
            <p className={styles.text}>
              To the maximum extent permitted by law, Looms & Petals shall not be liable for:
            </p>
            <ul className={styles.list}>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages exceeding the amount paid for the product</li>
              <li>Issues arising from third-party services or links</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Indemnification</h2>
            <p className={styles.text}>
              You agree to indemnify and hold Looms & Petals harmless from any claims, damages, or expenses arising from:
            </p>
            <ul className={styles.list}>
              <li>Your violation of these Terms of Service</li>
              <li>Your use of our website or services</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Modifications to Terms</h2>
            <p className={styles.text}>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately 
              upon posting. Your continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Governing Law</h2>
            <p className={styles.text}>
              These Terms of Service shall be governed by and construed in accordance with the laws of India. 
              Any disputes shall be subject to the exclusive jurisdiction of the courts in {process.env.NEXT_PUBLIC_COMPANY_CITY}, {process.env.NEXT_PUBLIC_COMPANY_STATE}.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <p className={styles.text}>
              For questions about these Terms of Service, please contact us:
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
