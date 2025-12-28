"use client";

import React, { useState, Suspense } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth/Authlayout";
import GoogleAuthButton from "@/components/auth/GoogleAuthbutton";
import OTPVerification from "@/components/auth/OTPVerification";
import { auth } from "@/app/lib/firebase";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// 1. Separate Logic into Sub-Component
function SignUpContent() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const router = useRouter();
  const updateUser = useMutation(api.user.updateUser);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailAlreadyRegistered(false);
    
    // Validation
    if (!name.trim()) {
      return setError("Name is required.");
    }

    if (!phone.trim()) {
      return setError("Phone number is required.");
    }

    // Validate phone number (should be 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      return setError("Phone number must be 10 digits.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      // Send OTP first
      const res = await fetch("/api/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          purpose: "signup",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP. Please try again.");
      }

      // Show OTP verification screen
      setShowOTP(true);
    } catch (err: any) {
      setError(err.message || "Could not send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    setLoading(true);
    setError("");

    try {
      // Now create Firebase account (OTP already verified in component)
      const phoneDigits = phone.replace(/\D/g, "");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user profile to Convex
      try {
        await updateUser({
          userId: user.uid,
          email: email,
          name: name.trim(),
          phone: phoneDigits,
          addresses: [],
        });
      } catch (convexError) {
        console.error("Error saving user profile:", convexError);
        // Don't fail signup if Convex save fails, but log it
      }
      
      // Redirect to shop
      router.push("/shop");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use" || (err instanceof Error && err.message.includes("email-already-in-use"))) {
        setEmailAlreadyRegistered(true);
        setError("This email is already registered. Please log in instead.");
        setShowOTP(false);
      } else if (err?.code === "auth/invalid-email" || (err instanceof Error && err.message.includes("invalid-email"))) {
        setEmailAlreadyRegistered(false);
        setError("Invalid email address.");
        setShowOTP(false);
      } else if (err?.code === "auth/weak-password" || (err instanceof Error && err.message.includes("weak-password"))) {
        setEmailAlreadyRegistered(false);
        setError("Password is too weak. Please choose a stronger password.");
        setShowOTP(false);
      } else {
        setEmailAlreadyRegistered(false);
        setError(err.message || "Could not create account. Please try again.");
        setShowOTP(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show OTP verification screen
  if (showOTP) {
    return (
      <AuthLayout title="Verify Your Email" subtitle="Enter the code sent to your email">
        <OTPVerification
          email={email}
          purpose="signup"
          onVerify={handleOTPVerify}
          onCancel={() => setShowOTP(false)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Join the heritage." subtitle="Membership Registration">
      <form onSubmit={handleSignUp} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => {
              // Only allow digits and limit to 10 digits
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(value);
            }}
            className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="9876543210"
          />
          <p className="text-slate-400 text-[9px] font-light mt-1">
            10-digit phone number
          </p>
        </div>
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
            placeholder="newmember@bourgon.in"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            Choose Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-0 border-b border-slate-200 py-3 focus:border-red-600 outline-none transition-all font-light bg-transparent text-gray-900"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 text-[11px] font-bold tracking-wider uppercase mb-1">
                  {error}
                </p>
                {emailAlreadyRegistered && (
                  <p className="text-red-700 text-xs font-light mt-2">
                    If you haven't verified your email yet, you'll be prompted to do so after logging in.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {emailAlreadyRegistered && (
          <button 
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-red-700 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all"
          >
            GO TO LOGIN <ShieldCheck size={14} />
          </button>
        )}
        <button 
          type="submit"
          disabled={loading || emailAlreadyRegistered}
          className="w-full bg-red-700 text-white py-4 font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              SENDING CODE...
            </>
          ) : (
            <>
              SEND VERIFICATION CODE <ShieldCheck size={14} />
            </>
          )}
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