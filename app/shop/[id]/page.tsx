"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingBag, Check } from "lucide-react";

export default function ProductPage() {
  /* ================= PARAM ================= */
  const params = useParams();
  const id = params.id as string;

  /* ================= DATA ================= */
  const product = useQuery(api.product.getProduct, {
    id: id as any,
  });

  /* ================= STATE (MUST BE TOP LEVEL) ================= */
  const [selectedSize, setSelectedSize] = useState<{
    label: string;
    value: string;
    price: number;
  } | null>(null);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  /* ================= LOADING / ERROR ================= */
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

  /* ================= NORMALIZE ================= */
  const sizes = product.sizes ?? [];
  const hasSizes = sizes.length > 0;

  /* ================= PRICE LOGIC ================= */
  const basePrice: number = hasSizes
    ? selectedSize?.price ?? 0
    : product.price ?? 0;

  const finalPrice: number =
    product.discount > 0
      ? Math.round(basePrice - (basePrice * product.discount) / 100)
      : basePrice;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-20">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* IMAGE */}
          <div className="bg-gray-50 flex items-center justify-center p-12">
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
          <div className="space-y-8">

            {/* TITLE */}
            <div>
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold uppercase tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* SHORT DESCRIPTION */}
            <p className="text-gray-500 leading-relaxed max-w-xl">
              {product.description}
            </p>

            {/* PRICE */}
            <div>
              <p className="text-sm text-gray-400 mb-1">
                {hasSizes ? "Price (for selected size)" : "Price"}
              </p>

              <div className="flex items-end gap-4">
                {product.discount > 0 && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{basePrice}
                  </span>
                )}
                <span className="text-3xl font-bold">
                  ₹{finalPrice}
                </span>
              </div>

              {product.discount > 0 && (
                <p className="text-xs text-green-600 font-bold mt-1">
                  You save {product.discount}%
                </p>
              )}
            </div>

            {/* SIZE SELECTOR */}
            {hasSizes && (
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Select Size
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
                className="w-full bg-black text-white py-5 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all disabled:bg-gray-300"
              >
                <ShoppingBag size={16} />
                {product.soldOut ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {/* TRUST */}
            <div className="pt-6 space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check size={14} /> Premium stainless steel
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} /> Secure payments
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} /> Easy returns
              </div>
            </div>

          </div>
        </div>

        {/* DETAILED DESCRIPTION */}
        {product.details && (
          <div className="mt-20 border-t pt-12 max-w-4xl">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">
              Product Details
            </h2>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.details}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
