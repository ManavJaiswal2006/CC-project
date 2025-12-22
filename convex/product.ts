import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ================= ADMIN CHECK ================= */
async function checkAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const ADMIN_EMAILS = ["2858.manav@gmail.com"];
  if (!ADMIN_EMAILS.includes(identity.email)) {
    throw new Error("Unauthorized");
  }
}

/* ================= IMAGE UPLOAD ================= */
export const generateUploadUrl = mutation(async (ctx) => {
  await checkAdmin(ctx);
  return await ctx.storage.generateUploadUrl();
});

/* ================= CREATE PRODUCT ================= */
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
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

    // prevent duplicate product names
    const existing = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      throw new Error("Product already exists");
    }

    // safety: normalize empty sizes
    const product = {
      ...args,
      sizes:
        Array.isArray(args.sizes) && args.sizes.length > 0
          ? args.sizes
          : undefined,
    };

    return await ctx.db.insert("products", product);
  },
});

/* ================= UPDATE PRODUCT ================= */
export const updateProduct = mutation({
  args: {
    id: v.id("products"),

    name: v.string(),
    description: v.string(),
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
      sizes:
        Array.isArray(updates.sizes) && updates.sizes.length > 0
          ? updates.sizes
          : undefined,
    };

    await ctx.db.patch(id, normalized);
  },
});

/* ================= DELETE PRODUCT ================= */
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

/* ================= GET ALL PRODUCTS ================= */
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

/* ================= GET SINGLE PRODUCT ================= */
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    const imageUrl = product.storageId
      ? await ctx.storage.getUrl(product.storageId)
      : null;

    return { ...product, imageUrl };
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();

    // Extract unique categories
    const categories = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );

    // Sort for clean UI
    categories.sort((a, b) => a.localeCompare(b));

    return categories;
  },
});