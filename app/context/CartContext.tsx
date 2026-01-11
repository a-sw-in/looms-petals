"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  brand: string;
  category: string;
  stock: number; // Available stock
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => boolean;
  removeFromCart: (id: number, size?: string, color?: string) => void;
  updateQuantity: (id: number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper functions for cookie management
  const setCookie = (name: string, value: string, days: number = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  };

  // Load cart from localStorage and cookies on mount
  useEffect(() => {
    try {
      // Try localStorage first (faster), then cookies as fallback
      const localCart = localStorage.getItem("cart");
      const cookieCart = getCookie("cart");
      
      const savedCart = localCart || cookieCart;
      
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log("✅ Cart loaded:", parsedCart.length, "items");
        setItems(parsedCart);
      } else {
        console.log("ℹ️ No saved cart found");
      }
    } catch (error) {
      console.error("❌ Failed to load cart data:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to both localStorage and cookies whenever it changes (only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load
    
    const cartData = JSON.stringify(items);
    localStorage.setItem("cart", cartData);
    setCookie("cart", cartData, 30);
    console.log("💾 Cart saved:", items.length, "items");
  }, [items, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1): boolean => {
    let success = false;
    
    setItems((prevItems) => {
      // Check if item already exists with same size and color
      const existingItemIndex = prevItems.findIndex(
        (i) =>
          i.id === item.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
      );

      if (existingItemIndex > -1) {
        // Check if adding quantity would exceed stock
        const existingItem = prevItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > item.stock) {
          // Cannot add more than available stock
          success = false;
          return prevItems; // Return unchanged
        }
        
        // Update quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity = newQuantity;
        success = true;
        return newItems;
      } else {
        // Check if initial quantity exceeds stock
        if (quantity > item.stock) {
          success = false;
          return prevItems;
        }
        
        // Add new item
        success = true;
        return [...prevItems, { ...item, quantity }];
      }
    });
    
    return success;
  };

  const removeFromCart = (id: number, size?: string, color?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateQuantity = (id: number, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (
          item.id === id &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          // Don't allow quantity to exceed stock
          const newQuantity = Math.min(quantity, item.stock);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
