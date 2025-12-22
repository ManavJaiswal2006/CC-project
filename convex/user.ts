import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// GET User Profile
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Find user by Firebase UID
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// SAVE/UPDATE User Profile (and Addresses)
export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    addresses: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        street: v.string(),
        city: v.string(),
        zip: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUser) {
      // Update
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        phone: args.phone,
        addresses: args.addresses,
      });
    } else {
      // Create new
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        name: args.name,
        phone: args.phone,
        addresses: args.addresses,
        category: "customer",
      });
    }
  },
});