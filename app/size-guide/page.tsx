import styles from '../privacy-policy/policy.module.css';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function SizeGuidePage() {
  return (
    <>
      <Navbar />
      <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Size Guide</h1>
          <p className={styles.subtitle}>
            Find your perfect fit with our comprehensive sizing charts and measurement tips.
          </p>
        </div>

        <div className={styles.content}>
          {/* How to Measure */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>How to Take Measurements</h2>
            <p className={styles.text}>
              For the most accurate fit, follow these measurement guidelines:
            </p>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>General Tips</h3>
              <ul className={styles.list}>
                <li>Use a soft measuring tape for accurate measurements</li>
                <li>Measure over light clothing or directly on skin</li>
                <li>Keep the tape comfortably snug but not tight</li>
                <li>Take measurements while standing straight and relaxed</li>
                <li>Have someone help you for better accuracy</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Key Measurement Points</h3>
              <ul className={styles.list}>
                <li><strong>Bust/Chest:</strong> Measure around the fullest part of your chest, keeping tape parallel to the floor</li>
                <li><strong>Waist:</strong> Measure around the narrowest part of your natural waistline</li>
                <li><strong>Hips:</strong> Measure around the fullest part of your hips, approximately 8 inches below your waist</li>
                <li><strong>Shoulder:</strong> Measure from one shoulder point to the other across your back</li>
                <li><strong>Sleeve Length:</strong> Measure from shoulder point to wrist with arm slightly bent</li>
                <li><strong>Length:</strong> Measure from shoulder to desired hem length</li>
              </ul>
            </div>
          </section>

          {/* Women's Clothing Size Chart */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Women's Clothing Size Chart</h2>
            <p className={styles.text}>
              All measurements are in inches. If you're between sizes, we recommend sizing up for a comfortable fit.
            </p>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Standard Sizes</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  marginTop: '1rem',
                  fontSize: '0.95rem'
                }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #7a2d2d' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#7a2d2d' }}>Size</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Bust (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Waist (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>XS</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>32-34</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>24-26</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>34-36</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>S</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>34-36</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>26-28</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>36-38</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>M</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>36-38</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>28-30</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>38-40</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>L</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>38-40</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>30-32</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>40-42</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>XL</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>40-42</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>32-34</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>42-44</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '1rem' }}>XXL</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>42-44</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>34-36</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>44-46</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Indian Standard Sizes</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  marginTop: '1rem',
                  fontSize: '0.95rem'
                }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #7a2d2d' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#7a2d2d' }}>Size</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Equivalent</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Bust (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Waist (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>32</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>XS</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>32</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>24</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>34</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>S</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>34</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>26</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>36</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>M</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>36</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>28</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>38</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>L</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>38</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>30</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>40</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>XL</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>40</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>32</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '1rem' }}>42</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>XXL</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>42</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>34</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Saree Blouse Sizes */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Saree Blouse Size Guide</h2>
            <p className={styles.text}>
              Blouse measurements are crucial for the perfect fit with your saree.
            </p>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Blouse Size Chart</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  marginTop: '1rem',
                  fontSize: '0.95rem'
                }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #7a2d2d' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#7a2d2d' }}>Size</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Bust (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Shoulder (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>32</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>32</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>14</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>15</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>34</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>34</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>14.5</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>15.5</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>36</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>36</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>15</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>16</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>38</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>38</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>15.5</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>16.5</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>40</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>40</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>16</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>17</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '1rem' }}>42</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>42</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>16.5</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>17.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Men's Clothing */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Men's Clothing Size Chart</h2>
            <p className={styles.text}>
              Standard measurements for men's ethnic and casual wear.
            </p>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Kurta & Shirt Sizes</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  marginTop: '1rem',
                  fontSize: '0.95rem'
                }}>
                  <thead>
                    <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #7a2d2d' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#7a2d2d' }}>Size</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Chest (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Shoulder (in)</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#7a2d2d' }}>Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>S</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>36-38</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>16-17</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>27-28</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>M</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>38-40</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>17-18</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>28-29</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>L</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>40-42</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>18-19</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>29-30</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1rem' }}>XL</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>42-44</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>19-20</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>30-31</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '1rem' }}>XXL</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>44-46</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>20-21</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>31-32</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Fit Guide */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Fit Guide & Tips</h2>
            
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Between Sizes?</h3>
              <p className={styles.text}>
                If your measurements fall between two sizes, consider these factors:
              </p>
              <ul className={styles.list}>
                <li><strong>For a relaxed fit:</strong> Choose the larger size</li>
                <li><strong>For a fitted look:</strong> Choose the smaller size</li>
                <li><strong>For stretchy fabrics:</strong> Choose your smaller size</li>
                <li><strong>For non-stretch fabrics:</strong> Choose your larger size</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Fabric Considerations</h3>
              <ul className={styles.list}>
                <li><strong>Cotton:</strong> May shrink slightly after first wash; consider sizing up</li>
                <li><strong>Silk:</strong> True to size with minimal stretch</li>
                <li><strong>Chiffon/Georgette:</strong> Flowy fabrics; follow standard sizing</li>
                <li><strong>Jersey/Knit:</strong> Stretchy; can size down for fitted look</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Custom Sizing</h3>
              <p className={styles.text}>
                For select products, we offer custom sizing. Contact our support team with your 
                measurements, and we'll create a garment tailored to your exact specifications. 
                Custom orders may take 10-15 additional business days.
              </p>
            </div>
          </section>

          {/* Contact Support */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Need Sizing Help?</h2>
            <p className={styles.text}>
              Still unsure about sizing? Our customer support team is here to help!
            </p>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@loomspetals.com'}</p>
              <p><strong>Phone:</strong> {process.env.NEXT_PUBLIC_ADMIN_PHONE || '+91 98765 43210'}</p>
              <p><strong>WhatsApp:</strong> Chat with us for instant sizing assistance</p>
            </div>
            <p className={styles.text}>
              Share your measurements with us, and we'll recommend the perfect size for your order.
            </p>
          </section>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
