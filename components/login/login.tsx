"use client";

import React, { useState, Suspense } from "react";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth/Authlayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthbutton";
import { auth } from "@/app/lib/firebase";

// 1. Create a sub-component for the logic
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setVerificationResent(false);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        setEmailNotVerified(true);
        setError("Please verify your email address before logging in. Check your inbox for the verification email.");
        // Sign out the user since email is not verified
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      router.push("/shop");
    } catch (err: any) {
      if (err?.code === "auth/user-not-found" || err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please try again.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err?.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
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
            className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="member@bourgon.in"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Password
            </label>
            <a 
              href="/forgot-password"
              className="text-[10px] uppercase tracking-widest font-bold text-red-600 hover:underline"
            >
              Forgot?
            </a>
          </div>
          <input
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase mb-1">
                  {error}
                </p>
                {emailNotVerified && (
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          // Re-authenticate to get user and send verification
                          const userCredential = await signInWithEmailAndPassword(auth, email, password);
                          const siteUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in");
                          await sendEmailVerification(userCredential.user, {
                            url: `${siteUrl}/verify-email`,
                            handleCodeInApp: false,
                          });
                          await auth.signOut();
                          setVerificationResent(true);
                          setError("Verification email sent! Please check your inbox.");
                        } catch (err) {
                          setError("Could not resend verification email. Please try again.");
                        }
                      }}
                      className="text-left text-red-700 text-[10px] font-bold tracking-wider uppercase hover:underline flex items-center gap-2"
                    >
                      <Mail size={12} />
                      Resend Verification Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {verificationResent && (
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <p className="text-green-700 text-[10px] font-bold tracking-wider uppercase">
              Verification email sent! Please check your inbox.
            </p>
          </div>
        )}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              LOGGING IN...
            </>
          ) : (
            <>
              LOG IN <ArrowRight size={14} />
            </>
          )}
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