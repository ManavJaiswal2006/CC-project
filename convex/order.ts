import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/* =====================================================
   CUSTOMER QUERIES
===================================================== */

// Get all orders for a user
export const getOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get a single order by public orderId (for customer view / tracking)
export const getByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();

    return order ?? null;
  },
});

/* =====================================================
   ADMIN QUERIES
===================================================== */

// Get all orders (admin overview)
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    // Newest first by creation time
    const orders = await ctx.db.query("orders").order("desc").collect();
    return orders;
  },
});

// Get order by database id (for admin detail page)
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    return order ?? null;
  },
});

/* =====================================================
   MUTATIONS
===================================================== */

// CREATE Order (call this from checkout flow)
export const createOrder = mutation({
  args: {
    userId: v.string(),
    customerEmail: v.optional(v.string()),
    shippingName: v.string(),
    shippingAddress: v.string(),
    items: v.any(), // cart snapshot
    total: v.number(),
    paymentMethod: v.string(),
    promoCode: v.optional(v.string()),
    promoDiscount: v.optional(v.number()),
    razorpayPaymentId: v.optional(v.string()),
    razorpayOrderId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Increment promo usage if promo code was used
    if (args.promoCode) {
      const promo = await ctx.db
        .query("promos")
        .withIndex("by_code", (q) => q.eq("code", args.promoCode!.toUpperCase()))
        .first();
      
      if (promo) {
        await ctx.db.patch(promo._id, {
          usageCount: promo.usageCount + 1,
        });
      }
    }

    // Set payment status based on payment method
    const paymentStatus = 
      args.paymentMethod === "razorpay" || 
      args.paymentMethod === "online" ||
      args.paymentMethod === "card" || 
      args.paymentMethod === "upi"
        ? "Paid" // Online payments (Razorpay) are verified before order creation
        : "Pending"; // COD or other methods

    const docId: Id<"orders"> = await ctx.db.insert("orders", {
      userId: args.userId,
      orderId,
      items: args.items,
      totalAmount: args.total,
      status: paymentStatus === "Paid" ? "Confirmed" : "Awaiting Admin Confirmation",
      paymentStatus,
      trackingNumber: paymentStatus === "Paid" ? "Processing" : "Awaiting payment",
      // shipping snapshot
      shippingName: args.shippingName,
      shippingAddress: args.shippingAddress,
      customerEmail: args.customerEmail,
      paymentMethod: args.paymentMethod,
      promoCode: args.promoCode,
      promoDiscount: args.promoDiscount,
      razorpayPaymentId: args.razorpayPaymentId,
      razorpayOrderId: args.razorpayOrderId,
    });

    return { orderId, id: docId };
  },
});

// Get order status history
export const getStatusHistory = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderStatusHistory")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .collect();
  },
});

// Update order status / tracking (admin)
export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) return;

    // Track status change in history
    if (existing.status !== args.status || existing.paymentStatus !== args.paymentStatus) {
      await ctx.db.insert("orderStatusHistory", {
        orderId: existing.orderId,
        status: args.status,
        message: args.paymentStatus 
          ? `Status: ${args.status}, Payment: ${args.paymentStatus}`
          : `Status updated to: ${args.status}`,
        timestamp: Date.now(),
        updatedBy: args.updatedBy,
      });
    }

    // If status is "Delivered", set deliveredAt timestamp (for refund window)
    if (args.status === "Delivered" && existing.status !== "Delivered") {
      await ctx.db.patch(args.id, {
        deliveredAt: Date.now(),
      });
    }

    // If marking as paid for the first time, decrement product stock
    if (
      existing.paymentStatus !== "Paid" &&
      args.paymentStatus === "Paid"
    ) {
      const items = (existing.items ?? []) as Array<{
        id?: Id<"products">;
        quantity?: number;
      }>;

      for (const item of items) {
        if (!item.id || !item.quantity) continue;
        const product = await ctx.db.get(item.id);
        if (!product) continue;

        const currentStock = product.stock ?? 0;
        const nextStock = Math.max(0, currentStock - item.quantity);

        await ctx.db.patch(item.id, {
          stock: nextStock,
          soldOut: product.soldOut || nextStock <= 0,
        });
      }
    }

    const patch: Partial<{
      status: string;
      trackingNumber?: string;
      trackingUrl?: string;
      paymentStatus?: string;
    }> = {
      status: args.status,
    };

    if (args.trackingNumber !== undefined) {
      patch.trackingNumber = args.trackingNumber;
    }
    if (args.trackingUrl !== undefined) {
      patch.trackingUrl = args.trackingUrl;
    }
    if (args.paymentStatus !== undefined) {
      patch.paymentStatus = args.paymentStatus;
    }

    await ctx.db.patch(args.id, patch);
  },
});

// Create order cancellation/return request
export const createOrderRequest = mutation({
  args: {
    orderId: v.string(),
    userId: v.string(),
    type: v.string(), // "cancellation" | "return"
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify order belongs to user
    const order = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();
    
    if (!order || order.userId !== args.userId) {
      throw new Error("Order not found or unauthorized");
    }

    await ctx.db.insert("orderRequests", {
      orderId: args.orderId,
      userId: args.userId,
      type: args.type,
      reason: args.reason,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Get order requests for a user
export const getOrderRequests = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get order requests by orderId (for admin)
export const getOrderRequestsByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orderRequests")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .order("desc")
      .collect();
  },
});

// Approve or reject order cancellation/return request (admin)
export const processOrderRequest = mutation({
  args: {
    requestId: v.id("orderRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: args.action === "approve" ? "approved" : "rejected",
      resolvedAt: Date.now(),
      adminNotes: args.adminNotes,
    });

    // If approved and it's a cancellation, update the order status
    if (args.action === "approve" && request.type === "cancellation") {
      const order = await ctx.db
        .query("orders")
        .filter((q) => q.eq(q.field("orderId"), request.orderId))
        .first();

      if (order) {
        await ctx.db.patch(order._id, {
          status: "Cancelled",
        });

        // Track status change in history
        await ctx.db.insert("orderStatusHistory", {
          orderId: order.orderId,
          status: "Cancelled",
          message: `Order cancelled. Reason: ${request.reason}`,
          timestamp: Date.now(),
          updatedBy: "admin",
        });
      }
    }

    return { success: true };
  },
});