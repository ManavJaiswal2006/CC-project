import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/* =====================================================
   ADMIN CHECK (HARDENED)
===================================================== */
import type { MutationCtx, QueryCtx } from "./_generated/server";

type AdminCtx = MutationCtx | QueryCtx;

async function checkAdmin(ctx: AdminCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) {
    throw new Error("Unauthenticated");
  }

  // Get admin emails from environment variable
  // Format: "email1@example.com,email2@example.com"
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
   IMAGE UPLOAD
===================================================== */
export const generateUploadUrl = mutation(async (ctx) => {
  await checkAdmin(ctx);
  return await ctx.storage.generateUploadUrl();
});

/* =====================================================
   CREATE PRODUCT
===================================================== */
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
    category: v.string(),
    soldOut: v.boolean(),
    discount: v.number(),
    stock: v.optional(v.number()),

    storageId: v.optional(v.id("_storage")),

    // single-price product
    price: v.optional(v.number()),

    // size-based product
    sizes: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    // ❗ normalize name for duplicate check
    const name = args.name.trim();

    const existing = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("name"), name))
      .first();

    if (existing) {
      throw new Error("Product already exists");
    }

    // normalize sizes
    const product = {
      ...args,
      name,
      sizes:
        Array.isArray(args.sizes) && args.sizes.length > 0
          ? args.sizes
          : undefined,
    };

    return await ctx.db.insert("products", product);
  },
});

/* =====================================================
   UPDATE PRODUCT
===================================================== */
export const updateProduct = mutation({
  args: {
    id: v.id("products"),

    name: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
    category: v.string(),
    soldOut: v.boolean(),
    discount: v.number(),
    stock: v.optional(v.number()),

    storageId: v.optional(v.id("_storage")),
    price: v.optional(v.number()),

    sizes: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(),
        })
      )
    ),
  },
  handler: async (ctx, { id, ...updates }) => {
    await checkAdmin(ctx);

    const normalized = {
      ...updates,
      name: updates.name.trim(),
      sizes:
        Array.isArray(updates.sizes) && updates.sizes.length > 0
          ? updates.sizes
          : undefined,
    };

    await ctx.db.patch(id, normalized);
  },
});

/* =====================================================
   DELETE PRODUCT
===================================================== */
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await checkAdmin(ctx);
    await ctx.db.delete(id);
  },
});

/* =====================================================
   GET ALL PRODUCTS (ADMIN / SHOP LIST)
===================================================== */
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    return await Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: p.storageId
          ? await ctx.storage.getUrl(p.storageId)
          : null,
      }))
    );
  },
});

/* =====================================================
   GET SINGLE PRODUCT (PUBLIC)
===================================================== */
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;

    const imageUrl = product.storageId
      ? await ctx.storage.getUrl(product.storageId)
      : null;

    return { ...product, imageUrl };
  },
});

/* =====================================================
   SEARCH PRODUCTS (🔥 NEW 🔥)
===================================================== */
export const search = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { q, limit = 6 }) => {
    const text = q.trim();
    if (text.length < 2) return [];

    const products = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (qIndex) =>
        qIndex.search("name", text)
      )
      .filter((qf) => qf.eq(qf.field("soldOut"), false))
      .take(limit);

    return products.map((p: Doc<"products">) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price ?? null,
      hasSizes: Boolean(p.sizes?.length),
    }));
  },
});

/* =====================================================
   GET UNIQUE CATEGORIES
===================================================== */
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return categories;
  },
});

/* =====================================================
   GET PRODUCTS BY IDs (for recently viewed, etc.)
===================================================== */
export const getProductsByIds = query({
  args: { productIds: v.array(v.id("products")) },
  handler: async (ctx, { productIds }) => {
    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await ctx.db.get(id);
        if (!product) return null;

        const imageUrl = product.storageId
          ? await ctx.storage.getUrl(product.storageId)
          : null;

        return { ...product, imageUrl };
      })
    );

    return products.filter((p) => p !== null);
  },
});