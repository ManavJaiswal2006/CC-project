"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCart } from "@/app/context/CartContext"; 
import { Star, MessageSquare, ShoppingCart, Minus, Plus, Share2 } from "lucide-react";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // 1. FETCH REAL DATA
  // We cast the string param to a Convex ID
  const product = useQuery(api.product.getProduct, { id: params.id as Id<"products"> });

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Local state for reviews (Mocked for now until you add a Reviews table)
  const [commentText, setCommentText] = useState("");
  const [reviews, setReviews] = useState([
    { user: "SYSTEM_USER_01", rating: 5, text: "Material integrity verified. Excellent quality." },
    { user: "ANON_99", rating: 4, text: "Delivery latency was acceptable." }
  ]);

  // --- HANDLERS ---

  const handleAddToCart = () => {
    if (!product) return;
    
    // Map Convex object to Cart object
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "", 
    }, quantity);

    alert(`[SYSTEM]: Added ${quantity} unit(s) to cart.`);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if(!commentText) return;
    setReviews([...reviews, { user: "YOU", rating: 5, text: commentText }]);
    setCommentText("");
  };

  // --- LOADING / ERROR STATES ---

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-green-500 font-mono">
        <div className="animate-pulse">LOADING_ASSET_DATA...</div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-red-500 font-mono">
        ERROR: ASSET_NOT_FOUND
      </div>
    );
  }

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans pb-20 pt-24 selection:bg-green-500/30 selection:text-green-200">
      {/* GRID BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #262626 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* TOP SECTION: IMAGE AND INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-b border-neutral-800 pb-16">
          
          {/* Left: Image Box */}
          <div className="bg-black border border-neutral-800 h-[500px] flex items-center justify-center relative group">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white"></div>

            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="text-neutral-700 font-mono text-sm">NO_IMG_DATA</div>
            )}

            {product.discount > 0 && (
              <div className="absolute top-4 right-4 bg-green-900/20 border border-green-500/50 text-green-400 px-3 py-1 text-xs font-mono font-bold uppercase">
                -{product.discount}% OFF
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="flex flex-col h-full">
            <div className="mb-auto">
              <div className="flex items-center gap-3 mb-4">
                 {product.soldOut ? (
                    <span className="bg-red-900/20 border border-red-900 text-red-500 px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                      Stock: Depleted
                    </span>
                 ) : (
                    <span className="bg-green-900/20 border border-green-900 text-green-500 px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                      Stock: Available
                    </span>
                 )}
                 <span className="text-neutral-600 font-mono text-xs">ID: {product._id.slice(-8).toUpperCase()}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white uppercase tracking-tight">{product.name}</h1>
              
              {/* Price Block */}
              <div className="py-6 border-t border-b border-neutral-800 mb-6">
                <p className="text-neutral-500 text-xs font-mono uppercase mb-1">Unit Price</p>
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-mono text-white">${product.price}</span>
                  {product.discount > 0 && (
                     <span className="text-xl text-neutral-600 line-through font-mono decoration-red-900">
                       ${Math.round(product.price * (1 + product.discount / 100))}
                     </span>
                  )}
                </div>
              </div>

              <p className="text-neutral-400 leading-relaxed mb-8 font-mono text-sm border-l-2 border-neutral-800 pl-4">
                {product.description}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-neutral-700 bg-neutral-900">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                      className="p-4 hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
                    >
                      <Minus size={16}/>
                    </button>
                    <span className="w-12 text-center font-mono text-white font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)} 
                      className="p-4 hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors"
                    >
                      <Plus size={16}/>
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.soldOut} 
                    className="flex-1 bg-white text-black font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {product.soldOut ? "Unavailable" : "Add to Cart"}
                  </button>
                </div>
                
                <button className="w-full border border-neutral-800 py-3 text-xs font-mono uppercase text-neutral-500 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2">
                  <Share2 size={14} /> Share Asset Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: REVIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
           {/* Stats */}
           <div className="md:col-span-1 bg-black border border-neutral-800 p-6">
             <h3 className="text-xl font-bold text-white mb-2 uppercase">User Logs</h3>
             <div className="flex items-center gap-4 mb-2">
               <span className="text-5xl font-mono text-white">4.8</span>
               <div className="text-green-500 flex"><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star className="text-neutral-700" size={16}/></div>
             </div>
             <p className="text-neutral-500 text-xs font-mono">Based on {reviews.length} entries</p>
           </div>

           {/* Comments */}
           <div className="md:col-span-2 space-y-8">
             
             {/* Add Review */}
             <form onSubmit={handleAddReview} className="bg-neutral-900/50 p-6 border border-neutral-800">
               <h4 className="font-bold mb-4 flex items-center gap-2 text-white uppercase text-sm"><MessageSquare size={16}/> Submit Log</h4>
               <textarea 
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
                 className="w-full bg-black border border-neutral-800 p-4 text-white focus:border-green-500 outline-none mb-4 font-mono text-sm"
                 rows={3}
                 placeholder="> Enter observation data..."
               />
               <button type="submit" className="bg-neutral-800 text-white px-6 py-2 text-xs font-mono uppercase hover:bg-white hover:text-black transition-colors">
                 Upload Entry
               </button>
             </form>

             {/* Review List */}
             <div className="space-y-4">
               {reviews.map((review, i) => (
                 <div key={i} className="border-b border-neutral-800 pb-6 last:border-0">
                   <div className="flex items-center justify-between mb-2">
                     <p className="font-bold text-white font-mono text-sm">{review.user}</p>
                     <div className="flex text-green-500">
                        {[...Array(review.rating)].map((_, j) => <Star key={j} size={10} fill="currentColor"/>)}
                     </div>
                   </div>
                   <p className="text-neutral-400 text-sm font-mono">{review.text}</p>
                 </div>
               ))}
             </div>

           </div>
        </div>

      </div>
    </div>
  );
}