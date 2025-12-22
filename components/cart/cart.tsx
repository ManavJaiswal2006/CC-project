"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  const [confirmClear, setConfirmClear] = useState(false);

  /* ================= EMPTY STATE ================= */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <ShoppingBag size={48} className="text-gray-200 mb-6" />
        <h2 className="text-xl font-bold uppercase">
          Your Cart is Empty
        </h2>
        <p className="text-gray-400 mt-2 mb-8 text-sm">
          No items added yet.
        </p>
        <Link
          href="/shop"
          className="bg-black text-white px-10 py-4 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  /* ================= TOTALS (UI ONLY) ================= */
  const gst = useMemo(
    () => Math.round(cartTotal * 0.18),
    [cartTotal]
  );
  const grandTotal = useMemo(
    () => cartTotal + gst,
    [cartTotal, gst]
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* ================= HEADER ================= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-8 mb-12 gap-4">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/shop">Shop</Link>
              <ChevronRight size={10} />
              <span className="text-gray-900">Cart</span>
            </nav>
            <h1 className="text-4xl font-bold uppercase">
              Your Selection
            </h1>
          </div>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline"
            >
              Clear Cart
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="text-[10px] font-black uppercase tracking-widest text-red-600"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-[10px] uppercase tracking-widest text-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-8 divide-y">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="py-8 flex gap-8 items-start group"
              >
                {/* IMAGE */}
                <div className="w-32 h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="text-xs text-gray-300 font-bold">
                      No Image
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-red-600 text-[9px] font-black uppercase tracking-widest block mb-1">
                        {item.category}
                      </span>

                      <h3 className="font-bold text-lg uppercase">
                        {item.name}
                      </h3>

                      {item.size && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {item.size}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.size)
                      }
                      className="text-gray-300 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* PRICE + QTY */}
                  <div className="flex justify-between items-center mt-6">

                    <div>
                      {item.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                          ₹{item.basePrice}
                        </span>
                      )}
                      <span className="text-lg font-bold">
                        ₹{item.price}
                      </span>
                    </div>

                    {/* QUANTITY */}
                    <div className="flex items-center border">
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 disabled:opacity-30"
                      >
                        <Minus size={12} />
                      </button>

                      <span className="w-8 text-center text-xs font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-10 sticky top-32">

              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-10 border-b pb-4">
                Order Summary
              </h3>

              <div className="space-y-5 text-[11px] font-bold uppercase tracking-widest mb-10">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{gst}</span>
                </div>
              </div>

              <div className="border-t pt-8 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-black uppercase">
                    Total
                  </span>
                  <span className="text-2xl font-bold">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  // TODO: route to checkout
                  console.warn("Proceed to checkout");
                }}
                className="w-full bg-black text-white py-5 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </button>

              <p className="text-[10px] text-gray-400 mt-4 text-center">
                Prices will be verified at checkout
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
