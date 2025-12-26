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
    customerDiscount: v.number(),
    distributorDiscount: v.number(),
    stock: v.optional(v.number()),
    quantity: v.optional(v.number()), // Pack quantity (1 for solo, 6 for pack of 6, 8 for pack of 8, etc.)

    storageId: v.optional(v.id("_storage")), // Legacy: single image (for backward compatibility)
    storageIds: v.optional(v.array(v.id("_storage"))), // Multiple images

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

    // color-based product
    colors: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(),
        })
      )
    ),

    // subproducts-based product
    subproducts: v.optional(
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

    // normalize sizes, colors, and subproducts
    const product = {
      ...args,
      name,
      sizes:
        Array.isArray(args.sizes) && args.sizes.length > 0
          ? args.sizes
          : undefined,
      colors:
        Array.isArray(args.colors) && args.colors.length > 0
          ? args.colors
          : undefined,
      subproducts:
        Array.isArray(args.subproducts) && args.subproducts.length > 0
          ? args.subproducts
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
    customerDiscount: v.number(),
    distributorDiscount: v.number(),
    stock: v.optional(v.number()),
    quantity: v.optional(v.number()), // Pack quantity (1 for solo, 6 for pack of 6, 8 for pack of 8, etc.)

    storageId: v.optional(v.id("_storage")), // Legacy: single image (for backward compatibility)
    storageIds: v.optional(v.array(v.id("_storage"))), // Multiple images
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

    colors: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(),
        })
      )
    ),

    subproducts: v.optional(
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
      colors:
        Array.isArray(updates.colors) && updates.colors.length > 0
          ? updates.colors
          : undefined,
      subproducts:
        Array.isArray(updates.subproducts) && updates.subproducts.length > 0
          ? updates.subproducts
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
      products.map(async (p) => {
        // Handle multiple images (new) or single image (legacy)
        const imageUrls = p.storageIds && p.storageIds.length > 0
          ? await Promise.all(p.storageIds.map(id => ctx.storage.getUrl(id)))
          : p.storageId
          ? [await ctx.storage.getUrl(p.storageId)]
          : [];
        
        return {
          ...p,
          imageUrl: imageUrls[0] || null, // First image for backward compatibility
          imageUrls, // All images
        };
      })
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

    // Handle multiple images (new) or single image (legacy)
    const imageUrls = product.storageIds && product.storageIds.length > 0
      ? await Promise.all(product.storageIds.map(id => ctx.storage.getUrl(id)))
      : product.storageId
      ? [await ctx.storage.getUrl(product.storageId)]
      : [];
    
    return { 
      ...product, 
      imageUrl: imageUrls[0] || null, // First image for backward compatibility
      imageUrls, // All images
    };
  },
});

/* =====================================================
   GET SCOPED PRODUCT (ROLE-BASED PRICING)
===================================================== */
export const getScopedProduct = query({
  args: {
    productId: v.id("products"),
    userId: v.optional(v.string()), // Firebase UID
  },
  handler: async (ctx, { productId, userId }) => {
    const product = await ctx.db.get(productId);
    if (!product) return null;

    // Handle multiple images (new) or single image (legacy)
    const imageUrls = product.storageIds && product.storageIds.length > 0
      ? await Promise.all(product.storageIds.map(id => ctx.storage.getUrl(id)))
      : product.storageId
      ? [await ctx.storage.getUrl(product.storageId)]
      : [];
    const imageUrl = imageUrls[0] || null; // First image for backward compatibility

    // Helper function to calculate price from base price and discount
    const calculatePrice = (basePrice: number, discountPercent: number): number => {
      if (discountPercent <= 0) return basePrice;
      return Math.round(basePrice - (basePrice * discountPercent) / 100);
    };

    const basePrice = product.price ?? 0;
    const customerPrice = calculatePrice(basePrice, product.customerDiscount ?? 0);
    const retailerPrice = calculatePrice(basePrice, product.distributorDiscount ?? 0);

    // If no user ID provided, return customer pricing
    if (!userId) {
      return {
        ...product,
        imageUrl, // First image for backward compatibility
        imageUrls, // All images
        pricing: {
          type: "customer",
          price: customerPrice,
          basePrice,
          sizes:
            product.sizes?.map((s) => {
              const sizeBasePrice = s.price ?? 0;
              return {
                ...s,
                price: calculatePrice(sizeBasePrice, product.customerDiscount ?? 0),
                basePrice: sizeBasePrice,
              };
            }) ?? [],
          colors:
            product.colors?.map((c) => {
              const colorBasePrice = c.price ?? 0;
              return {
                ...c,
                price: calculatePrice(colorBasePrice, product.customerDiscount ?? 0),
                basePrice: colorBasePrice,
              };
            }) ?? [],
          subproducts:
            product.subproducts?.map((sp) => {
              const subproductBasePrice = sp.price ?? 0;
              return {
                ...sp,
                price: calculatePrice(subproductBasePrice, product.customerDiscount ?? 0),
                basePrice: subproductBasePrice,
              };
            }) ?? [],
        },
      };
    }

    // Get user from Convex
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      // User not found, return customer pricing
      return {
        ...product,
        imageUrl, // First image for backward compatibility
        imageUrls, // All images
        pricing: {
          type: "customer",
          price: customerPrice,
          basePrice,
          sizes:
            product.sizes?.map((s) => {
              const sizeBasePrice = s.price ?? 0;
              return {
                ...s,
                price: calculatePrice(sizeBasePrice, product.customerDiscount ?? 0),
                basePrice: sizeBasePrice,
              };
            }) ?? [],
          colors:
            product.colors?.map((c) => {
              const colorBasePrice = c.price ?? 0;
              return {
                ...c,
                price: calculatePrice(colorBasePrice, product.customerDiscount ?? 0),
                basePrice: colorBasePrice,
              };
            }) ?? [],
          subproducts:
            product.subproducts?.map((sp) => {
              const subproductBasePrice = sp.price ?? 0;
              return {
                ...sp,
                price: calculatePrice(subproductBasePrice, product.customerDiscount ?? 0),
                basePrice: subproductBasePrice,
              };
            }) ?? [],
        },
      };
    }

    // Determine user role (prefer 'role' field, fallback to 'category')
    const role = user.role || (user.category === "distributor" ? "distributor" : "customer");

    // If customer, return customer pricing
    if (role !== "distributor") {
      return {
        ...product,
        imageUrl, // First image for backward compatibility
        imageUrls, // All images
        pricing: {
          type: "customer",
          price: customerPrice,
          basePrice,
          sizes:
            product.sizes?.map((s) => {
              const sizeBasePrice = s.price ?? 0;
              return {
                ...s,
                price: calculatePrice(sizeBasePrice, product.customerDiscount ?? 0),
                basePrice: sizeBasePrice,
              };
            }) ?? [],
          colors:
            product.colors?.map((c) => {
              const colorBasePrice = c.price ?? 0;
              return {
                ...c,
                price: calculatePrice(colorBasePrice, product.customerDiscount ?? 0),
                basePrice: colorBasePrice,
              };
            }) ?? [],
          subproducts:
            product.subproducts?.map((sp) => {
              const subproductBasePrice = sp.price ?? 0;
              return {
                ...sp,
                price: calculatePrice(subproductBasePrice, product.customerDiscount ?? 0),
                basePrice: subproductBasePrice,
              };
            }) ?? [],
        },
      };
    }

    // User is a distributor - return retailer pricing
    return {
      ...product,
      imageUrl, // First image for backward compatibility
      imageUrls, // All images
      pricing: {
        type: "retailer",
        price: retailerPrice,
        basePrice,
        customerPrice, // Include for reference
        sizes:
          product.sizes?.map((s) => {
            const sizeBasePrice = s.price ?? 0;
            return {
              ...s,
              price: calculatePrice(sizeBasePrice, product.distributorDiscount ?? 0),
              basePrice: sizeBasePrice,
            };
          }) ?? [],
        colors:
          product.colors?.map((c) => {
            const colorBasePrice = c.price ?? 0;
            return {
              ...c,
              price: calculatePrice(colorBasePrice, product.distributorDiscount ?? 0),
              basePrice: colorBasePrice,
            };
          }) ?? [],
        subproducts:
          product.subproducts?.map((sp) => {
            const subproductBasePrice = sp.price ?? 0;
            return {
              ...sp,
              price: calculatePrice(subproductBasePrice, product.distributorDiscount ?? 0),
              basePrice: subproductBasePrice,
            };
          }) ?? [],
      },
    };
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

        // Handle multiple images (new) or single image (legacy)
        const imageUrls = product.storageIds && product.storageIds.length > 0
          ? await Promise.all(product.storageIds.map(id => ctx.storage.getUrl(id)))
          : product.storageId
          ? [await ctx.storage.getUrl(product.storageId)]
          : [];
        
        return { 
          ...product, 
          imageUrl: imageUrls[0] || null, // First image for backward compatibility
          imageUrls, // All images
        };
      })
    );

    return products.filter((p) => p !== null);
  },
});