"use client";

import React, { useState, Suspense } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { auth } from "../lib/firebase";
import AuthLayout from "@/components/auth/Authlayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthbutton";

// 1. Separate Logic into Sub-Component
function SignUpContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/product");
    } catch (err: any) {
      setError(
        err.message.includes("email-already-in-use")
          ? "This email is already registered."
          : "Could not create account."
      );
    }
  };

  return (
    <AuthLayout title="Join the heritage." subtitle="Membership Registration">
      <form onSubmit={handleSignUp} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Email Address
          </label>
          <input
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="newmember@bourgon.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Choose Password
          </label>
          <input
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Confirm Password
          </label>
          <input
            type="password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase">
            {error}
          </p>
        )}
        <button className="w-full bg-red-700 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all">
          CREATE ACCOUNT <ShieldCheck size={14} />
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-50 text-center">
        <p className="text-slate-400 text-xs font-light">
          Already a member?{" "}
          <a href="/login" className="text-red-600 font-bold hover:underline">
            Log In
          </a>
        </p>
      </div>
      <div className="pt-10">
        <GoogleAuthButton />
      </div>
    </AuthLayout>
  );
}

// 2. Export Main Page with Suspense Wrapper
export default function SignUpPage() {
  return (
    <Suspense 
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}