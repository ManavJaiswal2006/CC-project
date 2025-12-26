"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { showToast } from "@/components/UI/Toast";

/* ================= CONSTANTS ================= */

const STORAGE_KEY = "bourgon_cart";
const MAX_QTY_PER_ITEM = 50;

/* ================= TYPES ================= */

export interface CartItem {
  id: string; // product id
  name: string;
  image: string;
  category?: string;

  // Variant
  size?: string | null;

  // Pricing (⚠️ UI ONLY — server recalculates)
  basePrice: number;
  price: number;
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

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const hydratedRef = useRef(false);

  /* ---------- Load from localStorage (SAFE) ---------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        hydratedRef.current = true;
        return;
      }

      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setCart(
          parsed.filter(
            (i) =>
              typeof i?.id === "string" &&
              typeof i?.name === "string" &&
              typeof i?.price === "number" &&
              typeof i?.quantity === "number"
          )
        );
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  /* ---------- Persist to localStorage ---------- */
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  /* ================= ACTIONS ================= */

  const addToCart = (
    item: Omit<CartItem, "quantity">,
    quantity = 1
  ) => {
    const safeQty = Math.min(Math.max(quantity, 1), MAX_QTY_PER_ITEM);

    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && p.size === item.size
      );

      if (existing) {
        const newQuantity = Math.min(
          existing.quantity + safeQty,
          MAX_QTY_PER_ITEM
        );
        
        // Show toast notification
        showToast(
          newQuantity > existing.quantity
            ? `${item.name} added to cart (${newQuantity} total)`
            : `${item.name} quantity updated (max ${MAX_QTY_PER_ITEM} per item)`,
          "success"
        );

        return prev.map((p) =>
          p.id === item.id && p.size === item.size
            ? {
                ...p,
                quantity: newQuantity,
              }
            : p
        );
      }

      // Show toast notification for new item
      showToast(`${item.name} added to cart`, "success");

      return [
        ...prev,
        {
          ...item,
          quantity: safeQty,
        },
      ];
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
    const safeQty = Math.min(Math.max(quantity, 1), MAX_QTY_PER_ITEM);

    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.size === size
          ? { ...p, quantity: safeQty }
          : p
      )
    );
  };

  const clearCart = () => setCart([]);

  /* ================= TOTALS (MEMOIZED) ================= */

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
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
