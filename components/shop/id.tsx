"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";

type Size = {
  label: string;
  value: string;
  price: number;
};

export default function ProductPage() {
  /* ================= PARAM ================= */
  const { id } = useParams<{ id: string }>();

  /* ================= DATA ================= */
  const product = useQuery(api.product.getProduct, {
    id: id as any,
  });

  /* ================= CART ================= */
  const { addToCart } = useCart();

  /* ================= STATE ================= */
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const initializedRef = useRef(false);

  /* ================= INIT SIZE ================= */
  useEffect(() => {
    if (!product || initializedRef.current) return;

    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }

    initializedRef.current = true;
  }, [product]);

  /* ================= NORMALIZATION (SAFE) ================= */
  const sizes = product?.sizes ?? [];
  const hasSizes = sizes.length > 0;

  /* ================= PRICE (HOOKS MUST BE HERE) ================= */
  const basePrice = useMemo(() => {
    if (!product) return null;
    if (hasSizes) return selectedSize?.price ?? null;
    return product.price ?? null;
  }, [product, hasSizes, selectedSize]);

  const finalPrice = useMemo(() => {
    if (!product || basePrice == null) return null;
    if (product.discount > 0) {
      return Math.round(
        basePrice - (basePrice * product.discount) / 100
      );
    }
    return basePrice;
  }, [product, basePrice]);

  const canAddToCart =
    !!product &&
    !product.soldOut &&
    basePrice !== null &&
    (!hasSizes || selectedSize !== null);

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

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!canAddToCart || finalPrice == null || basePrice == null) return;

    addToCart(
      {
        id: product._id,
        name: product.name,
        image: product.imageUrl ?? "",
        category: product.category,
        size: selectedSize?.label ?? null,

        // ⚠️ UI ONLY — server must revalidate
        basePrice,
        price: finalPrice,
        discount: product.discount,
      },
      1
    );
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-20">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* IMAGE */}
          <div className="bg-gray-50 flex items-center justify-center p-12">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain"
                priority
              />
            ) : (
              <div className="text-6xl text-gray-300 font-bold">
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="space-y-8">

            <div>
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold uppercase tracking-tight">
                {product.name}
              </h1>
            </div>

            <p className="text-gray-500 leading-relaxed max-w-xl">
              {product.description}
            </p>

            {/* PRICE */}
            <div>
              <p className="text-sm text-gray-400 mb-1">
                {hasSizes ? "Price (selected size)" : "Price"}
              </p>

              <div className="flex items-end gap-4">
                {product.discount > 0 && basePrice !== null && (
                  <span className="text-lg text-gray-400 line-through">
                    ₹{basePrice}
                  </span>
                )}
                {finalPrice !== null && (
                  <span className="text-3xl font-bold">
                    ₹{finalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            {hasSizes && (
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Select Size
                </p>

                <div className="flex flex-wrap gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedSize(s)}
                      className={`px-5 py-3 border text-sm font-bold transition ${
                        selectedSize?.value === s.value
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ADD TO CART */}
            <button
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-5 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={16} />
              {product.soldOut
                ? "Out of Stock"
                : hasSizes && !selectedSize
                ? "Select Size"
                : "Add to Cart"}
            </button>

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

        {product.details && (
          <div className="mt-20 border-t pt-12 max-w-4xl">
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6">
              Product Details
            </h2>
            <div className="text-gray-600 whitespace-pre-line">
              {product.details}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
