"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ArrowRight, History, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal, ModalBody, ModalContent, ModalTrigger } from "../UI/modal";
import { searchedItems } from "@/constants";

interface HistoryItem {
  title: string;
  href: string;
}

export default function SearchModal() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("bourgon_search_history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const results = useMemo(() => {
    const searchStr = query.toLowerCase().trim();
    if (searchStr.length < 2) return [];

    const searchWords = searchStr.split(" ");

    return searchedItems
      .map((item) => {
        const title = item.title.toLowerCase();
        let score = 0;

        // 1. Exact match (Highest Priority)
        if (title === searchStr) score += 100;

        // 2. Starts with query (High Priority)
        if (title.startsWith(searchStr)) score += 50;

        // 3. Keyword matching (Medium Priority)
        // Checks how many words of the query exist in the title
        const matches = searchWords.filter(word => title.includes(word));
        score += matches.length * 10;

        // 4. Consecutive sequence (Lower Priority)
        if (title.includes(searchStr)) score += 5;

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score) // Sort by highest score
      .slice(0, 8); // Limit results for better UI
  }, [query]);

  const handleNavigate = (item: HistoryItem) => {
    // Add to history
    const newHistory = [item, ...history.filter((h) => h.href !== item.href)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("bourgon_search_history", JSON.stringify(newHistory));
    
    // Perform navigation (Modal usually closes on route change in most Modal implementations)
    setQuery("");
    router.push(item.href);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem("bourgon_search_history");
  };

  return (
    <Modal>
      <ModalTrigger className="hover:text-red-600 transition-colors">
        <Search size={22} strokeWidth={1.5} />
      </ModalTrigger>

      <ModalBody className="bg-white border border-zinc-200 max-w-2xl">
        <ModalContent className="!p-0">
          <div className="p-8 border-b border-zinc-100 flex items-center gap-6">
            <Search className="text-zinc-400" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-transparent text-zinc-900 text-3xl md:text-5xl font-black uppercase tracking-tighter focus:outline-none placeholder:text-zinc-200"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="hover:text-red-600 transition-colors">
                <X size={24} />
              </button>
            )}
          </div>

          <div className="p-8 min-h-[400px] max-h-[70vh] bg-zinc-50/30 overflow-y-auto">
            {query.length >= 2 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-4">
                   <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Results found: {results.length}</p>
                </div>
                {results.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleNavigate({ title: res.title, href: res.href })}
                    className="w-full group flex items-center justify-between p-4 bg-white border border-zinc-100 hover:border-red-600 transition-all text-left"
                  >
                    <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-900">{res.title}</h3>
                    <ArrowRight className="text-zinc-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" size={18} />
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-zinc-400 text-sm">No results for "{query}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-2">
                    <History size={12} /> Recent Searches
                  </p>
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="text-[9px] uppercase tracking-widest text-red-600 font-bold hover:underline">
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  {history.length > 0 ? history.map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleNavigate(item)}
                      className="text-left text-sm font-bold uppercase tracking-tight text-zinc-600 hover:text-red-600 transition-colors flex items-center justify-between group"
                    >
                      {item.title}
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )) : (
                    <p className="text-zinc-300 text-[10px] uppercase tracking-widest italic py-4">Your search history is empty</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModalContent>
      </ModalBody>
    </Modal>
  );
}