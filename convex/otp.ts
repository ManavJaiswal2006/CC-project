import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * CREATE OTP
 * Creates a new OTP for email verification
 */
export const createOTP = mutation({
  args: {
    email: v.string(),
    purpose: v.union(v.literal("signup"), v.literal("login")),
  },
  handler: async (ctx, args) => {
    const { email, purpose } = args;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Generate OTP
    const otp = generateOTP();
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    // Invalidate any existing unverified OTPs for this email and purpose
    const existingOTPs = await ctx.db
      .query("otps")
      .withIndex("by_email_purpose", (q) => q.eq("email", email).eq("purpose", purpose))
      .collect();

    for (const existingOTP of existingOTPs) {
      if (!existingOTP.verified) {
        await ctx.db.patch(existingOTP._id, { verified: true }); // Mark as used
      }
    }

    // Create new OTP
    const otpId = await ctx.db.insert("otps", {
      email: email.toLowerCase(),
      otp,
      purpose,
      expiresAt,
      verified: false,
      attempts: 0,
      createdAt: now,
    });

    return { otpId, otp };
  },
});

/**
 * VERIFY OTP
 * Verifies an OTP for email verification
 */
export const verifyOTP = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
    purpose: v.union(v.literal("signup"), v.literal("login")),
  },
  handler: async (ctx, args) => {
    const { email, otp, purpose } = args;

    // Find the most recent unverified OTP for this email and purpose
    const otps = await ctx.db
      .query("otps")
      .withIndex("by_email_purpose", (q) => q.eq("email", email.toLowerCase()).eq("purpose", purpose))
      .order("desc")
      .collect();

    const activeOTP = otps.find((o) => !o.verified && o.expiresAt > Date.now());

    if (!activeOTP) {
      throw new Error("No valid OTP found. Please request a new one.");
    }

    // Check if OTP matches
    if (activeOTP.otp !== otp) {
      // Increment attempts
      await ctx.db.patch(activeOTP._id, {
        attempts: activeOTP.attempts + 1,
      });

      // If too many attempts, invalidate OTP
      if (activeOTP.attempts + 1 >= 5) {
        await ctx.db.patch(activeOTP._id, { verified: true });
        throw new Error("Too many failed attempts. Please request a new OTP.");
      }

      throw new Error("Invalid OTP. Please try again.");
    }

    // Mark OTP as verified
    await ctx.db.patch(activeOTP._id, { verified: true });

    return { success: true };
  },
});

/**
 * GET OTP STATUS
 * Check if there's an active OTP for an email
 */
export const getOTPStatus = query({
  args: {
    email: v.string(),
    purpose: v.union(v.literal("signup"), v.literal("login")),
  },
  handler: async (ctx, args) => {
    const { email, purpose } = args;

    const otps = await ctx.db
      .query("otps")
      .withIndex("by_email_purpose", (q) => q.eq("email", email.toLowerCase()).eq("purpose", purpose))
      .order("desc")
      .collect();

    const activeOTP = otps.find((o) => !o.verified && o.expiresAt > Date.now());

    if (!activeOTP) {
      return { hasActiveOTP: false };
    }

    const timeRemaining = Math.max(0, activeOTP.expiresAt - Date.now());
    const minutesRemaining = Math.ceil(timeRemaining / 60000);

    return {
      hasActiveOTP: true,
      minutesRemaining,
      attempts: activeOTP.attempts,
    };
  },
});

