'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';

export default function FailedOrders() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [failedOrders, setFailedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [supportMessage, setSupportMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (user?.email) {
            fetchFailedOrders(user.email);
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading, router]);

    const fetchFailedOrders = async (email: string) => {
        try {
            const response = await fetch(`/api/users/failed-orders?email=${encodeURIComponent(email)}`);
            const data = await response.json();
            if (data.success) {
                setFailedOrders(data.failedOrders);
            }
        } catch (error) {
            console.error('Failed to fetch failed orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSupportRequest = async () => {
        if (!supportMessage.trim()) {
            alert('Please enter your message before submitting');
            return;
        }

        if (selectedOrder?.support_request_submitted) {
            alert('You have already submitted a support request for this order.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/users/failed-orders/support-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    failedOrderId: selectedOrder.id,
                    customerName: user?.name || selectedOrder.customer_name,
                    customerEmail: user?.email || selectedOrder.customer_email,
                    customerMessage: supportMessage,
                    failedOrderDetails: selectedOrder
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Your support request has been sent to our team. We will contact you shortly.');
                setSupportMessage('');
                setShowModal(false);
                setSelectedOrder(null);
                // Refresh the list
                if (user?.email) {
                    fetchFailedOrders(user.email);
                }
            } else {
                alert(data.message || 'Failed to send request. Please try again or contact us directly.');
            }
        } catch (error) {
            console.error('Error sending support request:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return <Loader />;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{
                flex: 1,
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
                padding: '40px 20px'
            }}>
                <button
                    onClick={() => router.push('/orders')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#7a2d2d',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '24px',
                        padding: '0'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to My Orders
                </button>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#2d2d2d',
                    marginBottom: '16px',
                    fontFamily: 'Poppins, sans-serif'
                }}>Failed Order Attempts</h1>

                <p style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '32px'
                }}>
                    These are payment attempts that failed during verification. If you made a payment, please raise a support request below.
                </p>

                {failedOrders.length === 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '60px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                            No failed order attempts found.
                        </p>
                        <button
                            onClick={() => router.push('/orders')}
                            style={{
                                padding: '12px 24px',
                                background: '#7a2d2d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            View My Orders
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {failedOrders.map((order: any) => (
                            <div
                                key={order.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    border: '1px solid #ffe5e5',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setShowModal(true);
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            background: '#fff3cd',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#856404',
                                            marginBottom: '8px'
                                        }}>
                                            FAILED ATTEMPT
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: '#dc3545'
                                        }}>
                                            ₹{Number(order.submitted_total || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    background: '#f8d7da',
                                    borderRadius: '8px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#721c24', marginBottom: '4px' }}>
                                        Failure Reason:
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#721c24' }}>
                                        {order.failure_reason?.replace(/_/g, ' ').toUpperCase()}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '16px',
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                        Click to view details and raise support request
                                    </div>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a2d2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />

            {/* Failed Order Details Modal */}
            {showModal && selectedOrder && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => {
                        setShowModal(false);
                        setSelectedOrder(null);
                        setSupportMessage('');
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            maxWidth: '700px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #f0f0f0',
                            position: 'sticky',
                            top: 0,
                            background: 'white',
                            borderRadius: '16px 16px 0 0',
                            zIndex: 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2d2d2d' }}>
                                    Failed Order Details
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedOrder(null);
                                        setSupportMessage('');
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '32px',
                                        cursor: 'pointer',
                                        color: '#999',
                                        lineHeight: '1',
                                        padding: '0',
                                        width: '32px',
                                        height: '32px'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '24px' }}>
                            {/* Alert */}
                            <div style={{
                                background: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '24px'
                            }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <span style={{ fontSize: '20px' }}>⚠️</span>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#856404', fontSize: '14px', marginBottom: '4px' }}>
                                            Payment Verification Failed
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#856404' }}>
                                            {selectedOrder.failure_message}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d2d2d', marginBottom: '16px' }}>
                                    Order Information
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Amount</div>
                                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc3545' }}>
                                            ₹{Number(selectedOrder.submitted_total || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Attempt Date</div>
                                        <div style={{ fontSize: '14px', fontWeight: '600' }}>
                                            {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d2d2d', marginBottom: '16px' }}>
                                        Items in Order
                                    </h3>
                                    <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                                        {selectedOrder.items.map((item: any, index: number) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '12px',
                                                    background: '#f8f9fa',
                                                    borderRadius: '8px',
                                                    marginBottom: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        Quantity: {item.quantity}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: '700', fontSize: '16px' }}>
                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            {selectedOrder.razorpay_payment_id && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d2d2d', marginBottom: '16px' }}>
                                        Payment Information
                                    </h3>
                                    <div style={{ fontSize: '13px', background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong>Payment ID:</strong>
                                            <code style={{ marginLeft: '8px', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>
                                                {selectedOrder.razorpay_payment_id}
                                            </code>
                                        </div>
                                        {selectedOrder.razorpay_order_id && (
                                            <div>
                                                <strong>Order ID:</strong>
                                                <code style={{ marginLeft: '8px', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {selectedOrder.razorpay_order_id}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Support Request Section */}
                            {selectedOrder.support_request_submitted ? (
                                <div style={{
                                    background: '#d1ecf1',
                                    border: '2px solid #17a2b8',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: '#0c5460',
                                        marginBottom: '12px'
                                    }}>
                                        Support Request Already Submitted
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#0c5460', marginBottom: '16px' }}>
                                        You have already raised a support request for this order on{' '}
                                        {selectedOrder.support_request_submitted_at 
                                            ? new Date(selectedOrder.support_request_submitted_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'recently'
                                        }.
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#0c5460', marginBottom: '20px' }}>
                                        Our team will contact you shortly. For urgent queries, please contact:
                                    </p>
                                    <div style={{
                                        background: 'white',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#7a2d2d'
                                    }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            📧 Email: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'support@loomspetals.com'}
                                        </div>
                                        <div>
                                            📞 Phone: {process.env.NEXT_PUBLIC_ADMIN_PHONE || 'Contact Looms & Petals'}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    background: '#f0f8ff',
                                    border: '2px solid #2196f3',
                                    borderRadius: '12px',
                                    padding: '24px'
                                }}>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: '#0d47a1',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span>📧</span> Raise a Support Request
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                                        If you made a payment but the order failed, please describe your issue below. 
                                        Our team will review and contact you shortly.
                                    </p>
                                    <textarea
                                        value={supportMessage}
                                        onChange={(e) => setSupportMessage(e.target.value)}
                                        placeholder="Please describe your issue. Include any relevant details about your payment..."
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '12px',
                                            border: '2px solid #ddd',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            marginBottom: '16px'
                                        }}
                                    />
                                    <button
                                        onClick={handleSupportRequest}
                                        disabled={submitting || !supportMessage.trim()}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            background: submitting || !supportMessage.trim() ? '#ccc' : '#2196f3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: submitting || !supportMessage.trim() ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.3s'
                                        }}
                                    >
                                        {submitting ? 'Sending Request...' : 'Submit Support Request'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
