import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// GET Orders
export const getOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc") // Newest first
      .collect();
  },
});

// CREATE Order (Call this after payment success)
export const createOrder = mutation({
  args: {
    userId: v.string(),
    items: v.any(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    await ctx.db.insert("orders", {
      userId: args.userId,
      orderId: orderId,
      items: args.items,
      totalAmount: args.total,
      status: "Processing",
      trackingNumber: "Waiting for courier...",
    });
    return orderId;
  },
});