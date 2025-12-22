import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

/* =====================================================
   ADMIN CHECK (HARDENED)
===================================================== */
async function checkAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) {
    throw new Error("Unauthenticated");
  }

  // ⚠️ Move this to env later if needed
  const ADMIN_EMAILS = ["2858.manav@gmail.com"];

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
