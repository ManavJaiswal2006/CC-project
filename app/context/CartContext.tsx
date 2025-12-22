"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

/* ================= TYPES ================= */

export interface CartItem {
  id: string;            // Product ID
  name: string;
  image: string;
  category?: string;

  // Variant
  size?: string | null;

  // Pricing
  basePrice: number;     // MRP
  price: number;         // Final (discounted)
  discount: number;

  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string, size?: string | null) => void;
  updateQuantity: (
    id: string,
    size: string | null | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

/* ================= PROVIDER ================= */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ---------- Load from localStorage ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("bourgon_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  /* ---------- Persist to localStorage ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("bourgon_cart", JSON.stringify(cart));
  }, [cart]);

  /* ================= ACTIONS ================= */

  const addToCart = (
    item: Omit<CartItem, "quantity">,
    quantity = 1
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && p.size === item.size
      );

      if (existing) {
        return prev.map((p) =>
          p.id === item.id && p.size === item.size
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }

      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string, size?: string | null) => {
    setCart((prev) =>
      prev.filter((p) => !(p.id === id && p.size === size))
    );
  };

  const updateQuantity = (
    id: string,
    size: string | null | undefined,
    quantity: number
  ) => {
    if (quantity < 1) return;

    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.size === size
          ? { ...p, quantity }
          : p
      )
    );
  };

  const clearCart = () => setCart([]);

  /* ================= TOTALS ================= */

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  /* ================= PROVIDER ================= */

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }
  return ctx;
}
