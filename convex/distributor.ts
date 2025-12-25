import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* =====================================================
   GET DISTRIBUTOR PROFILE
===================================================== */
export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("distributor_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/* =====================================================
   CREATE/UPDATE DISTRIBUTOR PROFILE
===================================================== */
export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    gstin: v.optional(v.string()),
    creditLimit: v.number(),
    companyName: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("distributor_profiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        gstin: args.gstin,
        creditLimit: args.creditLimit,
        companyName: args.companyName,
        contactPerson: args.contactPerson,
        businessAddress: args.businessAddress,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("distributor_profiles", {
        userId: args.userId,
        gstin: args.gstin || undefined,
        creditLimit: args.creditLimit,
        companyName: args.companyName,
        contactPerson: args.contactPerson,
        businessAddress: args.businessAddress,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

