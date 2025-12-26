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
import { useAuth } from "@/app/context/AuthContext";
import { useProfessionalMode } from "@/app/context/ProfessionalModeContext";

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

  /* ================= AUTH & ROLE ================= */
  const { user } = useAuth();
  const { isProfessionalMode } = useProfessionalMode();
  const userId = user?.uid ?? null;
  
  const userData = useQuery(
    api.user.getUser,
    userId ? { userId } : "skip"
  );
  
  // Determine if user is a distributor and in professional mode
  const isDistributor = userData?.role === "distributor" || userData?.category === "distributor";
  const useDistributorDiscount = isDistributor && isProfessionalMode;

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
    
    // Get appropriate discount based on user role
    const discount = useDistributorDiscount 
      ? (product.distributorDiscount ?? 0)
      : (product.customerDiscount ?? 0);
    
    if (discount > 0) {
      return Math.round(
        basePrice - (basePrice * discount) / 100
      );
    }
    return basePrice;
  }, [product, basePrice, useDistributorDiscount]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-600">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
          <p className="text-sm text-gray-500">The product you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!canAddToCart || finalPrice == null || basePrice == null)
      return;

    // Get appropriate discount based on user role
    const discount = useDistributorDiscount 
      ? (product.distributorDiscount ?? 0)
      : (product.customerDiscount ?? 0);

    addToCart(
      {
        id: product._id,
        name: product.name,
        image: product.imageUrl ?? "",
        category: product.category,
        size: selectedSize?.label ?? null,
        basePrice,
        price: finalPrice,
        discount,
      },
      1
    );
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-12 sm:mb-16">

          {/* IMAGE */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl border-2 border-gray-200 flex items-center justify-center p-6 sm:p-8 md:p-12 aspect-square overflow-hidden group/image">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain w-full h-full transition-transform duration-500 group-hover/image:scale-105"
                priority
              />
            ) : (
              <div className="text-6xl sm:text-7xl md:text-8xl text-gray-300 font-bold">
                {product.name.charAt(0)}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="space-y-6 sm:space-y-8">

            <div>
              <p className="text-xs text-red-600 font-bold uppercase tracking-widest mb-3">
                {product.category}
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-gray-900">
                {product.name}
              </h1>
            </div>

            <p className="text-gray-600 leading-relaxed text-base sm:text-lg w-full">
              {product.description}
            </p>

            {/* PRICE & STOCK */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                {hasSizes ? "Price (selected size)" : "Price"}
              </p>

              <div className="flex items-baseline gap-4 mb-3">
                {(() => {
                  const discount = useDistributorDiscount 
                    ? (product.distributorDiscount ?? 0)
                    : (product.customerDiscount ?? 0);
                  return discount > 0 && basePrice !== null;
                })() && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    ₹{basePrice}
                  </span>
                )}
                {finalPrice !== null && (
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                    ₹{finalPrice}
                  </span>
                )}
                {(() => {
                  const discount = useDistributorDiscount 
                    ? (product.distributorDiscount ?? 0)
                    : (product.customerDiscount ?? 0);
                  return discount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {discount}% OFF
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2">
                {stock > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-600">
                      In Stock
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm font-medium text-red-600">
                      Out of Stock
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            {hasSizes && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
                <p className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                  Select Size
                </p>

                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {sizes.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSelectedSize({ label: s.label, value: s.value, price: s.price })}
                      className={`px-6 py-3 border-2 text-sm font-bold transition-all duration-200 whitespace-nowrap rounded-lg cursor-pointer ${
                        selectedSize?.value === s.value
                          ? "border-black bg-black text-white shadow-lg transform scale-105"
                          : "border-gray-300 hover:border-black hover:shadow-md bg-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ADD TO CART & WISHLIST */}
            <div className="flex items-center gap-4">
              <button
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-4 sm:py-5 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-3 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none cursor-pointer"
              >
                <ShoppingBag size={20} className="shrink-0" />
                <span className="truncate">
                  {product.soldOut || stock <= 0
                    ? "Out of Stock"
                    : hasSizes && !selectedSize
                    ? "Select Size First"
                    : "Add to Cart"}
                </span>
              </button>
              <WishlistButton
                productId={product._id}
                className="p-4 sm:p-5 border-2 border-gray-300 hover:border-black rounded-lg transition-all duration-200 shrink-0 shadow-md hover:shadow-lg bg-white"
              />
            </div>

            {/* TRUST */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="p-1.5 bg-green-100 rounded-full">
                  <Check size={16} className="text-green-600" />
                </div>
                <span>Premium stainless steel construction</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="p-1.5 bg-blue-100 rounded-full">
                  <Check size={16} className="text-blue-600" />
                </div>
                <span>Secure payment options</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <div className="p-1.5 bg-purple-100 rounded-full">
                  <Check size={16} className="text-purple-600" />
                </div>
                <span>Easy returns & exchanges</span>
              </div>
            </div>

          </div>
        </div>

        {product.details && (
          <div className="mt-12 sm:mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-10 md:p-12 w-full">
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide mb-6 sm:mb-8 pb-4 border-b-2 border-gray-200">
              Product Details
            </h2>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed text-base sm:text-lg">
              {product.details}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        <div className="mt-12 sm:mt-16">
          <ReviewSection productId={product._id} />
        </div>

        {/* RECENTLY VIEWED */}
        <div className="mt-12 sm:mt-16">
          <RecentlyViewed currentProductId={product._id} />
        </div>

      </div>
    </div>
  );
}
