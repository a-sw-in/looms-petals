'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import Footer from '../components/Footer';

export default function MyOrders() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="home w-screen flex flex-col min-h-screen">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #7a2d2d', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user) return null; // Redirecting

    return (
        <div className="home w-screen flex flex-col min-h-screen" style={{ background: '#fafafa' }}>
            <Navbar />

            <main style={{ flex: 1, maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>
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
                            {/* Cancelled Refund Message */}
                            {selectedOrder.order_status === 'cancelled' && (
                                <div style={{
                                    padding: '16px',
                                    background: '#fff3cd',
                                    border: '1px solid #ffeeba',
                                    borderRadius: '8px',
                                    color: '#856404',
                                    marginBottom: '24px',
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    <strong>Order Cancelled.</strong>
                                    {selectedOrder.payment_method === 'cod' ? (
                                        <div style={{ marginTop: '8px' }}>
                                            Since this was a Cash on Delivery (COD) order, no payment was deducted and no refund is required.
                                        </div>
                                    ) : (selectedOrder.payment_method === 'online' || selectedOrder.payment_status === 'paid') ? (
                                        <div style={{ marginTop: '8px' }}>
                                            A refund will be initiated to your original payment method within 5-7 business days.
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '8px' }}>
                                            No refund is required as the payment was not completed/captured online.
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
                        </div>
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