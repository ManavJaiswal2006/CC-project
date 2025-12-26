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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
  } = useCart();
  const router = useRouter();

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

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
      <div className="w-full px-4 sm:px-6">

        {/* ================= HEADER ================= */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-6 sm:pb-8 mb-8 sm:mb-12 gap-4">
          <div className="min-w-0 flex-1">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/shop">Shop</Link>
              <ChevronRight size={10} />
              <span className="text-gray-900">Cart</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
              Your Selection
            </h1>
          </div>

          <div className="flex-shrink-0">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline whitespace-nowrap"
              >
                Clear Cart
              </button>
            ) : (
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={clearCart}
                  className="text-[10px] font-black uppercase tracking-widest text-red-600 whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-[10px] uppercase tracking-widest text-gray-400 whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">

          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-8 divide-y divide-gray-200 min-w-0">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.subproduct}-${item.color}`}
                className="py-6 sm:py-8 flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start group bg-white rounded-xl p-4 sm:p-6 mb-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* IMAGE */}
                <div className="w-full sm:w-24 md:w-32 h-32 sm:h-24 md:h-32 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
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
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex justify-between items-start mb-2 sm:mb-1 gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-red-600 text-[9px] font-black uppercase tracking-widest block mb-1 truncate">
                        {item.category}
                      </span>

                      <h3 className="font-bold text-base sm:text-lg uppercase break-words">
                        {item.name}
                      </h3>

                      {item.size && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {item.size}
                        </p>
                      )}
                      {item.subproduct && (
                        <p className="text-xs text-gray-500 mt-1">
                          Subproduct: {item.subproduct}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-xs text-gray-500 mt-1">
                          Color: {item.color}
                        </p>
                      )}
                      {item.packQuantity && item.packQuantity > 1 && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          Pack of {item.packQuantity}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.size, item.subproduct, item.color)
                      }
                      className="text-gray-300 hover:text-red-600 shrink-0"
                      aria-label="Remove item"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* PRICE + QTY */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 sm:mt-6">
                    <div className="flex items-baseline gap-2">
                      {item.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through shrink-0">
                          ₹{item.basePrice}
                        </span>
                      )}
                      <span className="text-base sm:text-lg font-bold shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    <div className="flex items-center border shrink-0">
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.size,
                            item.subproduct,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 disabled:opacity-30"
                        aria-label="Decrease quantity"
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
                            item.subproduct,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600"
                        aria-label="Increase quantity"
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10 sticky top-20 sm:top-24 md:top-32">

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
              </div>

              <div className="border-t pt-8 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-black uppercase">
                    Total
                  </span>
                  <span className="text-2xl font-bold">
                    ₹{cartTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-black text-white py-4 sm:py-5 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all"
              >
                <span className="whitespace-nowrap">Proceed to Checkout</span>
                <ArrowRight size={14} className="shrink-0" />
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
