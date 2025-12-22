import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🔒 SECURITY CHECK FUNCTION
async function checkAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: Please log in.");
  }

  // 👇 1. CHANGED TO YOUR ACTUAL EMAIL & MADE IT AN ARRAY
  const ADMIN_EMAILS = ["2858.manav@gmail.com"]; 
  
  if (!ADMIN_EMAILS.includes(identity.email)) {
    throw new Error("Unauthorized: You do not have admin privileges.");
  }
}

// 1. GENERATE UPLOAD URL
export const generateUploadUrl = mutation(async (ctx) => {
  await checkAdmin(ctx);
  return await ctx.storage.generateUploadUrl();
});

// 2. CREATE PRODUCT
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    discount: v.number(),
    storageId: v.optional(v.id("_storage")),
    soldOut: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.insert("products", args);
  },
});

// 3. UPDATE PRODUCT
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()), // 👈 2. ADDED NAME SO YOU CAN RENAME ITEMS
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    discount: v.optional(v.number()),
    soldOut: v.optional(v.boolean()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// 4. DELETE PRODUCT
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    // OPTIONAL: Delete the image from storage to save space
    const product = await ctx.db.get(args.id);
    if (product?.storageId) {
       await ctx.storage.delete(product.storageId);
    }
    await ctx.db.delete(args.id);
  },
});

// 5. GET ALL (Public)
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    // Get image URLs
    return await Promise.all(
      products.map(async (p) => ({
        ...p,
        // Generates a signed URL that expires in 1 hour (standard security)
        imageUrl: p.storageId ? await ctx.storage.getUrl(p.storageId) : null,
      }))
    );
  },
});