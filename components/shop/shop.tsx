"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, ShoppingBag } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ShopPage() {
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

      // Base price = min size OR single price
      const basePrice: number = hasSizes
        ? Math.min(...sizes.map((s) => s.price))
        : p.price ?? 0;

      // Discounted price
      const finalPrice =
        p.discount > 0
          ? Math.round(basePrice - (basePrice * p.discount) / 100)
          : basePrice;

      const stock = p.stock ?? 0;
      const inStock = !p.soldOut && stock > 0;

      return {
        id: p._id,
        name: p.name,
        category: p.category,
        image: p.imageUrl,
        inStock,
        stock,

        basePrice,
        finalPrice,
        discount: p.discount,

        hasSizes,
        sizesCount: sizes.length,
      };
    });
  }, [rawProducts]);

  /* ================= FILTER + SORT ================= */
  const filteredProducts = useMemo(() => {
    // Calculate max price for range slider
    const maxPrice = Math.max(...products.map((p) => p.finalPrice), 10000);
    
    return products
      .filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(search.toLowerCase());
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading shop…
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

      {/* ================= HEADER ================= */}
      <header className="bg-white border-b sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-red-700 whitespace-nowrap">
            BOURGON
            <span className="text-black text-sm ml-2 font-normal">
              PRIME
            </span>
          </h1>

          {/* SEARCH */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md md:max-w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-red-600 outline-none text-sm"
              placeholder="Search cookware…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 flex flex-col md:flex-row gap-6 md:gap-8">

        {/* ================= SIDEBAR ================= */}
        <aside className="w-full md:w-64 space-y-6 shrink-0">
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Filter size={16} /> Categories
            </h3>

            <div className="flex flex-wrap md:flex-col gap-2 md:gap-1">
              <button
                onClick={() => setCategory("All")}
                className={`block text-left px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                  category === "All"
                    ? "bg-red-50 text-red-700 font-bold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`block text-left px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                    category === cat
                      ? "bg-red-50 text-red-700 font-bold"
                      : "text-gray-600 hover:bg-gray-100"
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <select
              className="w-full sm:w-auto border border-gray-300 p-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          {/* EMPTY */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed">
              <p className="text-gray-500">No products found.</p>
            </div>
          )}

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Link
                href={`/shop/${product.id}`}
                key={product.id}
                className="group relative bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                {/* DISCOUNT BADGE */}
                {product.discount > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                    -{product.discount}% OFF
                  </div>
                )}

                {/* IMAGE */}
                <div className="relative h-64 bg-gray-50 flex items-center justify-center p-6">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={`object-contain transition-transform ${product.inStock ? "group-hover:scale-110" : "opacity-40"}`}
                      priority={false}
                    />
                  ) : (
                    <div className="text-gray-300 text-6xl font-bold">
                      {product.name.charAt(0)}
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center text-sm font-bold uppercase text-red-600">
                      Out of stock
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                  <p className="text-[10px] text-red-600 font-bold uppercase mb-1 truncate">
                    {product.category}
                  </p>

                  <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex justify-between items-end gap-2 pt-4 border-t">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through shrink-0">
                            ₹{product.basePrice}
                          </span>
                        )}
                        <span className="text-lg sm:text-xl font-bold shrink-0">
                          ₹{product.finalPrice}
                        </span>
                      </div>

                      {product.hasSizes && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          From {product.sizesCount} sizes
                        </p>
                      )}
                    </div>

                    <button
                      disabled={!product.inStock}
                      className="bg-black text-white p-2 sm:p-2.5 rounded-full hover:bg-red-600 disabled:bg-gray-200 shrink-0"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag size={18} />
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
