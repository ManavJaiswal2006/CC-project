"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingBag, Check } from "lucide-react";

export default function ProductPage() {
  /* ================= GET PARAM ================= */
  const params = useParams();
  const id = params.id as string;

  /* ================= FETCH PRODUCT ================= */
  const product = useQuery(api.product.getProduct, {
    id: id as any,
  });

  /* ================= LOADING ================= */
  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  /* ================= NORMALIZE DATA ================= */
  const sizes = product.sizes ?? [];
  const hasSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState<
    (typeof sizes)[number] | null
  >(hasSizes ? sizes[0] : null);

  const displayPrice = hasSizes
    ? selectedSize?.price ?? 0
    : product.price ?? 0;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* IMAGE */}
        <div className="bg-gray-50 flex items-center justify-center p-10">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-6xl text-gray-300 font-bold">
              {product.name.charAt(0)}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight">
            {product.name}
          </h1>

          <p className="text-gray-500 leading-relaxed">
            {product.description}
          </p>

          {/* PRICE */}
          <div>
            <p className="text-sm text-gray-400 mb-1">
              {hasSizes ? "Price (for selected size)" : "Price"}
            </p>
            <p className="text-3xl font-bold">₹{displayPrice}</p>
            <p className="text-xs text-gray-400">Inclusive of all taxes</p>
          </div>

          {/* SIZE SELECTOR */}
          {hasSizes && (
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
                Size
              </p>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => {
                  const active = selectedSize?.value === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setSelectedSize(s)}
                      className={`px-5 py-3 border text-sm font-bold transition ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ADD TO CART */}
          <div className="pt-6 border-t">
            <button
              disabled={product.soldOut}
              className="w-full bg-black text-white py-5 font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 transition disabled:bg-gray-300"
            >
              <ShoppingBag size={18} />
              {product.soldOut ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>

          {/* TRUST */}
          <div className="pt-6 space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check size={14} /> Premium Stainless Steel
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} /> Secure Payments
            </div>
            <div className="flex items-center gap-2">
              <Check size={14} /> Easy Returns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
