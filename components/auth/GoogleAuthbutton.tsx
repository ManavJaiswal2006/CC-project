// components/auth/GoogleAuthButton.tsx
"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Chrome } from "lucide-react";
import { useState } from "react";
import { auth } from "@/app/lib/firebase";

export default function GoogleAuthButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const returnTo = searchParams.get("returnTo") || "/shop";

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    // Forces the account selector to appear every time
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithPopup(auth, provider);
      router.push(returnTo);
    } catch (error: any) {
      console.error("Google Auth Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full border border-slate-200 py-4 flex items-center bg-black hover:text-black cursor-pointer justify-center gap-3 text-[10px] font-bold tracking-[0.2em] hover:bg-slate-50 transition-all uppercase disabled:opacity-50"
    >
      <Chrome size={14} className={loading ? "animate-spin" : ""} />
      {loading ? "Authenticating..." : "Continue with Google"}
    </button>
  );
}