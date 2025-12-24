"use client";

import { Heart } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

interface WishlistButtonProps {
  productId: Id<"products">;
  className?: string;
}

export default function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const { user } = useAuth();
  const [isToggling, setIsToggling] = useState(false);

  /* ================= CONVEX ================= */
  const isInWishlist = useQuery(
    api.wishlist.isInWishlist,
    user?.uid && productId
      ? { userId: user.uid, productId }
      : "skip"
  );

  const addToWishlist = useMutation(api.wishlist.addToWishlist);
  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  /* ================= HANDLERS ================= */
  const handleToggle = async () => {
    if (!user?.uid || isToggling) return;

    setIsToggling(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist({
          userId: user.uid,
          productId,
        });
      } else {
        await addToWishlist({
          userId: user.uid,
          productId,
        });
      }
    } catch (error) {
      console.error("Wishlist toggle error", error);
    } finally {
      setIsToggling(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`${className} transition-all ${
        isInWishlist
          ? "text-red-600 hover:text-red-700"
          : "text-gray-400 hover:text-red-600"
      } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        className={isInWishlist ? "fill-current" : ""}
      />
    </button>
  );
}

