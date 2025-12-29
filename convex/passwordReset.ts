import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate a secure random token for password reset
 * Uses a combination of timestamp and random numbers for uniqueness
 */
function generateResetToken(): string {
  // Generate a secure token using timestamp + random values
  const timestamp = Date.now().toString(36);
  const randomPart1 = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  const randomPart3 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart1}-${randomPart2}-${randomPart3}`;
}

/**
 * CREATE PASSWORD RESET TOKEN
 * Creates a new password reset token for an email
 */
export const createPasswordResetToken = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = args;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check for recent token creation (prevent duplicate emails within 2 minutes)
    const recentTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .collect();

    const now = Date.now();
    const twoMinutesAgo = now - 2 * 60 * 1000; // 2 minutes ago
    
    // Check if there's a recent unused token (created within last 2 minutes)
    const recentUnusedToken = recentTokens.find(
      (t) => !t.used && t.createdAt > twoMinutesAgo
    );

    if (recentUnusedToken) {
      // Return existing token instead of creating a new one
      return { tokenId: recentUnusedToken._id, token: recentUnusedToken.token };
    }

    // Generate token
    const token = generateResetToken();
    const expiresAt = now + 60 * 60 * 1000; // 1 hour

    // Invalidate any existing unused tokens for this email (older than 2 minutes)
    for (const existingToken of recentTokens) {
      if (!existingToken.used && existingToken.createdAt <= twoMinutesAgo) {
        await ctx.db.patch(existingToken._id, { used: true }); // Mark as used
      }
    }

    // Create new token
    const tokenId = await ctx.db.insert("passwordResetTokens", {
      email: email.toLowerCase(),
      token,
      expiresAt,
      used: false,
      createdAt: now,
    });

    return { tokenId, token };
  },
});

/**
 * VERIFY PASSWORD RESET TOKEN
 * Verifies a password reset token (does NOT mark as used - that happens after password is updated)
 */
export const verifyPasswordResetToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const { token } = args;

    // Find the token
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!resetToken) {
      throw new Error("Invalid or expired reset link. Please request a new one.");
    }

    // Check if token has been used
    if (resetToken.used) {
      throw new Error("This reset link has already been used. Please request a new one.");
    }

    // Check if token has expired
    if (resetToken.expiresAt < Date.now()) {
      await ctx.db.patch(resetToken._id, { used: true }); // Mark expired tokens as used
      throw new Error("This reset link has expired. Please request a new one.");
    }

    // DON'T mark as used here - only mark after password is successfully updated
    // Return token info for verification
    return {
      email: resetToken.email,
      success: true,
      tokenId: resetToken._id,
    };
  },
});

/**
 * MARK TOKEN AS USED
 * Marks a password reset token as used after successful password update
 */
export const markTokenAsUsed = mutation({
  args: {
    tokenId: v.id("passwordResetTokens"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, { used: true });
    return { success: true };
  },
});

/**
 * GET TOKEN STATUS
 * Check if there's a valid reset token for an email
 */
export const getTokenStatus = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = args;

    const tokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .order("desc")
      .collect();

    const activeToken = tokens.find((t) => !t.used && t.expiresAt > Date.now());

    if (!activeToken) {
      return { hasActiveToken: false };
    }

    const timeRemaining = Math.max(0, activeToken.expiresAt - Date.now());
    const minutesRemaining = Math.ceil(timeRemaining / 60000);

    return {
      hasActiveToken: true,
      minutesRemaining,
    };
  },
});

