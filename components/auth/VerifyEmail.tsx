"use client";

import React, { useState, useEffect, Suspense } from "react";
import { sendEmailVerification, onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/Authlayout";
import { auth } from "@/app/lib/firebase";

function VerifyEmailContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser?.emailVerified) {
        // User is verified, redirect to shop
        router.push("/shop");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleResendVerification = async () => {
    if (!user) {
      setError("You must be logged in to resend verification email.");
      return;
    }

    setError("");
    setSuccess("");
    setVerifying(true);

    try {
      const siteUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in");
      await sendEmailVerification(user, {
        url: `${siteUrl}/verify-email`,
        handleCodeInApp: false,
      });
      setSuccess("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      if (err?.code === "auth/too-many-requests") {
        setError("Too many requests. Please wait a few minutes before requesting another email.");
      } else {
        setError("Could not send verification email. Please try again.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) {
      setError("You must be logged in to check verification status.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Reload user to get latest emailVerified status
      await user.reload();
      const updatedUser = auth.currentUser;
      
      if (updatedUser?.emailVerified) {
        setSuccess("Email verified! Redirecting...");
        setTimeout(() => {
          router.push("/shop");
        }, 1500);
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      setError("Could not check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout title="Verifying..." subtitle="Email Verification">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
          <p className="text-slate-600 text-sm font-light">Loading...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return (
      <AuthLayout title="Not logged in." subtitle="Email Verification">
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-amber-200">
                <AlertCircle size={28} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-serif italic text-slate-900 mb-3">
                Login Required
              </h3>
              <p className="text-slate-700 text-sm font-light leading-relaxed max-w-sm">
                You need to be logged in to verify your email address.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            GO TO LOGIN <ArrowRight size={14} />
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (user.emailVerified) {
    return (
      <AuthLayout title="Email verified!" subtitle="Email Verification">
        <div className="space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                <CheckCircle size={40} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-serif italic text-slate-900 mb-3">
                Email Verified!
              </h3>
              <p className="text-slate-600 text-sm font-light leading-relaxed max-w-sm">
                Your email address has been successfully verified. You now have full access to all features of your Bourgon account.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/shop")}
            className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            CONTINUE TO SHOP <ArrowRight size={14} />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify your email." subtitle="Email Verification">
      <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-lg p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full -ml-16 -mb-16 opacity-50"></div>
          
          <div className="relative flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <Mail size={36} className="text-white" strokeWidth={2} />
            </div>
            
            <h3 className="text-2xl font-serif italic text-slate-900 mb-3">
              Check Your Email
            </h3>
            
            <p className="text-slate-700 text-sm font-light leading-relaxed mb-4 max-w-sm">
              We've sent a verification email to
            </p>
            
            <div className="bg-white border border-blue-200 rounded-lg px-5 py-3 mb-4 shadow-sm">
              <p className="text-blue-700 font-semibold text-sm">
                {user.email}
              </p>
            </div>
            
            <p className="text-slate-600 text-xs font-light leading-relaxed max-w-sm mb-2">
              Please check your inbox and click the verification link to verify your email address.
            </p>
            
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <AlertCircle size={14} />
              <p className="text-[10px] font-bold tracking-wider uppercase">
                Don't see the email? Check your spam folder.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-red-800 text-sm font-bold mb-1">Error</p>
                <p className="text-red-700 text-xs font-light">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={16} className="text-white" />
              </div>
              <p className="text-green-800 text-sm font-semibold">
                {success}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleResendVerification}
            disabled={verifying}
            className="w-full bg-gradient-to-r from-red-700 to-red-600 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:from-slate-900 hover:to-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {verifying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                SENDING...
              </>
            ) : (
              <>
                RESEND VERIFICATION EMAIL <Mail size={14} />
              </>
            )}
          </button>

          <button
            onClick={handleCheckVerification}
            disabled={loading}
            className="w-full border-2 border-slate-300 text-slate-700 py-3.5 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                CHECKING...
              </>
            ) : (
              <>
                I'VE VERIFIED MY EMAIL <CheckCircle size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

