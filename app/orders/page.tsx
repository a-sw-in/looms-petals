'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';

export default function MyOrders() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundData, setRefundData] = useState({
        reason: '',
        pickupAddress: '',
        orderId: null,
        refundMode: 'upi',
        upiId: '',
        bankAccountNumber: '',
        bankIfscCode: '',
        bankAccountHolderName: ''
    });
    const [submittingRefund, setSubmittingRefund] = useState(false);
    const [refundRequests, setRefundRequests] = useState<any>({});
    const [cancellingOrder, setCancellingOrder] = useState(false);
    const [isCancellation, setIsCancellation] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (user?.email) {
            fetchOrders(user.email);
        } else if (!authLoading) {
            // If not logged in and not loading, we already redirect, but stop loading spinner here
            setLoading(false);
        }
    }, [user, authLoading, router]);

    const fetchOrders = async (email: string) => {
        try {
            const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
            
            // Fetch refund requests
            const refundResponse = await fetch(`/api/orders/refund?email=${encodeURIComponent(email)}`);
            const refundData = await refundResponse.json();
            if (refundData.success) {
                const refundsMap: any = {};
                refundData.refunds.forEach((refund: any) => {
                    refundsMap[refund.order_id] = refund;
                });
                setRefundRequests(refundsMap);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const isRefundEligible = (order: any) => {
        // Check if order is delivered
        if (order.order_status?.toLowerCase() !== 'delivered') {
            return { eligible: false, reason: 'Only delivered orders can be refunded' };
        }

        // Check if refund request already exists
        if (refundRequests[order.id]) {
            return { eligible: false, reason: 'Refund request already submitted', hasRequest: true };
        }

        // Check if 7 days have passed since delivery
        const orderDate = new Date(order.created_at);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference > 7) {
            return { eligible: false, reason: 'Refund period has expired (7 days)' };
        }

        return { eligible: true, daysRemaining: 7 - daysDifference };
    };

    const handleCancelOrder = async (order: any) => {
        // For online payment - show refund details modal
        if (order.payment_method?.toLowerCase() !== 'cod') {
            setIsCancellation(true);
            setRefundData({
                reason: 'User cancelled the order during processing',
                pickupAddress: order.shipping_address || '',
                orderId: order.id,
                refundMode: 'upi',
                upiId: '',
                bankAccountNumber: '',
                bankIfscCode: '',
                bankAccountHolderName: ''
            });
            setShowRefundModal(true);
            return;
        }

        // For COD - direct cancellation with confirmation
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        setCancellingOrder(true);
        try {
            const response = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order.id,
                    customerEmail: user?.email,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Order cancelled successfully');
                if (user?.email) {
                    await fetchOrders(user.email);
                }
                setSelectedOrder(null);
            } else {
                alert(result.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Failed to cancel order');
        } finally {
            setCancellingOrder(false);
        }
    };

    const handleRefundClick = (order: any) => {
        setIsCancellation(false);
        setSelectedOrder(order);
        setRefundData({
            reason: '',
            pickupAddress: user?.address || '',
            orderId: order.id,
            refundMode: 'upi',
            upiId: '',
            bankAccountNumber: '',
            bankIfscCode: '',
            bankAccountHolderName: ''
        });
        setShowRefundModal(true);
    };

    const handleRefundSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingRefund(true);
        
        try {
            // If this is a cancellation, cancel the order first
            if (isCancellation) {
                const cancelResponse = await fetch('/api/orders/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderId: refundData.orderId,
                        customerEmail: user?.email,
                    }),
                });

                const cancelResult = await cancelResponse.json();
                if (!cancelResult.success) {
                    alert(cancelResult.message || 'Failed to cancel order');
                    setSubmittingRefund(false);
                    return;
                }
            }

            // Create refund request
            const response = await fetch('/api/orders/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: refundData.orderId,
                    reason: isCancellation ? 'User cancelled the order during processing' : refundData.reason,
                    pickupAddress: isCancellation ? 'N/A - Order cancelled during processing' : refundData.pickupAddress,
                    customerEmail: user?.email,
                    customerName: user?.name,
                    refundMode: refundData.refundMode,
                    upiId: refundData.upiId,
                    bankAccountNumber: refundData.bankAccountNumber,
                    bankIfscCode: refundData.bankIfscCode,
                    bankAccountHolderName: refundData.bankAccountHolderName
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                alert(isCancellation ? 'Order cancelled and refund request submitted successfully!' : 'Refund request submitted successfully! We will contact you soon.');
                setShowRefundModal(false);
                setIsCancellation(false);
                setRefundData({ 
                    reason: '', 
                    pickupAddress: '', 
                    orderId: null,
                    refundMode: 'upi',
                    upiId: '',
                    bankAccountNumber: '',
                    bankIfscCode: '',
                    bankAccountHolderName: ''
                });
                // Refresh orders
                if (user?.email) {
                    fetchOrders(user.email);
                }
            } else {
                alert(data.message || 'Failed to submit refund request');
            }
        } catch (error) {
            console.error('Failed to submit refund:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setSubmittingRefund(false);
        }
    };

    if (authLoading || (loading && user)) {
        return (
            <>
                <div className="home w-screen flex flex-col min-h-screen">
                    <Navbar />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                        <Loader />
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user) return null; // Redirecting

    return (
        <div className="home w-screen flex flex-col min-h-screen" style={{ background: '#fafafa' }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'none',
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
                    Back
                </button>

                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#2d2d2d',
                    marginBottom: '32px',
                    fontFamily: 'Poppins, sans-serif'
                }}>My Orders</h1>

                {orders.length === 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '60px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                        <button
                            onClick={() => router.push('/')}
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
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {orders.map((order: any) => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    border: '1px solid #eee',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '16px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d2d2d' }}>Order #{order.id}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                </div>

                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>Total</div>
                                        <div style={{ fontWeight: '700', color: '#2d2d2d' }}>₹{Number(order.total_amount).toLocaleString()}</div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            background: order.order_status === 'delivered' ? '#d4edda' :
                                                order.order_status === 'shipped' ? '#cce5ff' :
                                                    order.order_status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                                            color: order.order_status === 'delivered' ? '#155724' :
                                                order.order_status === 'shipped' ? '#004085' :
                                                    order.order_status === 'cancelled' ? '#721c24' : '#856404'
                                        }}>
                                            {order.order_status || 'Processing'}
                                        </span>

                                        {refundRequests[order.id] && (
                                            <span style={{
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                background: 
                                                    refundRequests[order.id].status === 'pending' ? '#fff3cd' :
                                                    refundRequests[order.id].status === 'approved' ? '#d1ecf1' :
                                                    refundRequests[order.id].status === 'processing' ? '#cce5ff' :
                                                    refundRequests[order.id].status === 'completed' ? '#d4edda' :
                                                    refundRequests[order.id].status === 'rejected' ? '#f8d7da' :
                                                    refundRequests[order.id].status === 'cancelled' ? '#e2e3e5' : '#fff3cd',
                                                color: 
                                                    refundRequests[order.id].status === 'pending' ? '#856404' :
                                                    refundRequests[order.id].status === 'approved' ? '#0c5460' :
                                                    refundRequests[order.id].status === 'processing' ? '#004085' :
                                                    refundRequests[order.id].status === 'completed' ? '#155724' :
                                                    refundRequests[order.id].status === 'rejected' ? '#721c24' :
                                                    refundRequests[order.id].status === 'cancelled' ? '#383d41' : '#856404'
                                            }}>
                                                🔄 {refundRequests[order.id].status}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ color: '#ccc' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            animation: 'zoomIn 0.3s ease-out',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Order Details #{selectedOrder.id}</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {/* Cancelled Order Message */}
                            {(selectedOrder.order_status?.toLowerCase() === 'cancelled' || selectedOrder.is_cancelled) && (
                                <div style={{
                                    padding: '16px',
                                    background: '#f8d7da',
                                    border: '1px solid #f5c6cb',
                                    borderRadius: '8px',
                                    color: '#721c24',
                                    marginBottom: '24px',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '20px' }}>❌</span>
                                        <strong style={{ fontSize: '16px' }}>Order Cancelled</strong>
                                    </div>
                                    {selectedOrder.cancel_reason && (
                                        <div style={{ marginTop: '8px', fontSize: '13px' }}>
                                            <strong>Reason:</strong> {selectedOrder.cancel_reason}
                                        </div>
                                    )}
                                    {selectedOrder.cancelled_at && (
                                        <div style={{ marginTop: '4px', fontSize: '12px', color: '#856404' }}>
                                            Cancelled on: {new Date(selectedOrder.cancelled_at).toLocaleString()}
                                        </div>
                                    )}
                                    {selectedOrder.payment_method?.toLowerCase() === 'cod' ? (
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(114, 28, 36, 0.2)' }}>
                                            Since this was a Cash on Delivery (COD) order, no payment was deducted and no refund is required.
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(114, 28, 36, 0.2)' }}>
                                            A refund will be processed to your original payment method. Check refund status below.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Shipping Address</h3>
                                <div style={{ color: '#333' }}>
                                    <div style={{ fontWeight: '600' }}>{selectedOrder.customer_name}</div>
                                    <div>{selectedOrder.shipping_address}</div>
                                    <div>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</div>
                                    <div>{selectedOrder.country}</div>
                                    <div style={{ marginTop: '4px', color: '#666' }}>Phone: {selectedOrder.customer_phone}</div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '16px', textTransform: 'uppercase' }}>Items</h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <img
                                            src={item.image || item.image_url || 'https://via.placeholder.com/80'}
                                            alt={item.name}
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', background: '#f5f5f5' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>
                                                Qty: {item.quantity} × ₹{item.price || item.discount_price}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            ₹{(item.price || item.discount_price) * item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '600' }}>Total Amount</span>
                                <span style={{ fontSize: '20px', fontWeight: '700', color: '#7a2d2d' }}>₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                            </div>
                            <div style={{ marginTop: '4px', textAlign: 'right', fontSize: '13px', color: '#666' }}>
                                Payment: {selectedOrder.payment_method}
                            </div>

                            {/* Cancel Order Button for Processing Orders */}
                            {(() => {
                                const status = selectedOrder.order_status?.toLowerCase();
                                const canCancel = !selectedOrder.is_cancelled && 
                                                 status !== 'delivered' && 
                                                 status !== 'shipped' && 
                                                 status !== 'cancelled';
                                
                                if (!canCancel) return null;

                                return (
                                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                                        <button
                                            onClick={() => handleCancelOrder(selectedOrder)}
                                            disabled={cancellingOrder}
                                            style={{
                                                width: '100%',
                                                padding: '12px 24px',
                                                background: cancellingOrder ? '#ccc' : '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: cancellingOrder ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.2s ease',
                                                opacity: cancellingOrder ? 0.6 : 1
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!cancellingOrder) {
                                                    e.currentTarget.style.background = '#c82333';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!cancellingOrder) {
                                                    e.currentTarget.style.background = '#dc3545';
                                                }
                                            }}
                                        >
                                            {cancellingOrder ? 'Cancelling...' : '❌ Cancel Order'}
                                        </button>
                                        <div style={{ marginTop: '8px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
                                            You can cancel this order while it's being processed
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Refund Status Section - Show for cancelled orders with refund requests and delivered orders */}
                            {(() => {
                                const refundStatus = isRefundEligible(selectedOrder);
                                const refundRequest = refundRequests[selectedOrder.id];
                                
                                // Show refund section for cancelled orders with refund requests
                                if ((selectedOrder.order_status?.toLowerCase() === 'cancelled' || selectedOrder.is_cancelled) && refundRequest) {
                                    return (
                                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                                            <div style={{
                                                width: '100%',
                                                padding: '20px',
                                                background: '#f8f9fa',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '12px',
                                            }}>
                                                <div style={{ 
                                                    fontSize: '18px', 
                                                    fontWeight: '700', 
                                                    color: '#333',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    🔄 Refund Status
                                                </div>
                                                
                                                <div style={{ marginBottom: '16px' }}>
                                                    <span style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        display: 'inline-block',
                                                        background: 
                                                            refundRequest.status === 'pending' ? '#fff3cd' :
                                                            refundRequest.status === 'approved' ? '#d1ecf1' :
                                                            refundRequest.status === 'processing' ? '#cce5ff' :
                                                            refundRequest.status === 'completed' ? '#d4edda' :
                                                            refundRequest.status === 'rejected' ? '#f8d7da' :
                                                            refundRequest.status === 'cancelled' ? '#e2e3e5' : '#fff3cd',
                                                        color: 
                                                            refundRequest.status === 'pending' ? '#856404' :
                                                            refundRequest.status === 'approved' ? '#0c5460' :
                                                            refundRequest.status === 'processing' ? '#004085' :
                                                            refundRequest.status === 'completed' ? '#155724' :
                                                            refundRequest.status === 'rejected' ? '#721c24' :
                                                            refundRequest.status === 'cancelled' ? '#383d41' : '#856404'
                                                    }}>
                                                        {refundRequest.status || 'pending'}
                                                    </span>
                                                </div>

                                                {refundRequest.admin_notes && (
                                                    <div style={{
                                                        padding: '12px 16px',
                                                        background: 'white',
                                                        border: '1px solid #dee2e6',
                                                        borderRadius: '8px',
                                                        marginTop: '12px'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            color: '#666',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Admin Notes:
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#333',
                                                            lineHeight: '1.6'
                                                        }}>
                                                            {refundRequest.admin_notes}
                                                        </div>
                                                    </div>
                                                )}

                                                {refundRequest.processed_at && (
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#666',
                                                        marginTop: '12px'
                                                    }}>
                                                        Last updated: {new Date(refundRequest.processed_at).toLocaleString()}
                                                    </div>
                                                )}

                                                {!refundRequest.admin_notes && refundRequest.status === 'pending' && (
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#666',
                                                        marginTop: '12px',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        Your refund request is being reviewed. We'll update you soon.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                // Original refund section for delivered orders
                                if (selectedOrder.order_status?.toLowerCase() !== 'delivered') {
                                    return null;
                                }

                                return (
                                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                                        {refundStatus.hasRequest && refundRequest ? (
                                            <div style={{
                                                width: '100%',
                                                padding: '20px',
                                                background: '#f8f9fa',
                                                border: '1px solid #dee2e6',
                                                borderRadius: '12px',
                                            }}>
                                                <div style={{ 
                                                    fontSize: '18px', 
                                                    fontWeight: '700', 
                                                    color: '#333',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    🔄 Refund Status
                                                </div>
                                                
                                                <div style={{ marginBottom: '16px' }}>
                                                    <span style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '20px',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        display: 'inline-block',
                                                        background: 
                                                            refundRequest.status === 'pending' ? '#fff3cd' :
                                                            refundRequest.status === 'approved' ? '#d1ecf1' :
                                                            refundRequest.status === 'processing' ? '#cce5ff' :
                                                            refundRequest.status === 'completed' ? '#d4edda' :
                                                            refundRequest.status === 'rejected' ? '#f8d7da' :
                                                            refundRequest.status === 'cancelled' ? '#e2e3e5' : '#fff3cd',
                                                        color: 
                                                            refundRequest.status === 'pending' ? '#856404' :
                                                            refundRequest.status === 'approved' ? '#0c5460' :
                                                            refundRequest.status === 'processing' ? '#004085' :
                                                            refundRequest.status === 'completed' ? '#155724' :
                                                            refundRequest.status === 'rejected' ? '#721c24' :
                                                            refundRequest.status === 'cancelled' ? '#383d41' : '#856404'
                                                    }}>
                                                        {refundRequest.status || 'pending'}
                                                    </span>
                                                </div>

                                                {refundRequest.admin_notes && (
                                                    <div style={{
                                                        padding: '12px 16px',
                                                        background: 'white',
                                                        border: '1px solid #dee2e6',
                                                        borderRadius: '8px',
                                                        marginTop: '12px'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            color: '#666',
                                                            marginBottom: '6px'
                                                        }}>
                                                            Admin Notes:
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            color: '#333',
                                                            lineHeight: '1.6'
                                                        }}>
                                                            {refundRequest.admin_notes}
                                                        </div>
                                                    </div>
                                                )}

                                                {refundRequest.processed_at && (
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#666',
                                                        marginTop: '12px'
                                                    }}>
                                                        Last updated: {new Date(refundRequest.processed_at).toLocaleString()}
                                                    </div>
                                                )}

                                                {!refundRequest.admin_notes && refundRequest.status === 'pending' && (
                                                    <div style={{
                                                        fontSize: '14px',
                                                        color: '#666',
                                                        marginTop: '12px',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        Your refund request is being reviewed. We'll update you soon.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleRefundClick(selectedOrder)}
                                                    disabled={!refundStatus.eligible}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 24px',
                                                        background: refundStatus.eligible ? '#dc3545' : '#ccc',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        cursor: refundStatus.eligible ? 'pointer' : 'not-allowed',
                                                        transition: 'background 0.2s ease',
                                                        opacity: refundStatus.eligible ? 1 : 0.6
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (refundStatus.eligible) {
                                                            e.currentTarget.style.background = '#c82333';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (refundStatus.eligible) {
                                                            e.currentTarget.style.background = '#dc3545';
                                                        }
                                                    }}
                                                >
                                                    Request Refund
                                                </button>
                                                {refundStatus.eligible && refundStatus.daysRemaining !== undefined && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        fontSize: '13px',
                                                        color: '#666',
                                                        textAlign: 'center'
                                                    }}>
                                                        {refundStatus.daysRemaining} day{refundStatus.daysRemaining !== 1 ? 's' : ''} remaining for refund/replacement
                                                    </div>
                                                )}
                                                {!refundStatus.eligible && refundStatus.reason && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        fontSize: '13px',
                                                        color: '#dc3545',
                                                        textAlign: 'center'
                                                    }}>
                                                        {refundStatus.reason}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Request Modal */}
            {showRefundModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1001,
                        padding: '20px'
                    }}
                    onClick={() => setShowRefundModal(false)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            animation: 'zoomIn 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                                {isCancellation ? 'Cancel Order - Refund Details' : 'Request Refund'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setIsCancellation(false);
                                }}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleRefundSubmit} style={{ padding: '24px' }}>
                            {isCancellation && (
                                <div style={{
                                    padding: '12px 16px',
                                    background: '#fff3cd',
                                    border: '1px solid #ffc107',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    fontSize: '14px',
                                    color: '#856404'
                                }}>
                                    <strong>Please provide your refund payment details to complete the cancellation.</strong>
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                    Order ID
                                </label>
                                <input
                                    type="text"
                                    value={`#${refundData.orderId}`}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '14px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        background: '#f5f5f5',
                                        color: '#666'
                                    }}
                                />
                            </div>

                            {!isCancellation && (
                                <>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                            Reason for Refund <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <textarea
                                            value={refundData.reason}
                                            onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                                            required
                                            rows={4}
                                            placeholder="Please explain why you want to return this product..."
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                fontSize: '14px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                            Pickup Address <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <textarea
                                            value={refundData.pickupAddress}
                                            onChange={(e) => setRefundData({ ...refundData, pickupAddress: e.target.value })}
                                            required
                                            rows={3}
                                            placeholder="Enter the address where we should collect the product..."
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                fontSize: '14px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                resize: 'vertical',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Refund Details Section */}
                            {(isCancellation || (selectedOrder && selectedOrder.payment_method?.toLowerCase() === 'cod')) && (
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
                                        Refund Payment Details <span style={{ color: '#dc3545' }}>*</span>
                                    </h3>
                                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                                        Please provide your bank or UPI details to receive the refund
                                    </p>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="refundMode"
                                                value="upi"
                                                checked={refundData.refundMode === 'upi'}
                                                onChange={(e) => setRefundData({ ...refundData, refundMode: e.target.value })}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '14px', fontWeight: '500' }}>UPI</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="refundMode"
                                                value="bank"
                                                checked={refundData.refundMode === 'bank'}
                                                onChange={(e) => setRefundData({ ...refundData, refundMode: e.target.value })}
                                                style={{ cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Bank Account</span>
                                    </label>
                                </div>

                                {refundData.refundMode === 'upi' ? (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                            UPI ID <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={refundData.upiId}
                                            onChange={(e) => setRefundData({ ...refundData, upiId: e.target.value })}
                                            required
                                            placeholder="example@upi"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                fontSize: '14px',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                Account Holder Name <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={refundData.bankAccountHolderName}
                                                onChange={(e) => setRefundData({ ...refundData, bankAccountHolderName: e.target.value })}
                                                required
                                                placeholder="Enter account holder name"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    fontSize: '14px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                Account Number <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={refundData.bankAccountNumber}
                                                onChange={(e) => setRefundData({ ...refundData, bankAccountNumber: e.target.value })}
                                                required
                                                placeholder="Enter account number"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    fontSize: '14px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                                IFSC Code <span style={{ color: '#dc3545' }}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={refundData.bankIfscCode}
                                                onChange={(e) => setRefundData({ ...refundData, bankIfscCode: e.target.value.toUpperCase() })}
                                                required
                                                placeholder="Enter IFSC code"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    fontSize: '14px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                                </div>
                            )}

                            {/* Info message for online payments */}
                            {selectedOrder && selectedOrder.payment_method?.toLowerCase() !== 'cod' && (
                                <div style={{
                                    background: '#e3f2fd',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    fontSize: '14px',
                                    color: '#1565c0',
                                    lineHeight: '1.5',
                                    border: '1px solid #90caf9'
                                }}>
                                    <strong style={{ display: 'block', marginBottom: '8px' }}>💳 Online Payment Refund</strong>
                                    Your refund will be automatically processed to your original payment method (Razorpay). No additional details required.
                                </div>
                            )}

                            <div style={{
                                background: '#f8f9fa',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: '1.5'
                            }}>
                                <strong style={{ color: '#333' }}>Note:</strong> After submitting your refund request, our team will review it and contact you within 2-3 business days. Please ensure the product is in original condition with all tags intact.
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowRefundModal(false)}
                                    disabled={submittingRefund}
                                    style={{
                                        flex: 1,
                                        padding: '12px 24px',
                                        background: '#f5f5f5',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingRefund}
                                    style={{
                                        flex: 1,
                                        padding: '12px 24px',
                                        background: '#7a2d2d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        opacity: submittingRefund ? 0.6 : 1
                                    }}
                                >
                                    {submittingRefund ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Animation Styles */}
            <style jsx global>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

            <Footer />
        </div>
    );
}