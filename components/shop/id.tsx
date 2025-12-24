"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import Image from "next/image";
import type { Id } from "@/convex/_generated/dataModel";
import WishlistButton from "@/components/wishlist/WishlistButton";
import ReviewSection from "@/components/reviews/ReviewSection";
import RecentlyViewed from "@/components/products/RecentlyViewed";

type Size = {
  label: string;
  value: string;
  price: number;
};

export default function ProductPage() {
  /* ================= PARAM (SAFE) ================= */
  const params = useParams();
  const id =
    typeof params?.id === "string" ? params.id : null;

  /* ================= DATA (GUARDED) ================= */
  const product = useQuery(
    api.product.getProduct,
    id ? { id: id as Id<"products"> } : "skip"
  );

  /* ================= CART ================= */
  const { addToCart } = useCart();

  /* ================= STATE ================= */
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  /* ================= NORMALIZATION ================= */
  const sizes = product?.sizes ?? [];
  const hasSizes = sizes.length > 0;

  /* ================= PRICE ================= */
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

  const stock = product?.stock ?? 0;
  const canAddToCart =
    !!product &&
    !product.soldOut &&
    stock > 0 &&
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
    if (!canAddToCart || finalPrice == null || basePrice == null)
      return;

    addToCart(
      {
        id: product._id,
        name: product.name,
        image: product.imageUrl ?? "",
        category: product.category,
        size: selectedSize?.label ?? null,
        basePrice,
        price: finalPrice,
        discount: product.discount,
      },
      1
    );
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 px-4 sm:px-6 py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">

          {/* IMAGE */}
          <div className="bg-gray-50 flex items-center justify-center p-6 sm:p-8 md:p-12 aspect-square">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain w-full h-full"
                priority
              />
            ) : (
              <div className="text-4xl sm:text-5xl md:text-6xl text-gray-300 font-bold">
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

            {/* PRICE & STOCK */}
            <div className="space-y-1">
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

              <p className="text-xs text-gray-500">
                {stock > 0
                  ? "In stock"
                  : "Out of stock"}
              </p>
            </div>

            {/* SIZE SELECTOR */}
            {hasSizes && (
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Select Size
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 sm:px-5 py-2 sm:py-3 border text-sm font-bold transition whitespace-nowrap ${
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

            {/* ADD TO CART & WISHLIST */}
            <div className="flex items-center gap-3">
              <button
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-4 sm:py-5 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <ShoppingBag size={16} className="shrink-0" />
                <span className="truncate">
                  {product.soldOut || stock <= 0
                    ? "Out of Stock"
                    : hasSizes && !selectedSize
                    ? "Select Size"
                    : "Add to Cart"}
                </span>
              </button>
              <WishlistButton
                productId={product._id}
                className="p-4 sm:p-5 border border-gray-300 hover:border-black transition-colors shrink-0"
              />
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

        {/* REVIEWS */}
        <ReviewSection productId={product._id} />

        {/* RECENTLY VIEWED */}
        <RecentlyViewed currentProductId={product._id} />

      </div>
    </div>
  );
}
