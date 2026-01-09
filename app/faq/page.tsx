'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import styles from './faq.module.css';

export default function FAQPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [faqs, setFaqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [issue, setIssue] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const response = await fetch('/api/faqs');
            const result = await response.json();
            if (result.data) {
                setFaqs(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const handleReportIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setMessage({ type: 'error', text: 'Please log in to report an issue.' });
            return;
        }
        if (!issue.trim()) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: issue,
                    userId: user.id
                }),
            });

            const result = await response.json();
            if (result.success) {
                setMessage({ type: 'success', text: 'Your issue has been reported successfully. We will get back to you soon!' });
                setIssue('');
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to report issue. Please try again.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.main}>
                <button
                    onClick={() => router.back()}
                    className={styles.backBtn}
                >
                    <span className={styles.backIcon}>←</span>
                    Back
                </button>

                <div className={styles.header}>
                    <h1>FAQ & Help Center</h1>
                    <p>Find answers to common questions or report a problem.</p>
                </div>

                <section className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>
                    {loading ? (
                        <div className={styles.loader}>Loading...</div>
                    ) : faqs.length === 0 ? (
                        <p className={styles.noData}>No FAQs available at the moment.</p>
                    ) : (
                        <div className={styles.accordion}>
                            {faqs.map((faq) => (
                                <div key={faq.id} className={`${styles.item} ${openId === faq.id ? styles.open : ''}`}>
                                    <button className={styles.question} onClick={() => handleToggle(faq.id)}>
                                        <span>{faq.question}</span>
                                        <span className={styles.icon}>{openId === faq.id ? '−' : '+'}</span>
                                    </button>
                                    <div className={styles.answer}>
                                        <div className={styles.answerContent}>
                                            <p>{faq.answer}</p>
                                            {faq.category && <span className={styles.badge}>{faq.category}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className={styles.issueSection}>
                    <h2>Still Need Help?</h2>
                    <p>Report an issue and our team will assist you. Your account details will be automatically included to help us resolve the issue faster.</p>

                    <form onSubmit={handleReportIssue} className={styles.issueForm}>
                        {message.text && (
                            <div className={`${styles.message} ${styles[message.type]}`}>
                                {message.text}
                            </div>
                        )}

                        <textarea
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            placeholder="Describe your issue in detail..."
                            required
                            disabled={submitting}
                            rows={5}
                        />

                        <button type="submit" disabled={submitting || !user} className={styles.submitBtn}>
                            {submitting ? 'Sending...' : 'Report Issue'}
                        </button>
                        {!user && <p style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '8px' }}>Login required to report issues.</p>}
                    </form>
                </section>
            </main>

            <Footer />
        </div>
    );
}
