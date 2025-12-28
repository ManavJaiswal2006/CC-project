"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useProfessionalMode } from "@/app/context/ProfessionalModeContext";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isProfessionalMode } = useProfessionalMode();
  
  const userId = user?.uid ?? null;
  const userData = useQuery(
    api.user.getUser,
    userId ? { userId } : "skip"
  );
  
  // Determine if user is a distributor and in professional mode
  const isDistributor = userData?.role === "distributor" || userData?.category === "distributor";
  const useDistributorDiscount = isDistributor && isProfessionalMode;

  /* ================= CONVEX ================= */
  const wishlist = useQuery(
    api.wishlist.getWishlist,
    user?.uid ? { userId: user.uid } : "skip"
  );

  const removeFromWishlist = useMutation(api.wishlist.removeFromWishlist);

  /* ================= HANDLERS ================= */
  const handleRemove = async (productId: string) => {
    if (!user?.uid) return;
    try {
      await removeFromWishlist({
        userId: user.uid,
        productId: productId as any,
      });
    } catch (error) {
      console.error("Remove from wishlist error", error);
    }
  };

  const handleAddToCart = (item: any) => {
    const product = item.product;
    if (!product) return;

    // Calculate base price from sizes, subproducts, colors, or single price
    const sizes = product.sizes ?? [];
    const subproducts = product.subproducts ?? [];
    const colors = product.colors ?? [];
    
    const hasSizes = sizes.length > 0;
    const hasSubproducts = subproducts.length > 0;
    const hasColors = colors.length > 0;
    
    let basePrice = 0;
    if (hasSizes) {
      basePrice = Math.min(...sizes.map((s: any) => s.price ?? 0));
    } else if (hasSubproducts) {
      basePrice = Math.min(...subproducts.map((sp: any) => sp.price ?? 0));
    } else if (hasColors) {
      basePrice = Math.min(...colors.map((c: any) => c.price ?? 0));
    } else {
      basePrice = product.price ?? 0;
    }
    
    // Get appropriate discount based on user role
    const discount = useDistributorDiscount 
      ? (product.distributorDiscount ?? 0)
      : (product.customerDiscount ?? 0);
    
    const finalPrice = discount > 0 && basePrice > 0
      ? Math.round(basePrice - (basePrice * discount) / 100)
      : basePrice;

    // Get image URL
    const imageUrls = (product as any).imageUrls || [];
    const imageUrl = imageUrls[0] || product.imageUrl || "";

    addToCart(
      {
        id: product._id,
        name: product.name,
        image: imageUrl,
        category: product.category,
        size: null,
        basePrice,
        price: finalPrice,
        discount,
        packQuantity: product.quantity && product.quantity > 1 ? product.quantity : undefined,
      },
      1
    );
  };

  /* ================= LOADING ================= */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Please log in to view your wishlist.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-red-600 transition-all"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (wishlist === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p className="text-sm text-gray-500">Loading wishlist...</p>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="w-full px-6 space-y-8">
        {/* HEADER */}
        <header className="border-b pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart size={24} className="text-red-600 fill-current" />
            <h1 className="text-3xl font-bold uppercase">My Wishlist</h1>
          </div>
          <p className="text-sm text-gray-500">
            {wishlist.length === 0
              ? "Your wishlist is empty"
              : `${wishlist.length} item${wishlist.length > 1 ? "s" : ""} saved`}
          </p>
        </header>

        {/* WISHLIST ITEMS */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 border border-gray-200">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Your wishlist is empty</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-red-600 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;

              // Calculate base price from sizes, subproducts, colors, or single price
              const sizes = product.sizes ?? [];
              const subproducts = product.subproducts ?? [];
              const colors = product.colors ?? [];
              
              const hasSizes = sizes.length > 0;
              const hasSubproducts = subproducts.length > 0;
              const hasColors = colors.length > 0;
              
              let basePrice = 0;
              if (hasSizes) {
                basePrice = Math.min(...sizes.map((s: any) => s.price ?? 0));
              } else if (hasSubproducts) {
                basePrice = Math.min(...subproducts.map((sp: any) => sp.price ?? 0));
              } else if (hasColors) {
                basePrice = Math.min(...colors.map((c: any) => c.price ?? 0));
              } else {
                basePrice = product.price ?? 0;
              }
              
              // Calculate final price with discount
              const discount = useDistributorDiscount 
                ? (product.distributorDiscount ?? 0)
                : (product.customerDiscount ?? 0);
              
              const finalPrice = discount > 0 && basePrice > 0
                ? Math.round(basePrice - (basePrice * discount) / 100)
                : basePrice;

              return (
                <div
                  key={item._id}
                  className="border border-gray-200 hover:shadow-lg transition-shadow group"
                >
                  <Link href={`/shop/${product._id}`}>
                    <div className="relative h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {(() => {
                        // Get first image from imageUrls array or fallback to imageUrl
                        const imageUrls = (product as any).imageUrls || [];
                        const displayImage = imageUrls[0] || product.imageUrl;
                        
                        return displayImage ? (
                          <Image
                            src={displayImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-contain group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="text-gray-300 text-4xl font-bold">
                            {product.name.charAt(0)}
                          </div>
                        );
                      })()}
                      {(() => {
                        const discount = useDistributorDiscount 
                          ? (product.distributorDiscount ?? 0)
                          : (product.customerDiscount ?? 0);
                        return discount > 0 && (
                          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                            -{discount}% OFF
                          </div>
                        );
                      })()}
                      {product.soldOut && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center text-sm font-bold uppercase text-red-600">
                          Out of stock
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/shop/${product._id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-red-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {(() => {
                          const discount = useDistributorDiscount 
                            ? (product.distributorDiscount ?? 0)
                            : (product.customerDiscount ?? 0);
                          return discount > 0;
                        })() && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{basePrice}
                          </p>
                        )}
                        <p className="text-lg font-bold text-gray-900">
                          ₹{finalPrice}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item as any)}
                      disabled={product.soldOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

