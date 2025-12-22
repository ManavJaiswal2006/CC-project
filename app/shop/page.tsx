"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

      return {
        id: p._id,
        name: p.name,
        category: p.category,
        image: p.imageUrl,
        inStock: !p.soldOut,

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
    return products
      .filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory =
          category === "All" || p.category === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.finalPrice - b.finalPrice;
        if (sortBy === "price-high") return b.finalPrice - a.finalPrice;
        return 0;
      });
  }, [products, search, category, sortBy]);

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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-red-700">
            BOURGON
            <span className="text-black text-sm ml-2 font-normal">
              PRIME
            </span>
          </h1>

          {/* SEARCH */}
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <input
              className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-red-600 outline-none"
              placeholder="Search cookware…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">

        {/* ================= SIDEBAR ================= */}
        <aside className="w-full md:w-64 space-y-6">
          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Filter size={16} /> Categories
            </h3>

            <div className="space-y-1">
              <button
                onClick={() => setCategory("All")}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
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
                  className={`block w-full text-left px-4 py-2 rounded-lg text-sm ${
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
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} products
            </p>
            <select
              className="border border-gray-300 p-2 rounded-lg text-sm bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
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
                <div className="h-64 bg-gray-50 flex items-center justify-center p-6">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="text-gray-300 text-6xl font-bold">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] text-red-600 font-bold uppercase mb-1">
                    {product.category}
                  </p>

                  <h3 className="font-bold text-lg mb-4">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex justify-between items-center pt-4 border-t">
                    <div>
                      {product.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                          ₹{product.basePrice}
                        </span>
                      )}
                      <span className="text-xl font-bold">
                        ₹{product.finalPrice}
                      </span>

                      {product.hasSizes && (
                        <p className="text-[10px] text-gray-400">
                          From {product.sizesCount} sizes
                        </p>
                      )}
                    </div>

                    <button
                      disabled={!product.inStock}
                      className="bg-black text-white p-2.5 rounded-full hover:bg-red-600 disabled:bg-gray-200"
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
