"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, ShoppingBag } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Dropdown from "@/components/UI/Dropdown";
import { useAuth } from "@/app/context/AuthContext";
import { useProfessionalMode } from "@/app/context/ProfessionalModeContext";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function ShopPage() {
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

  /* ================= CART ================= */
  const { addToCart } = useCart();
  const router = useRouter();

  /* ================= DATA ================= */
  const rawProducts = useQuery(api.product.getAllProducts);
  const categories = useQuery(api.product.getCategories);

  /* ================= STATE ================= */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  /* ================= TRANSFORM ================= */
  const products = useMemo(() => {
    if (!rawProducts) return [];

    return rawProducts.map((p) => {
      const sizes = p.sizes ?? [];
      const hasSizes = sizes.length > 0;
      const subproducts = p.subproducts ?? [];
      const hasSubproducts = subproducts.length > 0;
      const colors = p.colors ?? [];
      const hasColors = colors.length > 0;

      // Base price = min of sizes, subproducts, colors, or single price
      const basePrice: number = hasSizes
        ? Math.min(...sizes.map((s) => s.price ?? 0))
        : hasSubproducts
        ? Math.min(...subproducts.map((sp) => sp.price ?? 0))
        : hasColors
        ? Math.min(...colors.map((c) => c.price ?? 0))
        : p.price ?? 0;

      // Get appropriate discount based on user role
      const discount = useDistributorDiscount 
        ? (p.distributorDiscount ?? 0)
        : (p.customerDiscount ?? 0);

      // Calculate final price from base price and discount
      const finalPrice =
        discount > 0
          ? Math.round(basePrice - (basePrice * discount) / 100)
          : basePrice;

      const stock = p.stock ?? 0;
      const inStock = !p.soldOut && stock > 0;

      // Get all image URLs (support both new imageUrls array and legacy imageUrl)
      const imageUrls = (p as any).imageUrls;
      const allImages = Array.isArray(imageUrls) && imageUrls.length > 0
        ? imageUrls
        : p.imageUrl
        ? [p.imageUrl]
        : [];

      return {
        id: p._id,
        name: p.name,
        category: p.category,
        image: allImages[0] || null, // First image for display
        imageUrl: p.imageUrl || null, // Legacy image URL
        imageUrls: allImages, // All images
        inStock,
        stock,

        basePrice,
        finalPrice,
        discount,

        hasSizes,
        hasSubproducts,
        hasColors,
        sizesCount: sizes.length,
        quantity: p.quantity ?? 1, // Pack quantity
        subproducts: subproducts.map((sp) => sp.label), // For search
        // Store full product data for cart
        fullProduct: p,
      };
    });
  }, [rawProducts, useDistributorDiscount]);

  /* ================= FILTER + SORT ================= */
  const filteredProducts = useMemo(() => {
    // Calculate max price for range slider
    const maxPrice = Math.max(...products.map((p) => p.finalPrice), 10000);
    
    return products
      .filter((p) => {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          p.name.toLowerCase().includes(searchLower) ||
          (p.subproducts && p.subproducts.some((subproductLabel: string) =>
            subproductLabel.toLowerCase().includes(searchLower)
          ));
        const matchesCategory =
          category === "All" || p.category === category;
        const matchesPrice =
          p.finalPrice >= priceRange[0] && p.finalPrice <= priceRange[1];
        const matchesStock = !showInStockOnly || p.inStock;
        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.finalPrice - b.finalPrice;
        if (sortBy === "price-high") return b.finalPrice - a.finalPrice;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        return 0;
      });
  }, [products, search, category, sortBy, priceRange, showInStockOnly]);

  /* ================= LOADING ================= */
  if (rawProducts === undefined || categories === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-gray-600">Loading shop…</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 font-sans">

      {/* ================= HEADER ================= */}
      <header className="border-b border-gray-200 sticky top-0 z-30 shadow-md backdrop-blur-sm bg-white/95">
        <div className="w-full px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-red-700 whitespace-nowrap">
                BOURGON
                <span className="text-black text-base sm:text-lg ml-2 font-normal">
                  PRIME
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">Premium Cookware Collection</p>
            </div>

            {/* SEARCH */}
            <div className="relative w-full sm:w-auto sm:flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                className="w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-black focus:bg-white outline-none text-sm border-2 border-transparent focus:border-gray-300 transition-all shadow-sm hover:shadow-md"
                placeholder="Search cookware…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="w-full py-6 sm:py-8 md:py-10 px-4 sm:px-6 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* ================= SIDEBAR ================= */}
        <aside className="w-full md:w-72 space-y-6 shrink-0">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base text-gray-900">
              <Filter size={18} className="text-gray-700" /> 
              <span className="uppercase tracking-wider">Categories</span>
            </h3>

            <div className="flex flex-wrap md:flex-col gap-2">
              <button
                onClick={() => setCategory("All")}
                className={`block text-left px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  category === "All"
                    ? "bg-black text-white shadow-md transform scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                All Products
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`block text-left px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    category === cat
                      ? "bg-black text-white shadow-md transform scale-105"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ================= GRID ================= */}
        <main className="flex-1">

          {/* SORT BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of <span className="font-bold text-gray-900">{products.length}</span> products
            </p>
            <Dropdown
              options={[
                { value: "featured", label: "Sort by: Featured" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "name-asc", label: "Name: A to Z" },
                { value: "name-desc", label: "Name: Z to A" },
              ]}
              value={sortBy}
              onChange={setSortBy}
              className="w-full sm:w-auto min-w-[220px]"
            />
          </div>

          {/* EMPTY */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium text-lg mb-2">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <Link
                href={`/shop/${product.id}`}
                key={product.id}
                className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1"
              >
                {/* DISCOUNT BADGE */}
                {product.discount > 0 && (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    -{product.discount}% OFF
                  </div>
                )}

                {/* IMAGE */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 sm:p-8 overflow-hidden" style={{ height: 'calc(var(--spacing) * 50)' }}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={`object-contain ${product.inStock ? "" : "opacity-40 grayscale"}`}
                      priority={false}
                    />
                  ) : (
                    <div className="text-gray-300 text-6xl font-bold">
                      {product.name.charAt(0)}
                    </div>
                  )}
                  
                  {/* MULTIPLE IMAGES INDICATOR */}
                  {(product as any).imageUrls && (product as any).imageUrls.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                      {(product as any).imageUrls.length} photos
                    </div>
                  )}
                  
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg">
                        Out of stock
                      </div>
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                  <p className="text-[10px] text-red-600 font-bold uppercase mb-2 truncate tracking-wider">
                    {product.category}
                  </p>

                  <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex justify-between items-end gap-3 pt-4 border-t border-gray-100">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through shrink-0">
                            ₹{product.basePrice}
                          </span>
                        )}
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 shrink-0">
                          ₹{product.finalPrice}
                        </span>
                      </div>

                      {product.hasSizes && (
                        <p className="text-[10px] text-gray-500 mt-1.5 font-medium">
                          Available in {product.sizesCount} sizes
                        </p>
                      )}
                      {product.quantity > 1 && (
                        <p className="text-[10px] text-red-600 mt-1.5 font-bold uppercase">
                          Pack of {product.quantity}
                        </p>
                      )}
                    </div>

                    <button
                      disabled={!product.inStock}
                      className="bg-black text-white p-3 rounded-full hover:bg-red-600 disabled:bg-gray-200 disabled:cursor-not-allowed shrink-0 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110 disabled:transform-none cursor-pointer"
                      aria-label="Add to cart"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent navigation to product page
                        
                        // If product has variants (sizes, subproducts, colors), navigate to product page
                        if (product.hasSizes || product.hasSubproducts || product.hasColors) {
                          router.push(`/shop/${product.id}`);
                          return;
                        }
                        
                        // For simple products without variants, add directly to cart
                        if (product.inStock && product.basePrice !== null && product.finalPrice !== null) {
                          addToCart(
                            {
                              id: product.id,
                              name: product.name,
                              image: product.image || product.imageUrl || "",
                              category: product.category,
                              size: null,
                              subproduct: null,
                              color: null,
                              basePrice: product.basePrice,
                              price: product.finalPrice,
                              discount: product.discount,
                              packQuantity: product.quantity > 1 ? product.quantity : undefined,
                            },
                            1
                          );
                        }
                      }}
                    >
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
