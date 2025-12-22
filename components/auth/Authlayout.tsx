// components/auth/AuthLayout.tsx
"use client";
import React from "react";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) {
  return (
    <main className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-slate-400 hover:text-red-600 transition-colors mb-12 uppercase">
          <MoveLeft size={14} /> Back to Gallery
        </Link>
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif italic text-slate-900 mb-2">Bourgon</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-red-600 font-bold">{subtitle}</p>
        </div>

        <div className="bg-white border border-slate-100 p-10 shadow-2xl shadow-slate-200/50 rounded-sm">
          <h1 className="text-2xl font-serif italic mb-8 text-slate-800">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}