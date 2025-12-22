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
    items: v.any(), // cart snapshot
    totalAmount: v.number(),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  /* ================= PRODUCTS ================= */
  products: defineTable({
    name: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
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
    code: v.string(),
    discount: v.number(),
  }),
});
