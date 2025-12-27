"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useProfessionalMode } from "@/app/context/ProfessionalModeContext";
import { useAuth } from "@/app/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface ProductCardProps {
  productId: Id<"products">;
  name: string;
  category: string;
  imageUrl: string | null;
  inStock: boolean;
  stock: number;
  hasSizes: boolean;
  sizesCount: number;
  // For retail mode (MSRP)
  basePrice?: number;
  finalPrice?: number;
  discount?: number;
}

export default function ProductCard({
  productId,
  name,
  category,
  imageUrl,
  inStock,
  stock,
  hasSizes,
  sizesCount,
  basePrice,
  finalPrice,
  discount,
}: ProductCardProps) {
  const { isProfessionalMode } = useProfessionalMode();
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  // Fetch scoped product data if in professional mode and user is authenticated
  const scopedProduct = useQuery(
    api.product.getScopedProduct,
    isProfessionalMode && userId
      ? { productId, userId }
      : "skip"
  );

  // Determine which pricing to display
  const isWholesale = isProfessionalMode && scopedProduct?.pricing?.type === "retailer";
  const pricing = isWholesale ? scopedProduct?.pricing : null;

  return (
    <Link
      href={`/shop/${productId}`}
      className="group relative bg-white border-2 border-gray-200 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col rounded-xl transform hover:-translate-y-1"
    >
      {/* DISCOUNT BADGE (Retail only) */}
      {!isWholesale && discount && discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
          -{discount}% OFF
        </div>
      )}

      {/* WHOLESALE BADGE */}
      {isWholesale && pricing && pricing.type === "retailer" && (
        <div className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
          WHOLESALE
        </div>
      )}

      {/* IMAGE */}
      <div className="relative h-64 sm:h-72 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 sm:p-8 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-contain ${
              inStock ? "" : "opacity-40"
            }`}
            priority={false}
          />
        ) : (
          <div className="text-gray-300 text-6xl font-serif italic">
            {name.charAt(0)}
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center text-xs font-bold uppercase text-red-600 tracking-wider">
            Out of stock
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0 border-t border-gray-100">
        <p className="text-[10px] text-red-600 font-bold uppercase mb-2 tracking-widest">
          {category}
        </p>

        <h3 className="font-serif text-lg mb-4 line-clamp-2 italic font-semibold text-gray-900">
          {name}
        </h3>

        {/* RETAIL PRICING VIEW */}
        {!isWholesale && (
          <div className="mt-auto space-y-2">
            {hasSizes ? (
              <p className="text-sm text-gray-600">
                {sizesCount} size{sizesCount > 1 ? "s" : ""} available
              </p>
            ) : (
              <div className="flex items-baseline gap-3">
                {discount && discount > 0 && basePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{basePrice.toLocaleString()}
                  </span>
                )}
                {finalPrice !== undefined && (
                  <span className="text-lg font-bold text-gray-900">
                    ₹{finalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            )}
            {stock > 0 && (
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {stock} in stock
              </p>
            )}
          </div>
        )}

        {/* WHOLESALE PRICING VIEW */}
        {isWholesale && pricing && pricing.type === "retailer" && pricing.customerPrice !== undefined && (
          <div className="mt-auto space-y-3 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                  MSRP
                </p>
                <p className="font-mono text-gray-400 line-through">
                  ₹{pricing.customerPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-1">
                  Wholesale
                </p>
                <p className="font-mono font-bold text-gray-900">
                  ₹{pricing.price.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Discount
                </p>
                <p className="text-sm font-bold text-red-600">
                  {pricing.customerPrice > 0 
                    ? Math.round(((pricing.customerPrice - pricing.price) / pricing.customerPrice) * 100)
                    : 0}%
                </p>
              </div>
              {hasSizes && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Sizes
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {sizesCount}
                  </p>
                </div>
              )}
            </div>
            {stock > 0 && (
              <p className="text-[10px] text-gray-500 uppercase tracking-wider pt-2 border-t border-gray-100">
                Stock: {stock} units
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

