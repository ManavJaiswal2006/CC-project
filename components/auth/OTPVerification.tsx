"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  purpose: "signup" | "login";
  onVerify: () => void;
  onResend?: () => void;
  onCancel?: () => void;
}

export default function OTPVerification({
  email,
  purpose,
  onVerify,
  onResend,
  onCancel,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
      setError("");
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpString,
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        onVerify();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resend OTP. Please try again.");
      }

      setResendCooldown(60); // 60 second cooldown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
          <Mail className="text-red-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1">{email}</p>
        <p className="text-xs text-gray-500 mt-2">
          Enter the code below to {purpose === "signup" ? "complete your registration" : "access your account"}
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading || success}
            className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
            <p className="text-green-600 text-sm font-medium">OTP verified successfully!</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={handleVerify}
          disabled={loading || success || otp.join("").length !== 6}
          className="w-full bg-slate-900 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              VERIFYING...
            </>
          ) : success ? (
            <>
              <CheckCircle size={14} />
              VERIFIED
            </>
          ) : (
            <>
              VERIFY OTP <ArrowRight size={14} />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            onClick={handleResend}
            disabled={loading || resendCooldown > 0}
            className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend OTP"}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Didn't receive the code? Check your spam folder or try resending.
      </p>
    </div>
  );
}

