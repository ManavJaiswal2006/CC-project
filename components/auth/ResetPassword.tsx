"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/auth/Authlayout";

function ResetPasswordContent() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password. Please try again.");
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <AuthLayout title="Reset your password." subtitle="Password Recovery">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password." subtitle="Password Recovery">
      {success ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 p-6 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-800 text-sm font-bold mb-2">
                  Password Reset Successful!
                </p>
                <p className="text-green-700 text-xs font-light leading-relaxed">
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all"
          >
            GO TO LOGIN <ArrowLeft size={14} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border-0 border-b border-slate-200 py-3 pr-10 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
                placeholder="Enter new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-slate-400 text-[10px] font-light mt-2">
              Password must be at least 6 characters long.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-0 border-b border-slate-200 py-3 pr-10 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
                placeholder="Confirm new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-[10px] font-bold tracking-widest uppercase">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-red-700 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                RESETTING...
              </>
            ) : (
              <>
                RESET PASSWORD <Lock size={14} />
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-slate-900" size={32} />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

