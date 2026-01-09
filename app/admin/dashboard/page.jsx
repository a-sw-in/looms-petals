'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Dashboard.module.css';

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

  useEffect(() => {
    checkAuth();
    fetchProducts();
    fetchOrders();
    fetchUsers();
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

  const handleStatusUpdate = async (id, status, type) => {
    try {
      // Optimistic update
      const updatedOrders = orders.map(order => {
        if (order.id === id) {
          if (type === 'payment') return { ...order, payment_status: status };
          if (type === 'order') return { ...order, order_status: status };
        }
        return order;
      });
      setOrders(updatedOrders);

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, type }),
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

    // Apply Filters
    if (filterConfig.order_status !== 'all') {
      filteredOrders = filteredOrders.filter(order => (order.order_status || 'processing') === filterConfig.order_status);
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
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className={styles.toolbar}>
              <h2 className={styles.pageTitle}>Product Management</h2>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <span className={styles.price}>₹{product.price}</span>
                        {product.discount_price && (
                          <span className={styles.discountPrice}>
                            ₹{product.discount_price}
                          </span>
                        )}
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
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          onClick={() => handleStatusUpdate(order.id, order.payment_status === 'paid' ? 'pending' : 'paid', 'payment')}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px',
                            backgroundColor: order.payment_status === 'paid' ? '#d4edda' : '#fff3cd',
                            color: order.payment_status === 'paid' ? '#155724' : '#856404'
                          }}
                        >
                          {order.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                        </button>
                      </td>

                      {/* Order Status Badge */}
                      <td style={{ padding: '12px' }}>
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
                            onClick={() => {
                              if (confirm('Cancel this order?')) handleStatusUpdate(order.id, 'cancelled', 'order');
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
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
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
        )}
      </main>

      {/* User Details Modal */}
      {selectedUser && (
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
      )}


      {/* Order Details Modal */}
      {selectedOrder && (
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
                    onClick={() => handleStatusUpdate(selectedOrder.id, selectedOrder.payment_status === 'paid' ? 'pending' : 'paid', 'payment')}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                      backgroundColor: selectedOrder.payment_status === 'paid' ? '#d4edda' : '#fff3cd',
                      color: selectedOrder.payment_status === 'paid' ? '#155724' : '#856404'
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
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                  <p><strong>Payment Method:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedOrder.payment_method || 'N/A'}</span></p>
                </div>

                {/* Shipping Address */}
                <div className={styles.formGroup}>
                  <h3>Shipping Address</h3>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                  <p>{selectedOrder.country}</p>
                </div>
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
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.price || item.discount_price}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>₹{(item.price || item.discount_price) * item.quantity}</td>
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
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped', 'order')}
                    className={styles.saveBtn}
                    style={{ background: '#007bff' }}
                  >
                    Pass Order (Ship)
                  </button>
                )}

                {selectedOrder.order_status === 'shipped' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered', 'order')}
                    className={styles.saveBtn}
                    style={{ background: '#28a745' }}
                  >
                    Mark as Delivered
                  </button>
                )}

                {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'delivered' && (
                  <button
                    onClick={() => {
                      if (confirm('Cancel this order?')) handleStatusUpdate(selectedOrder.id, 'cancelled', 'order');
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
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
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
      )}

      {/* Image Zoom Modal */}
      {selectedImage && (
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
      )}
    </div>
  );
}
