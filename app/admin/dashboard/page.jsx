'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';
import PrintOrdersModal from './PrintOrdersModal';
import PrintPaymentsModal from './PrintPaymentsModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    brand: '',
    image_url: [],
    stock: '',
    status: 'normal',
    type: 'clothing',
    is_featured: false,
    searchkey: '',
  });
  const [imageInput, setImageInput] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState({ order_status: 'all', payment_status: 'all' });
  const [productFilterConfig, setProductFilterConfig] = useState({ category: 'all', type: 'all' });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [paymentsSort, setPaymentsSort] = useState('newest');
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    question: '',
    answer: '',
    category: 'General'
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPrintPaymentsModal, setShowPrintPaymentsModal] = useState(false);
  const [showCODPaymentModal, setShowCODPaymentModal] = useState(false);
  const [codPaymentOrderId, setCodPaymentOrderId] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showAdminNotesModal, setShowAdminNotesModal] = useState(false);
  const [pendingRefundStatus, setPendingRefundStatus] = useState(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [orderSearchId, setOrderSearchId] = useState('');
  const [refundSearchId, setRefundSearchId] = useState('');
  const [failedOrders, setFailedOrders] = useState([]);
  const [failedOrdersLoading, setFailedOrdersLoading] = useState(false);
  const [selectedFailedOrder, setSelectedFailedOrder] = useState(null);
  const [showFailedOrderModal, setShowFailedOrderModal] = useState(false);


  useEffect(() => {
    checkAuth();
    fetchProducts();
    fetchOrders();
    fetchUsers();
    fetchFaqs();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (!response.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await response.json();
      setUser(data.data.user);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch('/api/admin/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        alert('User removed successfully');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(result.message || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      setFaqsLoading(true);
      const response = await fetch('/api/admin/faqs');
      const result = await response.json();
      if (result.data) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setFaqsLoading(false);
    }
  };

  const fetchRefunds = async () => {
    try {
      setRefundsLoading(true);
      const response = await fetch('/api/orders/refund');
      const result = await response.json();
      if (result.success) {
        setRefunds(result.refunds);
      }
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setRefundsLoading(false);
    }
  };

  const fetchFailedOrders = async () => {
    try {
      setFailedOrdersLoading(true);
      const response = await fetch('/api/admin/failed-orders');
      const result = await response.json();
      if (result.success) {
        setFailedOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching failed orders:', error);
    } finally {
      setFailedOrdersLoading(false);
    }
  };

  const markFailedOrderResolved = async (id, resolved, notes) => {
    try {
      const response = await fetch('/api/admin/failed-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolved, admin_notes: notes })
      });
      const result = await response.json();
      if (result.success) {
        await fetchFailedOrders();
        setShowFailedOrderModal(false);
        setSelectedFailedOrder(null);
      }
    } catch (error) {
      console.error('Error updating failed order:', error);
    }
  };

  const handleRefundStatusUpdate = async () => {
    if (!pendingRefundStatus) return;
    
    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          refundId: pendingRefundStatus.refundId, 
          status: pendingRefundStatus.status, 
          adminNotes: adminNotesInput,
          processedBy: user?.email 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Refund status updated successfully');
        fetchRefunds();
        setShowRefundModal(false);
        setShowAdminNotesModal(false);
        setPendingRefundStatus(null);
        setAdminNotesInput('');
      } else {
        alert('Failed to update refund status');
      }
    } catch (error) {
      console.error('Failed to update refund status:', error);
      alert('An error occurred');
    }
  };

  const openAdminNotesModal = (refundId, status) => {
    setPendingRefundStatus({ refundId, status });
    setAdminNotesInput('');
    setShowAdminNotesModal(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    const url = '/api/admin/faqs';
    const method = editingFaq ? 'PUT' : 'POST';
    const body = editingFaq ? { ...faqFormData, id: editingFaq.id } : faqFormData;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowFaqModal(false);
        setEditingFaq(null);
        setFaqFormData({ question: '', answer: '', category: 'General' });
        fetchFaqs();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/admin/faqs?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFaqs();
      } else {
        alert('Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General'
    });
    setShowFaqModal(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingProduct
      ? `/api/admin/products?id=${editingProduct.id}`
      : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    // Parse image_url - it might be a JSON array string or a single URL
    let images = [];
    if (product.image_url) {
      try {
        images = JSON.parse(product.image_url);
        if (!Array.isArray(images)) {
          images = [product.image_url];
        }
      } catch {
        images = [product.image_url];
      }
    }
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      discount_price: product.discount_price || '',
      category: product.category,
      brand: product.brand || '',
      image_url: images,
      stock: product.stock,
      status: product.status || 'normal',
      type: product.type || 'clothing',
      is_featured: product.is_featured,
      searchkey: product.searchkey || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category: '',
      brand: '',
      image_url: [],
      stock: '',
      status: 'normal',
      type: 'clothing',
      is_featured: false,
      searchkey: '',
      status: 'normal'
    });
    setImageInput('');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        image_url: [...formData.image_url, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImageUrl = (index) => {
    setFormData({
      ...formData,
      image_url: formData.image_url.filter((_, i) => i !== index)
    });
  };

  const handleStatusUpdate = async (id, status, type, reason = null) => {
    try {
      // Optimistic update
      const updatedOrders = orders.map(order => {
        if (order.id === id) {
          if (type === 'payment') return { ...order, payment_status: status };
          if (type === 'order') return { ...order, order_status: status, cancel_reason: reason };
        }
        return order;
      });
      setOrders(updatedOrders);

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, type, reason }),
      });

      if (!response.ok) {
        // Revert on failure
        fetchOrders();
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Update failed:', error);
      fetchOrders();
    }
  };

  const handlePaymentStatusClick = (order) => {
    const currentStatus = order.payment_status || 'pending';
    const paymentMethod = order.payment_method;

    // If already paid, don't allow changing back to pending
    if (currentStatus === 'paid') {
      alert('Payment already confirmed as PAID. Cannot revert to pending.');
      return;
    }

    // If pending and trying to mark as paid
    if (currentStatus === 'pending') {
      // For COD, show confirmation modal
      if (paymentMethod === 'cod') {
        setCodPaymentOrderId(order.id);
        setShowCODPaymentModal(true);
      } else {
        // For online payments, mark as paid directly
        handleStatusUpdate(order.id, 'paid', 'payment');
      }
    }
  };

  const confirmCODPayment = () => {
    if (codPaymentOrderId) {
      handleStatusUpdate(codPaymentOrderId, 'paid', 'payment');
      setShowCODPaymentModal(false);
      setCodPaymentOrderId(null);
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    if (productFilterConfig.category !== 'all') {
      filtered = filtered.filter(p => p.category === productFilterConfig.category);
    }
    if (productFilterConfig.type !== 'all') {
      filtered = filtered.filter(p => (p.type || 'clothing') === productFilterConfig.type);
    }
    return filtered;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredAndSortedOrders = () => {
    let filteredOrders = [...orders];

    // Apply Search by Order ID
    if (orderSearchId.trim()) {
      const searchQuery = orderSearchId.trim();
      filteredOrders = filteredOrders.filter(order => 
        order.id?.toString().includes(searchQuery)
      );
    }

    // Apply Filters
    if (filterConfig.order_status !== 'all') {
      filteredOrders = filteredOrders.filter(order => {
        const orderStatus = order.order_status ? order.order_status.toLowerCase().trim() : 'processing';
        const filterStatus = filterConfig.order_status.toLowerCase().trim();
        console.log('Comparing:', { orderId: order.id, orderStatus, filterStatus, match: orderStatus === filterStatus });
        return orderStatus === filterStatus;
      });
    }
    if (filterConfig.payment_status !== 'all') {
      filteredOrders = filteredOrders.filter(order => (order.payment_status || 'pending') === filterConfig.payment_status);
    }

    // Apply Sort
    if (sortConfig.key !== null) {
      filteredOrders.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredOrders;
  };

  const getFilteredAndSortedUsers = () => {
    let filtered = [...users];

    // Filter by name or ID
    if (userSearchQuery.trim()) {
      const query = userSearchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.id?.toString().toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortConfig.key === 'name' || sortConfig.key === 'id') {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const getSortedPayments = () => {
    let sorted = [...orders];
    if (paymentsSort === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (paymentsSort === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (paymentsSort === 'monthly') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        if (dateA.getFullYear() !== dateB.getFullYear()) {
          return dateB.getFullYear() - dateA.getFullYear();
        }
        return dateB.getMonth() - dateA.getMonth();
      });
    }
    return sorted;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.logo}>Looms & Petals</h1>
            <p className={styles.subtitle}>Admin Dashboard</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.welcomeText}>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            onClick={() => setActiveTab('products')}
            className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabActive : ''}`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabActive : ''}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`${styles.tabBtn} ${activeTab === 'faqs' ? styles.tabActive : ''}`}
          >
            FAQ ({faqs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('refunds');
              if (refunds.length === 0) fetchRefunds();
            }}
            className={`${styles.tabBtn} ${activeTab === 'refunds' ? styles.tabActive : ''}`}
          >
            Refunds ({refunds.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.tabActive : ''}`}
          >
            Payments
          </button>
          <button
            onClick={() => {
              setActiveTab('failed-orders');
              if (failedOrders.length === 0) fetchFailedOrders();
            }}
            className={`${styles.tabBtn} ${activeTab === 'failed-orders' ? styles.tabActive : ''}`}
          >
            Failed Orders ({failedOrders.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className={styles.toolbar}>
              <h2 className={styles.pageTitle}>Product Management</h2>
              <div className={styles.toolbarActions}>
                <div className={styles.filterGroup}>
                  <label style={{ fontSize: '14px', fontWeight: '500' }}>Category:</label>
                  <select
                    value={productFilterConfig.category}
                    onChange={(e) => setProductFilterConfig({ ...productFilterConfig, category: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="all">All Categories</option>
                    <option value="Sarees">Sarees</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label style={{ fontSize: '14px', fontWeight: '500' }}>Type:</label>
                  <select
                    value={productFilterConfig.type}
                    onChange={(e) => setProductFilterConfig({ ...productFilterConfig, type: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="all">All Types</option>
                    <option value="clothing">Clothing</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="accessories">Accessories</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setEditingProduct(null);
                    setShowModal(true);
                  }}
                  className={styles.addBtn}
                >
                  + Add Product
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={styles.grid}>
              {getFilteredProducts().map((product) => {
                // Parse image_url to get first image
                let imageUrl = 'https://picsum.photos/400/600';
                if (product.image_url) {
                  try {
                    const images = JSON.parse(product.image_url);
                    imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : product.image_url;
                  } catch {
                    imageUrl = product.image_url;
                  }
                }

                return (
                  <div key={product.id} className={styles.card}>
                    <div className={styles.cardImage}>
                      <img
                        src={imageUrl}
                        alt={product.name}
                      />
                      {product.is_featured && (
                        <span className={styles.featuredBadge}>Featured</span>
                      )}
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{product.name}</h3>
                      <p className={styles.cardCategory}>{product.category}</p>
                      <div className={styles.cardMeta}>
                        <span className={styles.metaItem}>
                          <strong>Type:</strong> {product.type || 'clothing'}
                        </span>
                        <span className={`${styles.statusBadge} ${styles[product.status || 'normal']}`}>
                          {(product.status || 'normal').replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.cardPrice}>
                        {product.discount_price && (
                          <span className={styles.price}>
                            ₹{product.discount_price}
                          </span>
                        )}
                        <span className={styles.discountPrice}>₹{product.price}</span>
                      </div>
                      <p className={styles.cardStock}>Stock: {product.stock}</p>
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => handleEdit(product)}
                          className={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {products.length === 0 && (
              <div className={styles.emptyState}>
                <p>No products found. Add your first product!</p>
              </div>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            <div className={styles.toolbar}>
              <h2 className={styles.pageTitle}>Order Management</h2>
              <div className={styles.toolbarActions}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Search by Order ID..."
                    value={orderSearchId}
                    onChange={(e) => setOrderSearchId(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      width: '200px'
                    }}
                  />
                  {orderSearchId && (
                    <button
                      onClick={() => setOrderSearchId('')}
                      style={{
                        padding: '8px 12px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowPrintModal(true)}
                  style={{
                    padding: '8px 16px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🖨️</span> Print Orders
                </button>
                <div className={styles.filterGroup}>
                  <label style={{ fontSize: '14px', fontWeight: '500' }}>Status:</label>
                  <select
                    value={filterConfig.order_status}
                    onChange={(e) => setFilterConfig({ ...filterConfig, order_status: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="all">All Status</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label style={{ fontSize: '14px', fontWeight: '500' }}>Payment:</label>
                  <select
                    value={filterConfig.payment_status}
                    onChange={(e) => setFilterConfig({ ...filterConfig, payment_status: e.target.value })}
                    style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="all">All Payment</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                    <th
                      style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => requestSort('payment_status')}
                    >
                      Payment {sortConfig.key === 'payment_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => requestSort('order_status')}
                    >
                      Status {sortConfig.key === 'order_status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAndSortedOrders().map((order) => (
                    <tr
                      key={order.id}
                      style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => setSelectedOrder(order)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '12px' }}>#{order.id}</td>
                      <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.customer_phone}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{Number(order.total_amount).toLocaleString()}</td>

                      {/* Payment Status with Toggle */}
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentStatusClick(order);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: order.payment_status === 'paid' ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            backgroundColor: order.payment_status === 'paid' ? '#d4edda' : '#fff3cd',
                            color: order.payment_status === 'paid' ? '#155724' : '#856404',
                            opacity: order.payment_status === 'paid' ? 0.7 : 1
                          }}
                        >
                          {order.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                        </button>
                      </td>

                      {/* Order Status Badge */}
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            backgroundColor: order.order_status === 'delivered' ? '#d4edda' :
                              order.order_status === 'shipped' ? '#cce5ff' :
                                order.order_status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                            color: order.order_status === 'delivered' ? '#155724' :
                              order.order_status === 'shipped' ? '#004085' :
                                order.order_status === 'cancelled' ? '#721c24' : '#383d41'
                          }}>
                            {order.order_status || 'Processing'}
                          </span>
                          {order.is_cancelled && (
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              backgroundColor: '#fff3cd',
                              color: '#856404',
                              display: 'inline-block'
                            }}>
                              👤 User Cancelled
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          color: '#666',
                          background: '#f0f0f0',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {order.payment_method || 'N/A'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px' }}>
                        {order.order_status !== 'shipped' && order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'shipped', 'order')}
                            style={{
                              padding: '6px 12px',
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '8px',
                              fontSize: '13px'
                            }}
                          >
                            Pass Order
                          </button>
                        )}

                        {order.order_status === 'shipped' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'delivered', 'order')}
                            style={{
                              padding: '6px 12px',
                              background: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '8px',
                              fontSize: '13px'
                            }}
                          >
                            Mark Delivered
                          </button>
                        )}

                        {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancelingOrderId(order.id);
                              setShowCancelModal(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No orders found yet.</p>
                </div>
              )}
            </div>
          </>
        )
        }

        {/* Users Tab */}
        {
          activeTab === 'users' && (
            <>
              <div className={styles.toolbar}>
                <h2 className={styles.pageTitle}>User Management</h2>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        paddingLeft: '32px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        width: '250px',
                        fontSize: '14px'
                      }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>🔍</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                      <th
                        style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => requestSort('id')}
                      >
                        ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => requestSort('name')}
                      >
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Loading users...</td></tr>
                    ) : getFilteredAndSortedUsers().map((user) => (
                      <tr
                        key={user.id}
                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                        onClick={() => setSelectedUser(user)}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <td style={{ padding: '12px', fontSize: '11px', color: '#666' }}>#{user.id.toString().slice(0, 8)}...</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '600' }}>{user.name}</div>
                        </td>
                        <td style={{ padding: '12px' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            background: user.role === 'admin' ? '#fde0e0' : '#e0e7ff',
                            color: user.role === 'admin' ? '#c53030' : '#3730a3'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                            style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px' }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!usersLoading && users.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>No users found.</p>
                  </div>
                )}
              </div>
            </>
          )
        }

        {/* FAQ Tab */}
        {
          activeTab === 'faqs' && (
            <>
              <div className={styles.toolbar}>
                <h2 className={styles.pageTitle}>FAQ Management</h2>
                <button
                  onClick={() => {
                    setEditingFaq(null);
                    setFaqFormData({ question: '', answer: '', category: 'General' });
                    setShowFaqModal(true);
                  }}
                  className={styles.addBtn}
                >
                  + Add FAQ
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.baseTable}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Question</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqsLoading ? (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Loading FAQs...</td></tr>
                    ) : faqs.length === 0 ? (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No FAQs found.</td></tr>
                    ) : (
                      faqs.map((faq) => (
                        <tr key={faq.id}>
                          <td style={{ fontWeight: '500', color: '#666' }}>{faq.category}</td>
                          <td style={{ fontWeight: '500' }}>{faq.question}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditFaq(faq)}
                                style={{ padding: '6px 12px', background: '#e3f2fd', color: '#1976d2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(faq.id)}
                                style={{ padding: '6px 12px', background: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )
        }

        {/* Refunds Tab */}
        {
          activeTab === 'refunds' && (
            <>
              <div className={styles.toolbar}>
                <h2 className={styles.pageTitle}>Refund Requests Management</h2>
                <div className={styles.toolbarActions}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Search by Order ID..."
                      value={refundSearchId}
                      onChange={(e) => setRefundSearchId(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        width: '200px'
                      }}
                    />
                    {refundSearchId && (
                      <button
                        onClick={() => setRefundSearchId('')}
                        style={{
                          padding: '8px 12px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <button
                    onClick={fetchRefunds}
                    className={styles.addBtn}
                    style={{ background: '#17a2b8' }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.baseTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Date Requested</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundsLoading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading refund requests...</td></tr>
                    ) : refunds.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No refund requests found.</td></tr>
                    ) : (
                      refunds
                        .filter(refund => {
                          if (!refundSearchId.trim()) return true;
                          return refund.order_id?.toString().includes(refundSearchId.trim());
                        })
                        .map((refund) => (
                        <tr key={refund.id}>
                          <td style={{ fontWeight: '600', color: '#333' }}>#{refund.order_id}</td>
                          <td>
                            <div>{refund.customer_name || 'N/A'}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{refund.customer_email}</div>
                          </td>
                          <td>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              background: 
                                refund.status === 'pending' ? '#fff3cd' :
                                refund.status === 'approved' ? '#d4edda' :
                                refund.status === 'processing' ? '#cce5ff' :
                                refund.status === 'completed' ? '#d1e7dd' :
                                refund.status === 'rejected' ? '#f8d7da' : '#e2e3e5',
                              color:
                                refund.status === 'pending' ? '#856404' :
                                refund.status === 'approved' ? '#155724' :
                                refund.status === 'processing' ? '#004085' :
                                refund.status === 'completed' ? '#0f5132' :
                                refund.status === 'rejected' ? '#721c24' : '#383d41'
                            }}>
                              {refund.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600' }}>₹{Number(refund.refund_amount || 0).toLocaleString()}</td>
                          <td>{new Date(refund.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowRefundModal(true);
                              }}
                              style={{ 
                                padding: '6px 12px', 
                                background: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                width: '100%'
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )
        }

        {
          activeTab === 'payments' && (
            <>
              <div className={styles.toolbar}>
                <h2 className={styles.pageTitle}>Financial Overview</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowPrintPaymentsModal(true)}
                    style={{
                      padding: '8px 16px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🖨️</span> Print Payments
                  </button>
                  <select
                    className={styles.filterSelect}
                    value={paymentsSort}
                    onChange={(e) => setPaymentsSort(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="monthly">Monthly View</option>
                  </select>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={`${styles.statCard}`} style={{ borderLeft: '4px solid #7a2d2d' }}>
                  <h3 className={styles.statTitle}>Total Revenue</h3>
                  <p className={styles.statValue}>₹{orders.reduce((acc, order) => acc + (order.total_amount || 0), 0).toLocaleString()}</p>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #00c853' }}>
                  <h3 className={styles.statTitle}>Online Payments (Razorpay/UPI)</h3>
                  <p className={styles.statValue} style={{ color: '#00c853' }}>₹{orders.filter(o => o.payment_method === 'online').reduce((acc, order) => acc + (order.total_amount || 0), 0).toLocaleString()}</p>
                  <div className={styles.statSub}>{orders.filter(o => o.payment_method === 'online').length} Transactions</div>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #ffa000' }}>
                  <h3 className={styles.statTitle}>Cash on Delivery (COD)</h3>
                  <p className={styles.statValue} style={{ color: '#ffa000' }}>₹{orders.filter(o => o.payment_method === 'cod').reduce((acc, order) => acc + (order.total_amount || 0), 0).toLocaleString()}</p>
                  <div className={styles.statSub}>{orders.filter(o => o.payment_method === 'cod').length} Transactions</div>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <h3 className={styles.tableTitle}>Recent Transactions</h3>
                <table className={styles.baseTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedPayments().map((order) => (
                      <tr
                        key={order.id}
                        className={styles.clickableRow}
                        onClick={() => {
                          setSelectedOrder(order);
                          setActiveTab('orders');
                        }}
                      >
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>#{order.id}</td>
                        <td>
                          <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{order.customer_email}</div>
                        </td>
                        <td>
                          <span className={`${styles.methodBadge} ${order.payment_method === 'online' ? styles.online : styles.cod}`}>
                            {order.payment_method === 'online' ? 'Razorpay/UPI' : 'COD'}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>₹{order.total_amount?.toLocaleString()}</td>
                        <td>
                          <span className={order.payment_status === 'paid' ? styles.statusBadgePaid : styles.statusBadgePending}>
                            {order.payment_status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        }

        {/* Failed Orders Tab */}
        {
          activeTab === 'failed-orders' && (
            <>
              <div className={styles.toolbar}>
                <h2 className={styles.pageTitle}>Failed Order Attempts</h2>
                <div className={styles.toolbarActions}>
                  <button
                    onClick={fetchFailedOrders}
                    className={styles.addBtn}
                    style={{ background: '#17a2b8' }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.baseTable}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Failure Reason</th>
                      <th>Status</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedOrdersLoading ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading failed orders...</td></tr>
                    ) : failedOrders.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No failed orders found.</td></tr>
                    ) : (
                      failedOrders.map((failedOrder) => (
                        <tr key={failedOrder.id}>
                          <td>
                            <div style={{ fontWeight: '500' }}>{failedOrder.customer_email}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{failedOrder.customer_phone}</div>
                          </td>
                          <td>{new Date(failedOrder.created_at).toLocaleString()}</td>
                          <td style={{ fontWeight: '600' }}>₹{Number(failedOrder.submitted_total || 0).toLocaleString()}</td>
                          <td>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              background: 
                                failedOrder.failure_reason === 'price_verification' ? '#fff3cd' :
                                failedOrder.failure_reason === 'signature_verification' ? '#f8d7da' :
                                failedOrder.failure_reason === 'amount_mismatch' ? '#ffe5cc' :
                                failedOrder.failure_reason === 'payment_status_invalid' ? '#e2e3e5' : '#f8f9fa',
                              color:
                                failedOrder.failure_reason === 'price_verification' ? '#856404' :
                                failedOrder.failure_reason === 'signature_verification' ? '#721c24' :
                                failedOrder.failure_reason === 'amount_mismatch' ? '#cc5200' :
                                failedOrder.failure_reason === 'payment_status_invalid' ? '#383d41' : '#495057'
                            }}>
                              {failedOrder.failure_reason?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            {failedOrder.resolved ? (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: '#d4edda',
                                color: '#155724'
                              }}>
                                RESOLVED
                              </span>
                            ) : (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: '#fff3cd',
                                color: '#856404'
                              }}>
                                PENDING
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedFailedOrder(failedOrder);
                                setShowFailedOrderModal(true);
                              }}
                              style={{ 
                                padding: '6px 12px', 
                                background: '#007bff', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                width: '100%'
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )
        }
      </main >

      {/* User Details Modal */}
      {
        selectedUser && (
          <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className={styles.modalHeader}>
                <h2>User Details</h2>
                <button onClick={() => setSelectedUser(null)} className={styles.closeBtn}>&times;</button>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><strong>ID:</strong> {selectedUser.id}</div>
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</div>
                  <div><strong>Role:</strong> {selectedUser.role}</div>
                  <div><strong>Joined:</strong> {new Date(selectedUser.created_at).toLocaleString()}</div>

                  <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Additional Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><strong>Age:</strong> {selectedUser.age || 'N/A'}</div>
                      <div><strong>Gender:</strong> {selectedUser.gender || 'N/A'}</div>
                    </div>
                    <div style={{ marginTop: '8px' }}><strong>Address:</strong> {selectedUser.address || 'N/A'}</div>
                  </div>

                  {selectedUser.role !== 'admin' && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Remove User
                      </button>
                      <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Warning: This will permanently delete the user's account and data.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }


      {/* Order Details Modal */}
      {
        selectedOrder && (
          <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
            <div className={styles.modalAnimated} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={styles.closeBtn}
                >
                  ×
                </button>
              </div>

              <div className={styles.form}>
                {/* User Cancelled Order Alert */}
                {selectedOrder.is_cancelled && (
                  <div style={{
                    padding: '16px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '24px' }}>👤</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#856404', fontSize: '14px' }}>
                        User Cancelled Order
                      </div>
                      {selectedOrder.cancel_reason && (
                        <div style={{ fontSize: '13px', color: '#856404', marginTop: '4px' }}>
                          Reason: {selectedOrder.cancel_reason}
                        </div>
                      )}
                      {selectedOrder.cancelled_at && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Cancelled on: {new Date(selectedOrder.cancelled_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Status Bar */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>Status: </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      backgroundColor: selectedOrder.order_status === 'delivered' ? '#d4edda' :
                        selectedOrder.order_status === 'shipped' ? '#cce5ff' :
                          selectedOrder.order_status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                      color: selectedOrder.order_status === 'delivered' ? '#155724' :
                        selectedOrder.order_status === 'shipped' ? '#004085' :
                          selectedOrder.order_status === 'cancelled' ? '#721c24' : '#856404'
                    }}>
                      {selectedOrder.order_status || 'Processing'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>Payment: </span>
                    <button
                      onClick={() => handlePaymentStatusClick(selectedOrder)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: selectedOrder.payment_status === 'paid' ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                        backgroundColor: selectedOrder.payment_status === 'paid' ? '#d4edda' : '#fff3cd',
                        color: selectedOrder.payment_status === 'paid' ? '#155724' : '#856404',
                        opacity: selectedOrder.payment_status === 'paid' ? 0.7 : 1
                      }}
                    >
                      {selectedOrder.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                    </button>
                  </div>
                </div>

                <div className={styles.formRow}>
                  {/* Customer Details */}
                  <div className={styles.formGroup}>
                    <h3>Customer Details</h3>
                    {selectedOrder.user_id && (
                      <p><strong>User ID:</strong> <span style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{selectedOrder.user_id}</span></p>
                    )}
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>Payment Method:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedOrder.payment_method || 'N/A'}</span></p>
                    
                    {/* ADD RAZORPAY DETAILS HERE - Only show for online payments */}
                    {selectedOrder.payment_method === 'online' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                        <h4 style={{ marginBottom: '12px', color: '#2563eb', fontSize: '14px' }}>Razorpay Payment Details</h4>
                        {selectedOrder.razorpay_order_id && (
                          <p style={{ marginBottom: '8px' }}>
                            <strong>Order ID:</strong> 
                            <code style={{ 
                              background: '#f1f5f9', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginLeft: '8px',
                              wordBreak: 'break-all',
                              display: 'inline-block'
                            }}>{selectedOrder.razorpay_order_id}</code>
                          </p>
                        )}
                        {selectedOrder.razorpay_payment_id && (
                          <p style={{ marginBottom: '8px' }}>
                            <strong>Payment ID:</strong> 
                            <code style={{ 
                              background: '#f1f5f9', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginLeft: '8px',
                              wordBreak: 'break-all',
                              display: 'inline-block'
                            }}>{selectedOrder.razorpay_payment_id}</code>
                          </p>
                        )}
                        {selectedOrder.razorpay_signature && (
                          <p style={{ marginBottom: '8px' }}>
                            <strong>Signature:</strong> 
                            <code style={{ 
                              background: '#f1f5f9', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginLeft: '8px',
                              wordBreak: 'break-all',
                              display: 'inline-block',
                              maxWidth: '100%'
                            }}>{selectedOrder.razorpay_signature}</code>
                          </p>
                        )}
                        {!selectedOrder.razorpay_order_id && !selectedOrder.razorpay_payment_id && (
                          <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '13px' }}>No Razorpay details available for this order</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className={styles.formGroup}>
                    <h3>Shipping Address</h3>
                    <p>{selectedOrder.shipping_address}</p>
                    <p>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                    <p>{selectedOrder.country}</p>
                  </div>
                </div>

                {(selectedOrder.order_status?.toLowerCase() === 'cancelled' || selectedOrder.order_status === 'Cancelled') && (
                  <div style={{
                    borderLeft: '4px solid #dc3545',
                    background: '#fff5f5',
                    padding: '16px',
                    marginBottom: '24px',
                    borderRadius: '8px',
                    display: 'block',
                    width: '100%'
                  }}>
                    <h3 style={{ color: '#dc3545', margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase' }}>Cancellation Reason</h3>
                    <p style={{ fontStyle: 'italic', color: '#721c24', margin: 0, fontSize: '15px' }}>
                      "{selectedOrder.cancel_reason || selectedOrder.reason || 'No reason provided'}"
                    </p>
                  </div>
                )}
              </div>

              {/* Products List */}
              <h3>Ordered Products</h3>
              <div style={{ marginBottom: '24px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>Image</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Product</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>#{item.id || item.product_id || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <img
                            src={item.image || item.image_url || 'https://via.placeholder.com/50'}
                            alt={item.name}
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}
                            onClick={() => setSelectedImage(item.image || item.image_url)}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</div>
                          {item.selectedSize && <div style={{ fontSize: '12px', color: '#666' }}>Size: {item.selectedSize}</div>}
                          {item.selectedColor && <div style={{ fontSize: '12px', color: '#666' }}>Color: <span style={{ display: 'inline-block', width: '10px', height: '10px', background: item.selectedColor, borderRadius: '50%', verticalAlign: 'middle', marginLeft: '4px' }}></span></div>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot style={{ background: '#f8f9fa' }}>
                    <tr>
                      <td colSpan="5" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>₹{Number(selectedOrder.total_amount).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions */}
              <div className={styles.formActions}>
                {selectedOrder.order_status !== 'shipped' && selectedOrder.order_status !== 'delivered' && selectedOrder.order_status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'shipped', 'order');
                      setSelectedOrder(null);
                    }}
                    className={styles.saveBtn}
                    style={{ background: '#007bff' }}
                  >
                    Pass Order (Ship)
                  </button>
                )}

                {selectedOrder.order_status === 'shipped' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedOrder.id, 'delivered', 'order');
                      setSelectedOrder(null);
                    }}
                    className={styles.saveBtn}
                    style={{ background: '#28a745' }}
                  >
                    Mark as Delivered
                  </button>
                )}

                {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && (
                  <button
                    onClick={() => {
                      setCancelingOrderId(selectedOrder.id);
                      setShowCancelModal(true);
                    }}
                    className={styles.cancelBtn}
                    style={{ background: '#dc3545', color: 'white' }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

            </div>
          </div>
        )
      }

      {/* FAQ Modal */}
      {
        showFaqModal && (
          <div className={styles.modalOverlay} onClick={() => setShowFaqModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className={styles.modalHeader}>
                <h2>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                <button onClick={() => setShowFaqModal(false)} className={styles.closeBtn}>&times;</button>
              </div>

              <form onSubmit={handleSaveFaq} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <select
                      value={faqFormData.category}
                      onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
                      required
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                      <option value="General">General</option>
                      <option value="Orders">Orders</option>
                      <option value="Payments">Payments</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Account">Account</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Question</label>
                    <input
                      type="text"
                      value={faqFormData.question}
                      onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                      required
                      placeholder="Enter question"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Answer</label>
                    <textarea
                      value={faqFormData.answer}
                      onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                      required
                      placeholder="Enter answer"
                      rows="5"
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setShowFaqModal(false)} className={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {editingFaq ? 'Update' : 'Save'} FAQ
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Product Modal */}
      {
        showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={styles.closeBtn}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter product name"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Search Key (Key terms for searching)</label>
                    <input
                      type="text"
                      name="searchkey"
                      value={formData.searchkey}
                      onChange={handleChange}
                      placeholder="e.g. red silk saree wedding"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Sarees">Sarees</option>
                      <option value="Lehengas">Lehengas</option>
                      <option value="Jewelry">Jewelry</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="clothing">Clothing</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="accessories">Accessories</option>
                      <option value="footwear">Footwear</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="normal">Normal</option>
                      <option value="trending">Trending</option>
                      <option value="featured">Featured</option>
                      <option value="most_bought">Most Bought</option>
                      <option value="new_arrival">New Arrival</option>
                      <option value="sale">Sale</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Discount Price</label>
                    <input
                      type="number"
                      name="discount_price"
                      value={formData.discount_price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Image URLs</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                      placeholder="https://example.com/image.jpg"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className={styles.addBtn}
                      style={{
                        padding: '8px 16px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {formData.image_url.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formData.image_url.map((url, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                          <span style={{ flex: 1, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {url}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            style={{
                              padding: '4px 8px',
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter product description"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                    />
                    <span>Mark as Featured</span>
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {editingProduct ? 'Update' : 'Create'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Image Zoom Modal */}
      {
        selectedImage && (
          <div className={styles.imageModalOverlay} onClick={() => setSelectedImage(null)}>
            <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.imageModalClose}
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
              <img src={selectedImage} alt="Zoomed Product" />
            </div>
          </div>
        )
      }

      {/* Cancellation Reason Modal */}
      {
        showCancelModal && (
          <div className={styles.modalOverlay} onClick={() => {
            setShowCancelModal(false);
            setCancelReason('');
            setCancelingOrderId(null);
          }}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className={styles.modalHeader}>
                <h2>Cancel Order</h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setCancelingOrderId(null);
                  }}
                  className={styles.closeBtn}
                >
                  &times;
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ marginBottom: '15px', color: '#666' }}>Please provide a reason for canceling order #{cancelingOrderId}.</p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason (e.g. Out of stock, Customer request)..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '20px',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                      setCancelingOrderId(null);
                    }}
                    className={styles.secondaryBtn}
                    style={{ flex: 1 }}
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => {
                      if (!cancelReason.trim()) {
                        alert('Please provide a reason');
                        return;
                      }
                      handleStatusUpdate(cancelingOrderId, 'cancelled', 'order', cancelReason);
                      setShowCancelModal(false);
                      setCancelReason('');
                      setCancelingOrderId(null);
                      if (selectedOrder && selectedOrder.id === cancelingOrderId) {
                        setSelectedOrder({ ...selectedOrder, order_status: 'cancelled', cancel_reason: cancelReason });
                      }
                    }}
                    className={styles.deleteBtn}
                    style={{ flex: 1, background: '#dc3545' }}
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Print Orders Modal */}
      {showPrintModal && (
        <PrintOrdersModal 
          orders={orders}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Print Payments Modal */}
      {showPrintPaymentsModal && (
        <PrintPaymentsModal 
          orders={orders}
          onClose={() => setShowPrintPaymentsModal(false)}
        />
      )}

      {/* COD Payment Confirmation Modal */}
      {showCODPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowCODPaymentModal(false);
          setCodPaymentOrderId(null);
        }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className={styles.modalHeader}>
              <h2>Confirm COD Payment</h2>
              <button
                onClick={() => {
                  setShowCODPaymentModal(false);
                  setCodPaymentOrderId(null);
                }}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#856404', fontSize: '15px' }}>
                  ⚠️ Important Notice
                </p>
                <p style={{ margin: 0, color: '#856404', fontSize: '14px', lineHeight: '1.5' }}>
                  Once you mark this payment as PAID, it <strong>cannot be reverted</strong> back to PENDING. 
                  Please make sure you have received the cash payment before confirming.
                </p>
              </div>
              
              <p style={{ marginBottom: '24px', color: '#666', fontSize: '14px' }}>
                Are you sure you want to mark Order #{codPaymentOrderId} as PAID?
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowCODPaymentModal(false);
                    setCodPaymentOrderId(null);
                  }}
                  className={styles.secondaryBtn}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCODPayment}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Confirm Payment Received
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Details Modal */}
      {showRefundModal && selectedRefund && (
        <div className={styles.modalOverlay} onClick={() => setShowRefundModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader}>
              <h2>Refund Request Details</h2>
              <button
                onClick={() => setShowRefundModal(false)}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Order Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Order Information</h3>
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Order ID:</span>
                    <span style={{ fontWeight: '600' }}>#{selectedRefund.order_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Refund Amount:</span>
                    <span style={{ fontWeight: '600', color: '#28a745' }}>₹{Number(selectedRefund.refund_amount || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Payment Method:</span>
                    <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{selectedRefund.payment_method}</span>
                  </div>
                  {selectedRefund.razorpay_payment_id && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Razorpay ID:</span>
                      <span style={{ fontWeight: '600', fontSize: '12px', fontFamily: 'monospace', color: '#007bff' }}>{selectedRefund.razorpay_payment_id}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Request Date:</span>
                    <span style={{ fontWeight: '600' }}>{new Date(selectedRefund.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Customer Information</h3>
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Name:</span>
                    <span style={{ fontWeight: '600' }}>{selectedRefund.customer_name || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Email:</span>
                    <span style={{ fontWeight: '600' }}>{selectedRefund.customer_email}</span>
                  </div>
                </div>
              </div>

              {/* Refund Payment Details */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Refund Payment Details</h3>
                <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '8px', border: '1px solid #4caf50' }}>
                  {selectedRefund.payment_method?.toLowerCase() === 'cod' ? (
                    // COD Order - Show customer's bank/UPI details
                    selectedRefund.refund_mode === 'upi' ? (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          💵 COD Order - Refund via UPI
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#666', fontSize: '14px' }}>UPI ID:</span>
                          <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'monospace', color: '#1976d2' }}>{selectedRefund.upi_id}</span>
                        </div>
                      </div>
                    ) : selectedRefund.refund_mode === 'bank' ? (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          💵 COD Order - Refund via Bank Transfer
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', fontSize: '14px' }}>Account Holder:</span>
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{selectedRefund.bank_account_holder_name}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', fontSize: '14px' }}>Account Number:</span>
                            <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'monospace' }}>{selectedRefund.bank_account_number}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666', fontSize: '14px' }}>IFSC Code:</span>
                            <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'monospace', color: '#1976d2' }}>{selectedRefund.bank_ifsc_code}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💵</div>
                        <div style={{ fontWeight: '600', color: '#2e7d32', fontSize: '16px' }}>Cash on Delivery</div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Customer needs to provide refund details</div>
                      </div>
                    )
                  ) : (
                    // Online Payment - Show Razorpay details
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        💳 Online Payment - Auto Refund via Razorpay
                      </div>
                      {(selectedRefund.razorpay_payment_id || selectedRefund.razorpay_order_id) ? (
                        <div>
                          {selectedRefund.razorpay_order_id && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#666', fontSize: '14px' }}>Razorpay Order ID:</span>
                              <span style={{ fontWeight: '600', fontSize: '12px', fontFamily: 'monospace', color: '#1976d2' }}>{selectedRefund.razorpay_order_id}</span>
                            </div>
                          )}
                          {selectedRefund.razorpay_payment_id && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#666', fontSize: '14px' }}>Razorpay Payment ID:</span>
                              <span style={{ fontWeight: '600', fontSize: '12px', fontFamily: 'monospace', color: '#1976d2' }}>{selectedRefund.razorpay_payment_id}</span>
                            </div>
                          )}
                          <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', marginTop: '8px' }}>
                            Refund will be automatically processed to customer's original payment method
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                          Refund will be processed to customer's original payment method
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Details */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Refund Details</h3>
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Reason:</label>
                    <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>{selectedRefund.reason}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Pickup Address:</label>
                    <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>{selectedRefund.pickup_address}</p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Current Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: 
                      selectedRefund.status === 'pending' ? '#fff3cd' :
                      selectedRefund.status === 'approved' ? '#d4edda' :
                      selectedRefund.status === 'processing' ? '#cce5ff' :
                      selectedRefund.status === 'completed' ? '#d1e7dd' :
                      selectedRefund.status === 'rejected' ? '#f8d7da' : '#e2e3e5',
                    color:
                      selectedRefund.status === 'pending' ? '#856404' :
                      selectedRefund.status === 'approved' ? '#155724' :
                      selectedRefund.status === 'processing' ? '#004085' :
                      selectedRefund.status === 'completed' ? '#0f5132' :
                      selectedRefund.status === 'rejected' ? '#721c24' : '#383d41'
                  }}>
                    {selectedRefund.status}
                  </span>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRefund.admin_notes && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Admin Notes</h3>
                  <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px', border: '1px solid #ffc107' }}>
                    <p style={{ margin: 0, color: '#856404', lineHeight: '1.5' }}>{selectedRefund.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Status Update Actions */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Update Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => openAdminNotesModal(selectedRefund.id, 'approved')}
                    disabled={selectedRefund.status === 'approved' || selectedRefund.status === 'completed'}
                    style={{
                      padding: '10px',
                      background: selectedRefund.status === 'approved' ? '#ccc' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedRefund.status === 'approved' ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openAdminNotesModal(selectedRefund.id, 'rejected')}
                    disabled={selectedRefund.status === 'rejected' || selectedRefund.status === 'completed'}
                    style={{
                      padding: '10px',
                      background: selectedRefund.status === 'rejected' ? '#ccc' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedRefund.status === 'rejected' ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openAdminNotesModal(selectedRefund.id, 'processing')}
                    disabled={selectedRefund.status === 'processing' || selectedRefund.status === 'completed'}
                    style={{
                      padding: '10px',
                      background: selectedRefund.status === 'processing' ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedRefund.status === 'processing' ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => openAdminNotesModal(selectedRefund.id, 'completed')}
                    disabled={selectedRefund.status === 'completed'}
                    style={{
                      padding: '10px',
                      background: selectedRefund.status === 'completed' ? '#ccc' : '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedRefund.status === 'completed' ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Complete
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowRefundModal(false)}
                className={styles.secondaryBtn}
                style={{ width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Modal */}
      {showAdminNotesModal && pendingRefundStatus && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowAdminNotesModal(false);
          setPendingRefundStatus(null);
          setAdminNotesInput('');
        }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Add Admin Notes</h2>
              <button
                onClick={() => {
                  setShowAdminNotesModal(false);
                  setPendingRefundStatus(null);
                  setAdminNotesInput('');
                }}
                className={styles.closeBtn}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Order ID:</strong> #{selectedRefund?.order_id}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  <strong>New Status:</strong> <span style={{ 
                    textTransform: 'uppercase', 
                    fontWeight: '600',
                    color: 
                      pendingRefundStatus.status === 'approved' ? '#28a745' :
                      pendingRefundStatus.status === 'rejected' ? '#dc3545' :
                      pendingRefundStatus.status === 'processing' ? '#007bff' :
                      pendingRefundStatus.status === 'completed' ? '#17a2b8' : '#333'
                  }}>
                    {pendingRefundStatus.status}
                  </span>
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                  Admin Notes {pendingRefundStatus.status === 'rejected' ? <span style={{ color: '#dc3545' }}>*</span> : '(Optional)'}
                </label>
                <textarea
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder={
                    pendingRefundStatus.status === 'approved' ? 'Add any notes about the approval...' :
                    pendingRefundStatus.status === 'rejected' ? 'Please provide a reason for rejection...' :
                    pendingRefundStatus.status === 'processing' ? 'Add processing details...' :
                    'Add completion notes...'
                  }
                  rows={5}
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

              {pendingRefundStatus.status === 'rejected' && !adminNotesInput.trim() && (
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#856404'
                }}>
                  ⚠️ Please provide a reason for rejection
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowAdminNotesModal(false);
                    setPendingRefundStatus(null);
                    setAdminNotesInput('');
                  }}
                  className={styles.secondaryBtn}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (pendingRefundStatus.status === 'rejected' && !adminNotesInput.trim()) {
                      alert('Please provide a reason for rejection');
                      return;
                    }
                    handleRefundStatusUpdate();
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: 
                      pendingRefundStatus.status === 'approved' ? '#28a745' :
                      pendingRefundStatus.status === 'rejected' ? '#dc3545' :
                      pendingRefundStatus.status === 'processing' ? '#007bff' :
                      '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Order Details Modal */}
      {showFailedOrderModal && selectedFailedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowFailedOrderModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className={styles.modalHeader}>
              <h2>Failed Order Details</h2>
              <button onClick={() => setShowFailedOrderModal(false)} className={styles.closeBtn}>&times;</button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Status Badge */}
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                {selectedFailedOrder.resolved ? (
                  <span style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: '#d4edda',
                    color: '#155724',
                    display: 'inline-block'
                  }}>
                    ✓ RESOLVED
                  </span>
                ) : (
                  <span style={{
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: '#fff3cd',
                    color: '#856404',
                    display: 'inline-block'
                  }}>
                    ⚠ PENDING REVIEW
                  </span>
                )}
              </div>

              {/* Failure Information */}
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#721c24', fontSize: '14px', fontWeight: '600' }}>Failure Reason</h3>
                <div style={{ fontSize: '14px', color: '#721c24', fontWeight: '500' }}>
                  {selectedFailedOrder.failure_reason?.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: '13px', color: '#721c24', marginTop: '4px' }}>
                  {selectedFailedOrder.failure_message}
                </div>
              </div>

              {/* Customer Information */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '2px solid #dee2e6', paddingBottom: '8px' }}>Customer Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <strong>Name:</strong> {selectedFailedOrder.customer_name}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedFailedOrder.customer_phone}
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Email:</strong> {selectedFailedOrder.customer_email}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '2px solid #dee2e6', paddingBottom: '8px' }}>Shipping Address</h3>
                <div>
                  <div>{selectedFailedOrder.shipping_address}</div>
                  <div>{selectedFailedOrder.city}, {selectedFailedOrder.state} - {selectedFailedOrder.pincode}</div>
                  <div>{selectedFailedOrder.country}</div>
                </div>
              </div>

              {/* Order Details */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '2px solid #dee2e6', paddingBottom: '8px' }}>Order Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <strong>Submitted Total:</strong> <span style={{ color: '#dc3545', fontWeight: '600' }}>₹{Number(selectedFailedOrder.submitted_total || 0).toLocaleString()}</span>
                  </div>
                  {selectedFailedOrder.calculated_total && (
                    <div>
                      <strong>Calculated Total:</strong> <span style={{ color: '#28a745', fontWeight: '600' }}>₹{Number(selectedFailedOrder.calculated_total || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Attempt Date:</strong> {new Date(selectedFailedOrder.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Products */}
                <div style={{ marginTop: '12px' }}>
                  <strong>Products:</strong>
                  <div style={{ marginTop: '8px', maxHeight: '200px', overflow: 'auto' }}>
                    {selectedFailedOrder.items && Array.isArray(selectedFailedOrder.items) ? (
                      selectedFailedOrder.items.map((item, index) => (
                        <div key={index} style={{ 
                          padding: '8px',
                          background: '#f8f9fa',
                          borderRadius: '4px',
                          marginBottom: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px'
                        }}>
                          <span>{item.name} (x{item.quantity})</span>
                          <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '13px', color: '#666' }}>No items available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {selectedFailedOrder.razorpay_payment_id && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '2px solid #dee2e6', paddingBottom: '8px' }}>Payment Information</h3>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Payment ID:</strong> <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px' }}>{selectedFailedOrder.razorpay_payment_id}</code>
                    </div>
                    {selectedFailedOrder.razorpay_order_id && (
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Order ID:</strong> <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px' }}>{selectedFailedOrder.razorpay_order_id}</code>
                      </div>
                    )}
                    {selectedFailedOrder.payment_amount && (
                      <div>
                        <strong>Payment Amount:</strong> ₹{(selectedFailedOrder.payment_amount / 100).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedFailedOrder.admin_notes && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#d1ecf1', borderRadius: '8px', border: '1px solid #bee5eb' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#0c5460', fontSize: '14px', fontWeight: '600' }}>Admin Notes</h3>
                  <div style={{ fontSize: '13px', color: '#0c5460' }}>
                    {selectedFailedOrder.admin_notes}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!selectedFailedOrder.resolved && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      const notes = prompt('Add admin notes (optional):');
                      markFailedOrderResolved(selectedFailedOrder.id, true, notes || '');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}

              {selectedFailedOrder.resolved && selectedFailedOrder.resolved_at && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Resolved on: {new Date(selectedFailedOrder.resolved_at).toLocaleString()}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowFailedOrderModal(false)}
                className={styles.secondaryBtn}
                style={{ width: '100%', marginTop: '20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
