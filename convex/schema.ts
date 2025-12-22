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
        street: v.string(),
        city: v.string(),
        zip: v.string(),
      })
    ),
  }).index("by_userId", ["userId"]),

  /* ================= ORDERS ================= */
  orders: defineTable({
    userId: v.string(),
    orderId: v.string(),
    items: v.any(), // cart snapshot (size-aware)
    totalAmount: v.number(),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  /* ================= PRODUCTS ================= */
  products: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),

    soldOut: v.boolean(),
    discount: v.number(),

    storageId: v.optional(v.id("_storage")),

    /* -------- SINGLE PRICE PRODUCT -------- */
    price: v.optional(v.number()),

    /* -------- SIZE-BASED PRODUCT -------- */
    sizes: v.optional(
      v.array(
        v.object({
          label: v.string(), // "22 CM"
          value: v.string(), // "22"
          price: v.number(), // 3385
        })
      )
    ),
  }),

  /* ================= PROMOS ================= */
  promos: defineTable({
    code: v.string(),
    discount: v.number(),
  }),
});
