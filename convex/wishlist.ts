import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user's wishlist
export const getWishlist = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const wishlistItems = await ctx.db
      .query("wishlist")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Fetch product details for each wishlist item
    const products = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;

        const imageUrl = product.storageId
          ? await ctx.storage.getUrl(product.storageId)
          : null;

        return {
          ...item,
          product: {
            ...product,
            imageUrl,
          },
        };
      })
    );

    return products.filter((p) => p !== null);
  },
});

// Add to wishlist
export const addToWishlist = mutation({
  args: {
    userId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Check if already in wishlist
    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_userId_productId", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      return { success: false, message: "Already in wishlist" };
    }

    await ctx.db.insert("wishlist", {
      userId: args.userId,
      productId: args.productId,
      addedAt: Date.now(),
    });

    return { success: true };
  },
});

// Remove from wishlist
export const removeFromWishlist = mutation({
  args: {
    userId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_userId_productId", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (item) {
      await ctx.db.delete(item._id);
      return { success: true };
    }

    return { success: false, message: "Item not found in wishlist" };
  },
});

// Check if product is in wishlist
export const isInWishlist = query({
  args: {
    userId: v.string(),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_userId_productId", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    return !!item;
  },
});

