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
  const [errorType, setErrorType] = useState<"invalid" | "expired" | "attempts" | "general">("general");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [showShake, setShowShake] = useState(false);
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
      setError("Please enter the complete 6-digit code");
      setErrorType("general");
      setShowShake(true);
      setTimeout(() => setShowShake(false), 500);
      return;
    }

    setLoading(true);
    setError("");
    setErrorType("general");
    setAttemptsRemaining(null);

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
        const errorMsg = data.message || "Invalid OTP. Please try again.";
        
        // Determine error type for better UI
        if (errorMsg.includes("expired") || errorMsg.includes("no longer valid")) {
          setErrorType("expired");
        } else if (errorMsg.includes("Too many incorrect attempts") || errorMsg.includes("disabled")) {
          setErrorType("attempts");
        } else if (errorMsg.includes("incorrect") || errorMsg.includes("Invalid OTP")) {
          setErrorType("invalid");
          // Extract remaining attempts from error message
          const attemptsMatch = errorMsg.match(/(\d+)\s+attempt/);
          if (attemptsMatch) {
            setAttemptsRemaining(parseInt(attemptsMatch[1], 10));
          } else {
            setAttemptsRemaining(null);
          }
        } else {
          setErrorType("general");
        }
        
        throw new Error(errorMsg);
      }

      setSuccess(true);
      setTimeout(() => {
        onVerify();
      }, 500);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to verify OTP. Please try again.";
      setError(errorMessage);
      
      // Trigger shake animation
      setShowShake(true);
      setTimeout(() => setShowShake(false), 500);
      
      // Clear OTP on error (but keep focus)
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
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
      <div className={`flex justify-center gap-2 transition-all duration-300 ${showShake ? "animate-shake" : ""}`}>
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
            className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              error && errorType === "invalid"
                ? "border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                : error && errorType === "expired"
                ? "border-orange-500 bg-orange-50 focus:border-orange-600"
                : error
                ? "border-red-300 bg-red-50 focus:border-red-500"
                : "border-gray-200 bg-white focus:border-red-600 focus:ring-2 focus:ring-red-100"
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`rounded-xl p-4 border-2 transition-all duration-300 ${
          errorType === "expired"
            ? "bg-orange-50 border-orange-200"
            : errorType === "attempts"
            ? "bg-red-100 border-red-300"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`shrink-0 mt-0.5 ${
              errorType === "expired" ? "text-orange-600" : "text-red-600"
            }`}>
              <AlertCircle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold mb-1 ${
                errorType === "expired" ? "text-orange-800" : "text-red-800"
              }`}>
                {errorType === "expired"
                  ? "Code Expired"
                  : errorType === "attempts"
                  ? "Too Many Attempts"
                  : errorType === "invalid"
                  ? "Incorrect Code"
                  : "Verification Failed"}
              </p>
              <p className={`text-sm leading-relaxed ${
                errorType === "expired" ? "text-orange-700" : "text-red-700"
              }`}>
                {error}
              </p>
              {errorType === "invalid" && attemptsRemaining !== null && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining before code expires
                </p>
              )}
              {errorType === "expired" && (
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="mt-3 text-sm font-semibold text-orange-700 hover:text-orange-800 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Request a new code
                </button>
              )}
              {errorType === "attempts" && (
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800 underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Get a new verification code
                </button>
              )}
            </div>
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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-600 text-center font-medium mb-1">
          Didn't receive the code?
        </p>
        <ul className="text-xs text-gray-500 space-y-1 text-center">
          <li>• Check your spam or junk folder</li>
          <li>• Verify the email address is correct</li>
          <li>• Wait a moment and try resending</li>
        </ul>
      </div>
    </div>
  );
}

