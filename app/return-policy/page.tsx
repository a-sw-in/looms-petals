import styles from '../privacy-policy/policy.module.css';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Return & Refund Policy</h1>
          <p className={styles.subtitle}>
            Your satisfaction is our priority. Learn about our hassle-free return and refund process.
          </p>
        </div>

        <div className={styles.content}>
          {/* Return Eligibility */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Return Eligibility</h2>
            <p className={styles.text}>
              We accept returns within <strong>7 days</strong> of delivery. To be eligible for a return, 
              items must meet the following conditions:
            </p>
            <ul className={styles.list}>
              <li><strong>Unused & Unworn:</strong> Items must be in their original condition with all tags attached</li>
              <li><strong>Original Packaging:</strong> Products should be returned in their original packaging</li>
              <li><strong>No Damage:</strong> Items must not be damaged, altered, or washed</li>
              <li><strong>Proof of Purchase:</strong> Original invoice or order confirmation required</li>
              <li><strong>Hygiene Products:</strong> Certain items like innerwear cannot be returned for hygiene reasons</li>
            </ul>
          </section>

          {/* Return Process */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How to Return</h2>
            <p className={styles.text}>
              Follow these simple steps to initiate a return:
            </p>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Step 1: Request Return</h3>
              <p className={styles.text}>
                Log in to your account and navigate to "My Orders". Select the order you wish to return 
                and click "Request Return". Provide a reason for the return.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Step 2: Pack Your Items</h3>
              <p className={styles.text}>
                Securely pack the items in their original packaging with all tags and accessories intact. 
                Include the invoice in the package.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Step 3: Ship the Return</h3>
              <p className={styles.text}>
                You can either arrange pickup through our logistics partner or drop the package at the 
                nearest courier center. Return shipping costs may apply based on the reason for return.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Step 4: Quality Check</h3>
              <p className={styles.text}>
                Once we receive your return, our team will inspect the items within 3-5 business days. 
                You'll be notified via email about the status.
              </p>
            </div>
          </section>

          {/* Refund Policy */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Refund Process</h2>
            <p className={styles.text}>
              After your return is approved, refunds are processed based on your original payment method:
            </p>
            <ul className={styles.list}>
              <li><strong>Online Payments:</strong> Refunded to original payment method within 5-7 business days</li>
              <li><strong>Cash on Delivery:</strong> Refunded via bank transfer (provide bank details)</li>
              <li><strong>Wallet/UPI:</strong> Credited to the same wallet/UPI account</li>
              <li><strong>Store Credit:</strong> Option available for instant credit to use on future purchases</li>
            </ul>
            <p className={styles.text}>
              Please note that shipping charges are non-refundable unless the return is due to our error 
              (wrong item, damaged, or defective product).
            </p>
          </section>

          {/* Exchange Policy */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Exchange Policy</h2>
            <p className={styles.text}>
              We offer exchanges for size or color variations, subject to availability.
            </p>
            <ul className={styles.list}>
              <li><strong>Size Exchange:</strong> Available if the size doesn't fit. Exchange within 7 days</li>
              <li><strong>Color Exchange:</strong> Available if you change your mind about the color</li>
              <li><strong>Damaged Items:</strong> Immediate replacement for damaged or defective products</li>
              <li><strong>One-Time Exchange:</strong> Each item can be exchanged only once</li>
            </ul>
            <p className={styles.text}>
              To request an exchange, follow the same process as returns and select "Exchange" as the reason.
            </p>
          </section>

          {/* Non-Returnable Items */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Non-Returnable Items</h2>
            <p className={styles.text}>
              The following items cannot be returned or exchanged:
            </p>
            <ul className={styles.list}>
              <li>Customized or personalized products</li>
              <li>Innerwear and intimate apparel for hygiene reasons</li>
              <li>Sale or clearance items marked as "Final Sale"</li>
              <li>Gift cards and vouchers</li>
              <li>Items returned after 7 days of delivery</li>
              <li>Products without original tags or packaging</li>
            </ul>
          </section>

          {/* Damaged or Defective Items */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Damaged or Defective Products</h2>
            <p className={styles.text}>
              If you receive a damaged, defective, or wrong item, we'll arrange for immediate replacement 
              or refund at no additional cost.
            </p>
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Report Within 24 Hours</h3>
              <p className={styles.text}>
                Contact our customer support immediately upon receiving a damaged item. Provide photos 
                of the damage and packaging to expedite the process.
              </p>
            </div>
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Quality Assurance</h3>
              <p className={styles.text}>
                All our products undergo quality checks before dispatch. However, if you receive a 
                defective item, we take full responsibility and ensure a quick resolution.
              </p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Order Cancellation</h2>
            <p className={styles.text}>
              You can cancel your order before it's shipped at no cost.
            </p>
            <ul className={styles.list}>
              <li><strong>Before Dispatch:</strong> Full refund with no cancellation charges</li>
              <li><strong>After Dispatch:</strong> Cancellation not possible; you can initiate return after delivery</li>
              <li><strong>Prepaid Orders:</strong> Refund processed within 5-7 business days</li>
              <li><strong>COD Orders:</strong> No charges if cancelled before dispatch</li>
            </ul>
            <p className={styles.text}>
              To cancel an order, visit "My Orders" section and click "Cancel Order" button.
            </p>
          </section>

          {/* Contact Us */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Need Help?</h2>
            <p className={styles.text}>
              If you have any questions about our return and refund policy, please contact our customer support team.
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@loomspetals.com'}</p>
              <p><strong>Phone:</strong> {process.env.NEXT_PUBLIC_ADMIN_PHONE || '+91 98765 43210'}</p>
              <p><strong>Business Hours:</strong> Monday - Saturday: 10:00 AM - 8:00 PM</p>
            </div>
            <p className={styles.text}>
              Our customer support team is committed to resolving your concerns promptly and ensuring 
              a satisfactory shopping experience.
            </p>
          </section>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
