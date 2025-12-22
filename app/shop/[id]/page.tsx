"use client";

import React, { useState } from "react";
import { Star, MessageSquare, ShoppingCart, Minus, Plus } from "lucide-react";
import { products } from "@/constants/shop"; // Mock data
import { useCart } from "@/app/context/CartContext"; // <--- 1. Import Cart Hook

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // Find product (In real app, fetch from database)
  const product = products.find((p) => p.id === params.id) || products[0];

  const { addToCart } = useCart(); // <--- 2. Get addToCart function
  const [quantity, setQuantity] = useState(1);
  
  const [commentText, setCommentText] = useState("");
  const [reviews, setReviews] = useState([
    { user: "Amit V.", rating: 5, text: "Excellent steel quality, very heavy." },
    { user: "Sarah K.", rating: 4, text: "Good product but delivery was slow." }
  ]);

  // --- HANDLERS ---

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Added ${quantity} x ${product.name} to your cart!`);
    // Optional: Reset quantity or redirect to cart
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if(!commentText) return;
    setReviews([...reviews, { user: "You", rating: 5, text: commentText }]);
    setCommentText("");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        
        {/* TOP SECTION: IMAGE AND INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Left: Image */}
          <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center p-10">
             <h1 className="text-6xl text-gray-300 font-bold">{product.name}</h1>
          </div>

          {/* Right: Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">{product.category}</span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                 {product.inStock ? "In Stock" : "Out of Stock"}
               </span>
            </div>

            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-6">Item Code: {product.code}</p>

            {/* Price Block */}
            <div className="border-t border-b py-6 mb-6">
               <p className="text-gray-500 text-sm mb-1">MRP (Inclusive of all taxes)</p>
               <div className="flex items-end gap-3">
                 <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                 <span className="text-xl text-gray-400 line-through mb-1">₹{product.mrp}</span>
                 <span className="text-sm font-bold text-green-600 mb-2">
                   {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                 </span>
               </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

            {/* Sizes available based on image data */}
            {product.sizes && (
              <div className="mb-8">
                <p className="font-bold mb-3">Select Size (No.)</p>
                <div className="flex gap-2">
                  {product.sizes.map(size => (
                    <button key={size} className="w-10 h-10 border rounded hover:bg-black hover:text-white transition">{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100"><Minus size={16}/></button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-100"><Plus size={16}/></button>
              </div>

              {/* 👇 UPDATED ADD TO CART BUTTON */}
              <button 
                onClick={handleAddToCart}
                disabled={!product.inStock} 
                className="flex-1 bg-red-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} /> {product.inStock ? "Add to Cart" : "Notify Me"}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: REVIEWS & COMMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           
           {/* Review Stats */}
           <div className="md:col-span-1">
             <h3 className="text-2xl font-bold mb-4">Ratings & Reviews</h3>
             <div className="flex items-center gap-4 mb-2">
               <span className="text-5xl font-bold">{product.rating}</span>
               <div className="text-yellow-400 flex"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star className="text-gray-300"/></div>
             </div>
             <p className="text-gray-500 text-sm">Based on {reviews.length} reviews</p>
           </div>

           {/* Comment Form & List */}
           <div className="md:col-span-2 space-y-8">
             
             {/* Add Comment */}
             <form onSubmit={handleAddReview} className="bg-gray-50 p-6 rounded-xl border">
               <h4 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18}/> Write a Review</h4>
               <textarea 
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
                 className="w-full border p-3 rounded-lg mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                 rows={3}
                 placeholder="How was the product quality?"
               />
               <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold">Post Review</button>
             </form>

             {/* Review List */}
             <div className="space-y-6">
               {reviews.map((review, i) => (
                 <div key={i} className="border-b pb-6">
                   <div className="flex items-center justify-between mb-2">
                     <p className="font-bold">{review.user}</p>
                     <div className="flex text-yellow-400 text-xs">
                        {[...Array(review.rating)].map((_, j) => <Star key={j} size={12} fill="currentColor"/>)}
                     </div>
                   </div>
                   <p className="text-gray-600 text-sm">{review.text}</p>
                 </div>
               ))}
             </div>

           </div>
        </div>

      </div>
    </div>
  );
}