"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import type { Id } from "@/convex/_generated/dataModel";

interface RecentlyViewedProps {
  currentProductId?: Id<"products">;
  limit?: number;
}

export default function RecentlyViewed({
  currentProductId,
  limit = 4,
}: RecentlyViewedProps) {
  const { user } = useAuth();
  const [viewedIds, setViewedIds] = useState<string[]>([]);

  // Track product view
  useEffect(() => {
    if (!user?.uid || !currentProductId) return;

    // Track in localStorage for immediate display
    const key = `recently_viewed_${user.uid}`;
    const stored = localStorage.getItem(key);
    const viewed = stored ? JSON.parse(stored) : [];

    // Remove current product if already in list
    const filtered = viewed.filter((id: string) => id !== currentProductId);
    // Add to beginning
    const updated = [currentProductId, ...filtered].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));
    setViewedIds(updated);

    // Also track in backend (optional, for cross-device sync)
    // You can add a mutation call here if needed
  }, [user?.uid, currentProductId]);

  // Get recently viewed products
  const recentlyViewed = useQuery(
    api.product.getProductsByIds,
    user?.uid && viewedIds.length > 0
      ? { productIds: viewedIds.slice(0, limit) as Id<"products">[] }
      : "skip"
  );

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold uppercase mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recentlyViewed.map((product) => {
          if (!product) return null;
          const sizes = product.sizes ?? [];
          const hasSizes = sizes.length > 0;
          const basePrice = hasSizes
            ? Math.min(...sizes.map((s) => s.customerPrice))
            : product.customerPrice ?? 0;
          const finalPrice =
            product.discount > 0
              ? Math.round(basePrice - (basePrice * product.discount) / 100)
              : basePrice;

          return (
            <Link
              key={product._id}
              href={`/shop/${product._id}`}
              className="group border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="text-gray-300 text-2xl font-bold">
                    {product.name.charAt(0)}
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-sm font-bold">₹{finalPrice}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

