"use client";

import React, { useState, Suspense } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react"; // Added Loader2 for the spinner
import { auth } from "../lib/firebase";
import AuthLayout from "@/components/auth/Authlayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthbutton";

// 1. Create a sub-component for the logic
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/product");
    } catch (err: any) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <AuthLayout title="Welcome back." subtitle="Private Concierge Access">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Email Address
          </label>
          <input
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="member@bourgon.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Password
          </label>
          <input
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase">
            {error}
          </p>
        )}
        <button className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all">
          LOG IN <ArrowRight size={14} />
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-50 text-center">
        <p className="text-slate-400 text-xs font-light">
          New to the heritage?{" "}
          <a href="/signup" className="text-red-600 font-bold hover:underline">
            Request Membership
          </a>
        </p>
      </div>
      <div className="pt-10">
        <GoogleAuthButton />
      </div>
    </AuthLayout>
  );
}

// 2. Export the Main Page wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}