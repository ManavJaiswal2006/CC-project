import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get reviews for a product
export const getProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();

    return reviews;
  },
});

// Get user's reviews
export const getUserReviews = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Check if user has purchased product (for verified purchase badge)
export const hasPurchasedProduct = query({
  args: {
    userId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Check if any order contains this product
    for (const order of orders) {
      if (order.paymentStatus === "Paid" && order.items) {
        const items = order.items as Array<{ id?: string }>;
        if (items.some((item) => item.id === args.productId)) {
          return true;
        }
      }
    }

    return false;
  },
});

// Create review
export const createReview = mutation({
  args: {
    productId: v.id("products"),
    userId: v.string(),
    userName: v.string(),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already reviewed this product
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    // Check if user purchased the product
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    let verifiedPurchase = false;
    for (const order of orders) {
      if (order.paymentStatus === "Paid" && order.items) {
        const items = order.items as Array<{ id?: string }>;
        if (items.some((item) => item.id === args.productId)) {
          verifiedPurchase = true;
          break;
        }
      }
    }

    await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: args.userId,
      userName: args.userName,
      rating: Math.max(1, Math.min(5, args.rating)), // Clamp between 1-5
      comment: args.comment,
      verifiedPurchase,
      createdAt: Date.now(),
      helpful: 0,
    });

    return { success: true };
  },
});

// Mark review as helpful
export const markHelpful = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) return { success: false };

    await ctx.db.patch(args.reviewId, {
      helpful: review.helpful + 1,
    });

    return { success: true };
  },
});

// Get product rating summary
export const getProductRatingSummary = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_productId", (q) => q.eq("productId", args.productId))
      .collect();

    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = total / reviews.length;

    const distribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      average: Math.round(average * 10) / 10,
      count: reviews.length,
      distribution,
    };
  },
});

