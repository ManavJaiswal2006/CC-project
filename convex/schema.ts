import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. Users Table (No changes)
  users: defineTable({
    userId: v.string(),
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

  // 2. Orders Table (No changes)
  orders: defineTable({
    userId: v.string(),
    orderId: v.string(),
    items: v.any(),
    totalAmount: v.number(),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // 3. Products Table (UPDATED)
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    discount: v.number(),
    
    // CHANGED: Stores the ID of the uploaded image file
    storageId: v.optional(v.id("_storage")), 
    
    // ADDED: Tracks if the item is out of stock
    soldOut: v.boolean(), 
  }),
});