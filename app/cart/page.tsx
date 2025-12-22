"use client";

import React from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X, ChevronRight, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  // --- EMPTY STATE ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <ShoppingBag size={48} className="text-gray-200 mb-6" />
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Your Cart is Empty</h2>
        <p className="text-gray-400 mt-2 mb-8 text-sm">No items found in your selection.</p>
        <Link 
          href="/shop" 
          className="bg-black text-white px-10 py-4 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl shadow-black/5"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-28 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-100 pb-8 mb-12 gap-4">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/shop" className="hover:text-gray-900">Shop</Link>
              <ChevronRight size={10} />
              <span className="text-gray-900">Cart</span>
            </nav>
            <h1 className="text-4xl font-bold tracking-tight uppercase">Your Selection</h1>
          </div>
          <button 
            onClick={clearCart} 
            className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline"
          >
            Clear All Items
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* CART ITEMS LIST */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-gray-100">
              {cart.map((item: any) => (
                <div key={item.id} className="py-8 flex gap-8 items-start first:pt-0 group">
                  {/* Thumbnail */}
                  <div className="w-32 h-32 bg-[#F9FAFB] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">No Image</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="text-red-600 text-[9px] font-black uppercase tracking-widest block mb-1">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-lg text-gray-900 uppercase tracking-tight truncate pr-4">
                          {item.name}
                        </h3>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-gray-300 hover:text-red-600 transition-colors p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-6">
                      REF_ID: {item.id.slice(-6).toUpperCase()}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-gray-900 font-bold">₹{item.price}</div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-100 bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} 
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-all"
                        >
                          <Minus size={12}/>
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-all"
                        >
                          <Plus size={12}/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHECKOUT SUMMARY */}
          <div className="lg:col-span-4">
            <div className="bg-[#F9FAFB] p-10 sticky top-32">
              <h3 className="text-[11px] font-black text-gray-400 mb-10 uppercase tracking-[0.2em] border-b border-gray-200 pb-4">
                Order Summary
              </h3>
              
              <div className="space-y-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-10">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics</span>
                  <span className="text-red-600">Gratis</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="text-gray-900">₹{Math.round(cartTotal * 0.18)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.1em]">Total</span>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    ₹{Math.round(cartTotal * 1.18)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-black text-white py-5 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-black/5 group">
                Proceed to Checkout 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              
              <p className="mt-8 text-[9px] text-center text-gray-300 font-bold uppercase tracking-[0.2em]">
                Secure Transaction Verified
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}