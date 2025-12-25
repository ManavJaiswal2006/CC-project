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
      await sendEmailVerification(user);
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return (
      <AuthLayout title="Not logged in." subtitle="Email Verification">
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-yellow-800 text-sm font-light">
              You need to be logged in to verify your email.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all"
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
          <div className="bg-green-50 border border-green-200 p-6 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-800 text-sm font-bold mb-2">
                  Your email has been verified!
                </p>
                <p className="text-green-700 text-xs font-light">
                  You can now access all features of your account.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all"
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
        <div className="bg-blue-50 border border-blue-200 p-6 rounded">
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-blue-800 text-sm font-bold mb-2">
                Verification email sent!
              </p>
              <p className="text-blue-700 text-xs font-light leading-relaxed mb-2">
                We've sent a verification email to <strong>{user.email}</strong>. 
                Please check your inbox and click the verification link to verify your email address.
              </p>
              <p className="text-blue-600 text-[10px] font-bold tracking-wider uppercase mt-3">
                Don't see the email? Check your spam folder.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-red-700 text-[11px] font-bold tracking-wider uppercase">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <p className="text-green-700 text-[11px] font-bold tracking-wider uppercase">
              {success}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={verifying}
            className="w-full bg-red-700 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full border border-slate-200 text-slate-700 py-3 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50"
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

