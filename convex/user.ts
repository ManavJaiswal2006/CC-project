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

// GET User by Email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Find user by email (users table has email field)
    const users = await ctx.db
      .query("users")
      .collect();
    
    // Filter by email (case-insensitive)
    return users.find(u => u.email.toLowerCase() === args.email.toLowerCase());
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
        customLabel: v.optional(v.string()),
        street: v.string(),
        city: v.string(),
        pincode: v.string(),
        state: v.string(),
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
        role: "customer", // Default role is customer
      });
    }
  },
});

/* =====================================================
   UPDATE USER ROLE (Admin only - can be extended)
===================================================== */
export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("customer"), v.literal("distributor")),
  },
  handler: async (ctx, args) => {
    // Note: Add admin check here if needed
    // For now, this is a basic implementation
    
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(existingUser._id, {
      role: args.role,
      category: args.role, // Also update legacy category field for backward compatibility
    });
  },
});