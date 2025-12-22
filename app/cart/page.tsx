"use client";

import React from "react";
import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  // --- EMPTY STATE ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        
        <div className="z-10 text-center border border-neutral-800 bg-black p-12 max-w-md relative">
           {/* Corners */}
           <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white"></div>
           <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white"></div>
           <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white"></div>
           <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white"></div>

          <ShoppingBag size={48} className="text-neutral-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-widest">Cart Empty</h2>
          <p className="text-neutral-500 mb-8 font-mono text-sm">No inventory items detected.</p>
          <Link href="/" className="inline-block bg-white text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-green-500 transition-colors text-sm">
            Acquire Assets
          </Link>
        </div>
      </div>
    );
  }

  // --- MAIN CART RENDER ---
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans py-24 px-4 selection:bg-green-500/30 selection:text-green-200">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-neutral-800 pb-6 mb-12">
          <div>
             <h1 className="text-4xl font-bold text-white uppercase tracking-tight mb-2">Requisition List</h1>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
               <p className="text-neutral-500 font-mono text-xs">SYSTEM STATUS: ACTIVE</p>
             </div>
          </div>
          <button onClick={clearCart} className="text-red-500 text-xs font-mono uppercase hover:text-red-400 hover:underline">
            [Clear All Data]
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* CART ITEMS LIST */}
          <div className="lg:col-span-2 space-y-0 border-t border-neutral-800">
            {cart.map((item: any) => ( // 👈 Cast to 'any' fixes the 'id' error temporarily
              <div key={item.id} className="group bg-black border-b border-neutral-800 p-6 flex gap-6 items-start hover:bg-neutral-900/30 transition-colors">
                
                {/* Image Placeholder / Thumbnail */}
                <div className="w-24 h-24 bg-neutral-900 border border-neutral-800 flex-shrink-0 relative overflow-hidden">
                  {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-neutral-700 font-mono text-xs">NO_IMG</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white uppercase truncate pr-4">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-neutral-600 hover:text-red-500 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <p className="text-xs text-neutral-500 font-mono mb-4">
                    ID: {item.id.slice(-6).toUpperCase()}
                  </p>

                  <div className="flex justify-between items-end">
                    <div className="text-white font-mono text-lg">${item.price}</div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-neutral-800 bg-neutral-900">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} 
                        className="p-2 hover:bg-white hover:text-black text-neutral-400 transition-colors"
                      >
                        <Minus size={14}/>
                      </button>
                      <span className="w-10 text-center text-sm font-mono text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="p-2 hover:bg-white hover:text-black text-neutral-400 transition-colors"
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CHECKOUT SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-black border border-neutral-800 p-8 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6 uppercase border-b border-neutral-800 pb-4">
                Fiscal Summary
              </h3>
              
              <div className="space-y-4 text-sm font-mono text-neutral-400 mb-8">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="text-white">${cartTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>LOGISTICS</span>
                  <span className="text-green-500 uppercase">Granted</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX (18%)</span>
                  <span className="text-white">${Math.round(cartTotal * 0.18)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-700 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-white uppercase">Total Due</span>
                  <span className="font-bold text-2xl text-green-500 font-mono">${Math.round(cartTotal * 1.18)}</span>
                </div>
              </div>

              <button className="w-full bg-white text-black py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-green-500 hover:text-black transition-all group">
                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-neutral-600 font-mono uppercase">
                <div className="w-2 h-2 bg-neutral-800 rounded-full"></div>
                Encrypted Transaction
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}