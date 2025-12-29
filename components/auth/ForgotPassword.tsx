"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import AuthLayout from "@/components/auth/Authlayout";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (loading || submitted) {
      return;
    }
    
    setError("");
    setSuccess(false);
    setLoading(true);
    setSubmitted(true);

    try {
      const res = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send reset link. Please try again.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      setSubmitted(false); // Allow retry on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password." subtitle="Password Recovery">
      {success ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-6 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-800 text-sm font-bold mb-2">
                  Password Reset Email Sent!
                </p>
                <p className="text-green-700 text-xs font-light leading-relaxed">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and click the link to reset your password.
                </p>
                <p className="text-green-600 text-[10px] font-bold tracking-wider uppercase mt-4">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all"
          >
            BACK TO LOGIN <ArrowLeft size={14} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
              placeholder="member@bourgon.in"
            />
            <p className="text-slate-400 text-[10px] font-light mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          {error && (
            <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                SENDING...
              </>
            ) : (
              <>
                SEND RESET LINK <Mail size={14} />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full border border-slate-200 text-slate-700 py-3 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
          >
            BACK TO LOGIN <ArrowLeft size={14} />
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

