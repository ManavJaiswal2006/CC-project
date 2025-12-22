import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Users Table (Stores Profile & Addresses)
  users: defineTable({
    userId: v.string(), // Firebase UID
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
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

  // 2. Orders Table
  orders: defineTable({
    userId: v.string(),
    orderId: v.string(), // e.g., "ORD-1234"
    items: v.any(), // Storing cart array
    totalAmount: v.number(),
    status: v.string(), // "Processing", "Shipped", "Delivered"
    trackingNumber: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});