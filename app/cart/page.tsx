"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/shop" className="bg-red-700 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* CART ITEMS LIST */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                {/* Image Placeholder */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xl">
                  {item.name[0]}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.code} | {item.category}</p>
                  <div className="text-red-700 font-bold mt-1">₹{item.price}</div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg bg-gray-50">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-200 rounded-l-lg"><Minus size={14}/></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-200 rounded-r-lg"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button onClick={clearCart} className="text-red-600 text-sm font-bold hover:underline mt-4">
              Clear Cart
            </button>
          </div>

          {/* CHECKOUT SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Estimate</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span>₹{Math.round(cartTotal * 0.18)}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl">₹{Math.round(cartTotal * 1.18)}</span>
                </div>
              </div>

              <button className="w-full bg-black text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg">
                CHECKOUT NOW <ArrowRight size={18} />
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-4">
                Secure Checkout powered by Bourgon Prime
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}