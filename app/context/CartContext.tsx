"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Define the shape of the product specifically for the Cart
// We decouple this from the DB schema to make it flexible
export interface CartProduct {
  id: string;      // This will store the Convex _id
  name: string;
  price: number;
  image: string;
  category?: string;
  code?: string;
}

// 2. The Item in the array includes the quantity
export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    // Check if window exists to avoid server-side errors
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("bourgon_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      }
    }
  }, []);

  // Save cart to LocalStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bourgon_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // --- ACTIONS ---

  const addToCart = (product: CartProduct, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        // If item exists, increase quantity
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // If new, add to array
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // --- TOTALS ---
  
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}