import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/* =====================================================
   ADMIN CHECK
===================================================== */
type AdminCtx = MutationCtx | QueryCtx;

async function checkAdmin(ctx: AdminCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) {
    throw new Error("Unauthenticated");
  }

  // Get admin emails from Convex environment variable
  // Set this in Convex Dashboard: Settings > Environment Variables
  // Format: "email1@example.com,email2@example.com"
  // Note: In Convex, use ctx.runMutation/runQuery to access env vars if needed
  // For now, using process.env (works if set in deployment environment)
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  const ADMIN_EMAILS = adminEmailsEnv
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  // Fallback to hardcoded email if env not set (for backward compatibility)
  if (ADMIN_EMAILS.length === 0) {
    ADMIN_EMAILS.push("2858.manav@gmail.com");
  }

  if (!ADMIN_EMAILS.includes(identity.email)) {
    throw new Error("Unauthorized");
  }

  return identity;
}

/* =====================================================
   QUERIES
===================================================== */

// Validate a promo code (public query)
export const validatePromo = query({
  args: {
    code: v.string(),
    orderAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const promo = await ctx.db
      .query("promos")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!promo) {
      return { valid: false, error: "Invalid promo code" };
    }

    // Check if active
    if (!promo.active) {
      return { valid: false, error: "This promo code is no longer active" };
    }

    // Check expiration
    if (promo.expiresAt && promo.expiresAt < Date.now()) {
      return { valid: false, error: "This promo code has expired" };
    }

    // Check usage limit
    if (promo.maxUsage && promo.usageCount >= promo.maxUsage) {
      return { valid: false, error: "This promo code has reached its usage limit" };
    }

    // Check minimum order amount
    if (promo.minOrderAmount && args.orderAmount < promo.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order amount of ₹${promo.minOrderAmount} required`,
      };
    }

    // Calculate discount
    const discountPercentage = promo.discount;
    let discountAmount = (args.orderAmount * discountPercentage) / 100;

    // Apply max discount cap if set
    if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount;
    }

    return {
      valid: true,
      promo: {
        code: promo.code,
        discount: discountPercentage,
        discountAmount: Math.round(discountAmount),
        description: promo.description,
      },
    };
  },
});

// Get all promos (admin)
export const getAllPromos = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    return await ctx.db.query("promos").order("desc").collect();
  },
});

// Get promo by id (admin)
export const getPromoById = query({
  args: { id: v.id("promos") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/* =====================================================
   MUTATIONS
===================================================== */

// Create promo code (admin)
export const createPromo = mutation({
  args: {
    code: v.string(),
    discount: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    maxUsage: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const code = args.code.toUpperCase().trim();

    // Check if code already exists
    const existing = await ctx.db
      .query("promos")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (existing) {
      throw new Error("Promo code already exists");
    }

    // Validate discount
    if (args.discount < 0 || args.discount > 100) {
      throw new Error("Discount must be between 0 and 100");
    }

    return await ctx.db.insert("promos", {
      code,
      discount: args.discount,
      active: true,
      minOrderAmount: args.minOrderAmount,
      maxDiscount: args.maxDiscount,
      expiresAt: args.expiresAt,
      maxUsage: args.maxUsage,
      usageCount: 0,
      description: args.description,
    });
  },
});

// Update promo code (admin)
export const updatePromo = mutation({
  args: {
    id: v.id("promos"),
    code: v.optional(v.string()),
    discount: v.optional(v.number()),
    active: v.optional(v.boolean()),
    minOrderAmount: v.optional(v.number()),
    maxDiscount: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    maxUsage: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Promo code not found");
    }

    const updates: Partial<{
      code: string;
      discount: number;
      active: boolean;
      minOrderAmount?: number;
      maxDiscount?: number;
      expiresAt?: number;
      maxUsage?: number;
      description?: string;
    }> = {};

    if (args.code !== undefined) {
      const code = args.code.toUpperCase().trim();
      // Check if new code conflicts with existing
      if (code !== existing.code) {
        const conflict = await ctx.db
          .query("promos")
          .withIndex("by_code", (q) => q.eq("code", code))
          .first();
        if (conflict) {
          throw new Error("Promo code already exists");
        }
      }
      updates.code = code;
    }

    if (args.discount !== undefined) {
      if (args.discount < 0 || args.discount > 100) {
        throw new Error("Discount must be between 0 and 100");
      }
      updates.discount = args.discount;
    }

    if (args.active !== undefined) updates.active = args.active;
    if (args.minOrderAmount !== undefined) updates.minOrderAmount = args.minOrderAmount;
    if (args.maxDiscount !== undefined) updates.maxDiscount = args.maxDiscount;
    if (args.expiresAt !== undefined) updates.expiresAt = args.expiresAt;
    if (args.maxUsage !== undefined) updates.maxUsage = args.maxUsage;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.id, updates);
  },
});

// Increment promo usage (called when order is placed)
export const incrementPromoUsage = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const promo = await ctx.db
      .query("promos")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (promo) {
      await ctx.db.patch(promo._id, {
        usageCount: promo.usageCount + 1,
      });
    }
  },
});

// Delete promo code (admin)
export const deletePromo = mutation({
  args: { id: v.id("promos") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

