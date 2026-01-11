"use client";

import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./CartSidebar.module.css";

export default function CartSidebar() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div className={styles.overlay} onClick={() => setIsCartOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isCartOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2>Shopping Cart ({getTotalItems()})</h2>
          <button
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🛒</div>
            <p>Your cart is empty</p>
            <button
              className={styles.shopBtn}
              onClick={() => {
                setIsCartOpen(false);
                router.push("/");
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item, index) => {
                const price = item.discount_price || item.price;
                const itemKey = `${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`;
                
                // Parse image_url to get the first image if it's an array
                let imageUrl = 'https://picsum.photos/400/600';
                if (item.image_url) {
                  try {
                    const images = JSON.parse(item.image_url);
                    imageUrl = Array.isArray(images) && images.length > 0 && images[0] 
                      ? images[0] 
                      : (item.image_url || 'https://picsum.photos/400/600');
                  } catch {
                    imageUrl = item.image_url || 'https://picsum.photos/400/600';
                  }
                }

                return (
                  <div key={index} className={styles.item}>
                    <div className={styles.itemImage}>
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemBrand}>{item.brand}</p>
                      
                      {item.selectedSize && (
                        <span className={styles.variant}>Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className={styles.variant}>
                          Color: <span style={{ 
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: item.selectedColor,
                            border: '1px solid #ddd',
                            verticalAlign: 'middle',
                            marginLeft: '4px'
                          }} />
                        </span>
                      )}
                      {item.stock <= 10 && (
                        <div className={styles.stockWarning}>
                          Only {item.stock} left in stock
                        </div>
                      )}

                      <div className={styles.itemFooter}>
                        <div className={styles.quantity}>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (item.quantity >= item.stock) {
                                alert(`Only ${item.stock} items available in stock`);
                                return;
                              }
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.selectedSize,
                                item.selectedColor
                              );
                            }}
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        <div className={styles.itemPrice}>
                          ₹{(price * item.quantity).toLocaleString()}
                        </div>
                      </div>

                      <button
                        className={styles.removeBtn}
                        onClick={() =>
                          removeFromCart(item.id, item.selectedSize, item.selectedColor)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                <span>Total:</span>
                <span className={styles.totalPrice}>
                  ₹{getTotalPrice().toLocaleString()}
                </span>
              </div>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
