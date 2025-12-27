import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/* =====================================================
   REFUND REQUESTS - CUSTOMER
===================================================== */

// Create refund request (customer)
export const createRefundRequest = mutation({
  args: {
    orderId: v.string(),
    userId: v.string(),
    reason: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
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

    // Check if order is delivered
    if (order.status !== "Delivered") {
      throw new Error("Refund can only be requested for delivered orders");
    }

    // Check if order was delivered (has deliveredAt timestamp)
    if (!order.deliveredAt) {
      throw new Error("Order delivery date not found");
    }

    // Check if refund window (7 days) has passed
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const refundWindowEnd = order.deliveredAt + sevenDaysInMs;
    if (Date.now() > refundWindowEnd) {
      throw new Error("Refund window has expired. Refunds can only be requested within 7 days of delivery");
    }

    // Check if there's already a pending or approved refund request
    const existingRequest = await ctx.db
      .query("refundRequests")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "approved")
        )
      )
      .first();

    if (existingRequest) {
      throw new Error("A refund request already exists for this order");
    }

    // Create refund request
    await ctx.db.insert("refundRequests", {
      orderId: args.orderId,
      userId: args.userId,
      reason: args.reason,
      photoStorageId: args.photoStorageId,
      status: "pending",
      refundAmount: order.totalAmount, // Default to full refund
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Get refund requests for a user
export const getRefundRequests = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("refundRequests")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get refund request by orderId (for customer)
export const getRefundRequestByOrderId = query({
  args: { orderId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("refundRequests")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    return request ?? null;
  },
});

/* =====================================================
   REFUND REQUESTS - ADMIN
===================================================== */

// Get all refund requests (admin)
export const getAllRefundRequests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("refundRequests")
      .order("desc")
      .collect();
  },
});

// Get refund request by ID (admin)
export const getRefundRequestById = query({
  args: { id: v.id("refundRequests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Review refund request (admin - approve or reject)
export const reviewRefundRequest = mutation({
  args: {
    id: v.id("refundRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    adminNotes: v.optional(v.string()),
    refundAmount: v.optional(v.number()), // Can adjust refund amount
    reviewedBy: v.string(), // Admin userId
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Refund request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Refund request has already been reviewed");
    }

    // Update request status
    await ctx.db.patch(args.id, {
      status: args.action === "approve" ? "approved" : "rejected",
      reviewedAt: Date.now(),
      reviewedBy: args.reviewedBy,
      adminNotes: args.adminNotes,
      refundAmount: args.refundAmount ?? request.refundAmount,
    });

    return { success: true };
  },
});

// Mark refund as processed (after Razorpay refund is completed)
export const markRefundProcessed = mutation({
  args: {
    id: v.id("refundRequests"),
    refundId: v.string(), // Razorpay refund ID
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.id);
    if (!request) {
      throw new Error("Refund request not found");
    }

    if (request.status !== "approved") {
      throw new Error("Refund request must be approved before processing");
    }

    await ctx.db.patch(args.id, {
      status: "refunded",
      refundId: args.refundId,
      refundedAt: Date.now(),
    });

    return { success: true };
  },
});

// Generate upload URL for refund photo
export const generateRefundPhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

