"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ArrowRight, History, X, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal, ModalBody, ModalContent, ModalTrigger } from "../UI/modal";
import { searchedItems } from "@/constants";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/* ---------------- Types ---------------- */

interface HistoryItem {
  title: string;
  href: string;
}

/* ---------------- Constants ---------------- */

const HISTORY_KEY = "bourgon_search_history";
const MAX_QUERY = 40;

/* ---------------- Component ---------------- */

export default function SearchModal() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const saved = window.localStorage.getItem(HISTORY_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as unknown;
      return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
    } catch {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(HISTORY_KEY);
      }
      return [];
    }
  });
  const router = useRouter();

  /* ---------- Debounce ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim());
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  /* ---------- Convex Product Search (FIXED) ---------- */
  const products = useQuery(
    api.product.search,
    debounced.length >= 2 ? { q: debounced } : "skip"
  );

  /* ---------- Static Page Search ---------- */
  const pages = useMemo(() => {
    if (debounced.length < 2) return [];

    return searchedItems.filter((item) =>
      item.title.toLowerCase().includes(debounced.toLowerCase())
    );
  }, [debounced]);

  const results = useMemo(
    () => [...(products ?? []), ...pages].slice(0, 8),
    [products, pages]
  );

  /* ---------- Navigation ---------- */
  const handleNavigate = (item: HistoryItem) => {
    const next = [item, ...history.filter((h) => h.href !== item.href)].slice(
      0,
      5
    );

    setHistory(next);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));

    setQuery("");
    router.push(item.href);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    window.localStorage.removeItem(HISTORY_KEY);
  };

  /* ---------------- JSX ---------------- */

  return (
    <Modal>
      <ModalTrigger className="hover:text-red-600 transition-colors">
        <Search size={22} strokeWidth={1.5} />
      </ModalTrigger>

      <ModalBody className="bg-white border max-w-2xl">
        <ModalContent className="!p-0">

          {/* INPUT */}
          <div className="p-8 border-b flex items-center gap-6">
            <Search size={24} className="text-zinc-400" />
            <input
              value={query}
              maxLength={MAX_QUERY}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or pages..."
              className="w-full text-4xl font-black uppercase bg-transparent outline-none text-black placeholder-zinc-300"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X size={24} />
              </button>
            )}
          </div>

          {/* RESULTS */}
          <div className="p-8 min-h-[350px] overflow-y-auto">
            {debounced.length >= 2 ? (
              <>
                {results.map((item) =>
                  "name" in item ? (
                    <button
                      key={item.id}
                      onClick={() =>
                        handleNavigate({
                          title: item.name,
                          href: `/shop/${item.id}`,
                        })
                      }
                      className="w-full p-4 border mb-2 flex justify-between items-center hover:border-red-600"
                    >
                      <div>
                        <h3 className="font-black uppercase text-black">
                          {item.name}
                        </h3>
                        <p className="text-xs text-zinc-500 uppercase">
                          Product · {item.category}
                        </p>
                      </div>
                      <Package size={16} />
                    </button>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() =>
                        handleNavigate({
                          title: item.title,
                          href: item.href,
                        })
                      }
                      className="w-full p-4 border mb-2 flex justify-between items-center"
                    >
                      <h3 className="font-black uppercase text-black">
                        {item.title}
                      </h3>
                      <ArrowRight size={16} />
                    </button>
                  )
                )}

                {results.length === 0 && (
                  <p className="text-center text-zinc-400 py-16">
                    No results found
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between mb-4">
                  <p className="text-xs flex items-center gap-2 text-zinc-600">
                    <History size={12} /> Recent Searches
                  </p>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleNavigate(h)}
                    className="block w-full text-left py-2 text-black hover:text-red-600"
                  >
                    {h.title}
                  </button>
                ))}
              </>
            )}
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}
