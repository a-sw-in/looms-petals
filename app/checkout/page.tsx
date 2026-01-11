"use client";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./Checkout.module.css";

type StockValidation = {
  productId: number;
  name: string;
  requestedQty: number;
  availableStock: number;
  isValid: boolean;
};

export default function CheckoutPage() {
  const { items, getTotalPrice, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [validating, setValidating] = useState(true);
  const [stockIssues, setStockIssues] = useState<StockValidation[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    paymentMethod: "cod",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validate stock function
  const validateStock = async () => {
    setValidating(true);
    const issues: StockValidation[] = [];

    // Fetch current stock for all items in cart
    for (const item of items) {
      try {
        const response = await fetch(`/api/admin/products?id=${item.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          const currentStock = data.data.stock;

          // Check if cart quantity exceeds available stock
          if (item.quantity > currentStock) {
            issues.push({
              productId: item.id,
              name: item.name,
              requestedQty: item.quantity,
              availableStock: currentStock,
              isValid: false,
            });

            // Auto-adjust quantity to available stock
            if (currentStock > 0) {
              updateQuantity(
                item.id,
                currentStock,
                item.selectedSize,
                item.selectedColor
              );
            } else {
              // Remove if out of stock
              removeFromCart(item.id, item.selectedSize, item.selectedColor);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to validate stock for ${item.name}:`, error);
      }
    }

    setStockIssues(issues);
    setValidating(false);
  };

  // Validate stock on mount
  useEffect(() => {
    if (items.length > 0) {
      validateStock();
    } else {
      setValidating(false);
    }
  }, []); // Run only on mount

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = "Name must be at least 3 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!phoneRegex.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      errors.address = "Please enter a complete address (min 10 characters)";
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      errors.city = "Please enter a valid city name";
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = "State is required";
    } else if (formData.state.trim().length < 2) {
      errors.state = "Please enter a valid state name";
    }

    // PIN Code validation
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!formData.pinCode.trim()) {
      errors.pinCode = "PIN code is required";
    } else if (!pinRegex.test(formData.pinCode)) {
      errors.pinCode = "Please enter a valid 6-digit PIN code";
    }

    // Country validation
    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }));
  };

  /* Razorpay integration */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    // Validate form first
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 1. Re-validate stock client-side first
      await validateStock();
      if (items.length === 0) {
        setIsPlacingOrder(false);
        return;
      }

      const totalAmount = getTotalPrice();

      // --- Online Payment Flow ---
      if (formData.paymentMethod === 'online') {
        const res = await loadRazorpay();
        if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          setIsPlacingOrder(false);
          return;
        }

        // Create Razorpay Order
        const orderRes = await fetch('/api/payment/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount, currency: 'INR' }),
        });
        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          throw new Error(orderData.message || 'Failed to initiate payment');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Looms & Petals",
          description: "Order Payment",
          order_id: orderData.orderId,
          handler: async function (response: any) {
            // Payment Success! Now Create Order in Backend
            await createOrderInBackend(response);
          },
          modal: {
            ondismiss: function () {
              setShowCancelModal(true);
              setTimeout(() => {
                router.push('/');
              }, 3000);
            }
          },
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();

        // Note: setIsPlacingOrder is intentionally left true until callback or user close (which is hard to detect in all cases, but typically modal covers it)
        // If user closes modal without paying, we might remain in 'loading' state or need a way to detect close.
        // Razorpay has a 'modal.ondismiss' callback if needed.
        paymentObject.on('payment.failed', function (response: any) {
          alert(response.error.description);
          setIsPlacingOrder(false);
        });

      } else {
        // --- COD Flow ---
        await createOrderInBackend(null);
      }

    } catch (error: any) {
      console.error('Order placement error:', error);
      alert(error.message || 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  const createOrderInBackend = async (paymentDetails: any) => {
    try {
      // For online payments, verify payment signature first
      if (formData.paymentMethod === 'online' && paymentDetails) {
        const verifyResponse = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: paymentDetails.razorpay_order_id,
            razorpay_payment_id: paymentDetails.razorpay_payment_id,
            razorpay_signature: paymentDetails.razorpay_signature,
          }),
        });

        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          throw new Error('Payment verification failed. Please contact support.');
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          items,
          total: getTotalPrice(),
          paymentDetails, // Pass verify info if online
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order');
      }

      if (result.success) {
        // Success Handling
        // Clear cart
        items.forEach(item => removeFromCart(item.id, item.selectedSize, item.selectedColor));

        // Redirect or show success
        alert(`Order placed successfully! Order ID: ${result.orderId}`);
        router.push('/'); // Redirect to home or order success page
      } else {
        alert(result.message || 'Something went wrong');
      }
    } catch (error: any) {
      console.error('Backend order creation error:', error);
      alert(error.message || 'Payment successful but order creation failed. Please contact support.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (validating) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⏳</div>
          <h2>Validating stock availability...</h2>
          <p>Please wait while we check product availability</p>
        </div>
      </div>
    );
  }

  if (showCancelModal) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty} style={{ borderColor: '#dc3545' }}>
          <div className={styles.emptyIcon} style={{ fontSize: '4rem' }}>❌</div>
          <h2 style={{ color: '#dc3545' }}>Payment Cancelled</h2>
          <p>Redirecting to home page</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to proceed with checkout</p>
          <button className={styles.shopBtn} onClick={() => router.push("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          ← Back
        </button>

        <h1 className={styles.title}>Checkout</h1>

        {/* Stock Issues Warning */}
        {stockIssues.length > 0 && (
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Stock Availability Issues</h3>
            </div>
            <p className={styles.warningText}>
              Some items in your cart have limited availability. We've adjusted the quantities automatically:
            </p>
            <ul className={styles.issuesList}>
              {stockIssues.map((issue, index) => (
                <li key={index}>
                  <strong>{issue.name}</strong>:{" "}
                  {issue.availableStock === 0 ? (
                    <span className={styles.outOfStock}>
                      Out of stock (removed from cart)
                    </span>
                  ) : (
                    <span className={styles.adjusted}>
                      Quantity adjusted from {issue.requestedQty} to {issue.availableStock}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.grid}>
          {/* Order Summary */}
          <div className={styles.orderSection}>
            <h2>Order Summary</h2>
            <div className={styles.items}>
              {items.map((item, index) => {
                const price = item.discount_price || item.price;
                return (
                  <div key={index} className={styles.item}>
                    <div className={styles.itemImage}>
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="80px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h3>{item.name}</h3>
                      <p className={styles.itemBrand}>{item.brand}</p>
                      {item.selectedSize && (
                        <span className={styles.variant}>Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className={styles.variant}>
                          Color: <span style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: item.selectedColor,
                            border: '1px solid #ddd',
                            marginLeft: '4px',
                            verticalAlign: 'middle'
                          }} />
                        </span>
                      )}
                      <div className={styles.itemFooter}>
                        <span className={styles.qty}>Qty: {item.quantity}</span>
                        <span className={styles.price}>₹{(price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span className={styles.free}>Free</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>₹{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className={styles.formSection}>
            <h2>Delivery Information</h2>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={formErrors.fullName ? styles.errorInput : ""}
                  required
                />
                {formErrors.fullName && (
                  <span className={styles.errorText}>{formErrors.fullName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? styles.errorInput : ""}
                  disabled
                  readOnly
                  required
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
                {formErrors.email && (
                  <span className={styles.errorText}>{formErrors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={formErrors.phone ? styles.errorInput : ""}
                  required
                />
                {formErrors.phone && (
                  <span className={styles.errorText}>{formErrors.phone}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <textarea
                  name="address"
                  placeholder="Street address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className={formErrors.address ? styles.errorInput : ""}
                  required
                />
                {formErrors.address && (
                  <span className={styles.errorText}>{formErrors.address}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? styles.errorInput : ""}
                    required
                  />
                  {formErrors.city && (
                    <span className={styles.errorText}>{formErrors.city}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={formErrors.state ? styles.errorInput : ""}
                    required
                  />
                  {formErrors.state && (
                    <span className={styles.errorText}>{formErrors.state}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    name="pinCode"
                    placeholder="000000"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    className={formErrors.pinCode ? styles.errorInput : ""}
                    maxLength={6}
                    required
                  />
                  {formErrors.pinCode && (
                    <span className={styles.errorText}>{formErrors.pinCode}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="India"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={formErrors.country ? styles.errorInput : ""}
                    required
                  />
                  {formErrors.country && (
                    <span className={styles.errorText}>{formErrors.country}</span>
                  )}
                </div>
              </div>

              <div className={styles.paymentInfo}>
                <h3>Payment Method</h3>
                <div className={styles.paymentOptions}>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handlePaymentChange}
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className={styles.paymentOption}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={formData.paymentMethod === "online"}
                      onChange={handlePaymentChange}
                    />
                    <span>Online Payment (Razorpay)</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || items.length === 0}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
