import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* ================= USERS ================= */
  users: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    category: v.string(),
    addresses: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        customLabel: v.optional(v.string()),
        street: v.string(),
        city: v.string(),
        pincode: v.string(),
        state: v.string(),
      })
    ),
  }).index("by_userId", ["userId"]),

  /* ================= ORDERS ================= */
  orders: defineTable({
    userId: v.string(),
    orderId: v.string(),
    items: v.any(), // cart snapshot
    totalAmount: v.number(),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
    shippingName: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    promoCode: v.optional(v.string()), // Promo code used
    promoDiscount: v.optional(v.number()), // Discount amount applied from promo
  }).index("by_userId", ["userId"]),

  /* ================= PRODUCTS ================= */
  products: defineTable({
    name: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
    category: v.string(),

    soldOut: v.boolean(),
    discount: v.number(),
    stock: v.optional(v.number()),

    storageId: v.optional(v.id("_storage")),

    /* -------- SINGLE PRICE PRODUCT -------- */
    price: v.optional(v.number()),

    /* -------- SIZE-BASED PRODUCT -------- */
    sizes: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(),
        })
      )
    ),
  })
    /* 🔥 SEARCH INDEX (FIXES YOUR ERROR) 🔥 */
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["category", "soldOut"],
    }),

  /* ================= PROMOS ================= */
  promos: defineTable({
    code: v.string(), // Unique promo code (e.g., "SAVE20")
    discount: v.number(), // Discount percentage (0-100)
    active: v.boolean(), // Whether the promo is currently active
    minOrderAmount: v.optional(v.number()), // Minimum order amount to apply (optional)
    maxDiscount: v.optional(v.number()), // Maximum discount amount (optional, e.g., max ₹500 off)
    expiresAt: v.optional(v.number()), // Timestamp when promo expires (optional)
    usageCount: v.number(), // How many times it's been used
    maxUsage: v.optional(v.number()), // Maximum number of times it can be used (optional)
    description: v.optional(v.string()), // Optional description
  }).index("by_code", ["code"]),

  /* ================= WISHLIST ================= */
  wishlist: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    addedAt: v.number(), // Timestamp
  })
    .index("by_userId", ["userId"])
    .index("by_userId_productId", ["userId", "productId"]),

  /* ================= REVIEWS ================= */
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.string(),
    userName: v.string(),
    rating: v.number(), // 1-5
    comment: v.string(),
    verifiedPurchase: v.boolean(), // Whether user actually purchased
    createdAt: v.number(), // Timestamp
    helpful: v.number(), // Count of helpful votes
  })
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"]),

  /* ================= ORDER STATUS HISTORY ================= */
  orderStatusHistory: defineTable({
    orderId: v.string(),
    status: v.string(),
    message: v.optional(v.string()),
    timestamp: v.number(),
    updatedBy: v.optional(v.string()), // Admin userId if applicable
  }).index("by_orderId", ["orderId"]),

  /* ================= ORDER REQUESTS (Cancellation/Return) ================= */
  orderRequests: defineTable({
    orderId: v.string(),
    userId: v.string(),
    type: v.string(), // "cancellation" | "return"
    reason: v.string(),
    status: v.string(), // "pending" | "approved" | "rejected"
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
  })
    .index("by_orderId", ["orderId"])
    .index("by_userId", ["userId"]),

  /* ================= RECENTLY VIEWED ================= */
  recentlyViewed: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    viewedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_viewedAt", ["userId", "viewedAt"]),
});
