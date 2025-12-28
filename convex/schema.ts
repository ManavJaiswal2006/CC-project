import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* ================= USERS ================= */
  users: defineTable({
    userId: v.string(), // Firebase UID
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    category: v.string(), // Legacy field, prefer 'role'
    role: v.optional(v.union(v.literal("customer"), v.literal("distributor"))), // 'customer' or 'distributor'
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
    trackingUrl: v.optional(v.string()),
    shippingName: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    promoCode: v.optional(v.string()), // Promo code used
    promoDiscount: v.optional(v.number()), // Discount amount applied from promo
    razorpayPaymentId: v.optional(v.string()), // Razorpay payment ID for refunds
    razorpayOrderId: v.optional(v.string()), // Razorpay order ID
    deliveredAt: v.optional(v.number()), // Timestamp when order was delivered (for refund window)
  }).index("by_userId", ["userId"]),

  /* ================= PRODUCTS ================= */
  products: defineTable({
    name: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
    category: v.string(),

    soldOut: v.boolean(),
    customerDiscount: v.number(), // Discount percentage for customers (0-100)
    distributorDiscount: v.number(), // Discount percentage for distributors (0-100)
    stock: v.optional(v.number()),
    quantity: v.optional(v.number()), // Pack quantity (1 for solo, 6 for pack of 6, 8 for pack of 8, etc.)

    storageId: v.optional(v.id("_storage")), // Legacy: single image (for backward compatibility)
    storageIds: v.optional(v.array(v.id("_storage"))), // Multiple images

    /* -------- SINGLE PRICE PRODUCT -------- */
    price: v.optional(v.number()), // Base price (customer and retailer prices calculated from discounts)

    /* -------- SIZE-BASED PRODUCT -------- */
    sizes: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(), // Base price for this size (customer and retailer prices calculated from discounts)
        })
      )
    ),

    /* -------- COLOR-BASED PRODUCT -------- */
    colors: v.optional(
      v.array(
        v.object({
          label: v.string(),
          value: v.string(),
          price: v.number(), // Base price for this color (customer and retailer prices calculated from discounts)
        })
      )
    ),

    /* -------- SUBPRODUCTS-BASED PRODUCT -------- */
    subproducts: v.optional(
      v.array(
        v.object({
          label: v.string(), // Display name (e.g., "Baby Fork")
          value: v.string(), // Unique identifier (e.g., "baby-fork")
          price: v.number(), // Base price for this subproduct (customer and retailer prices calculated from discounts)
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

  /* ================= REFUND REQUESTS ================= */
  refundRequests: defineTable({
    orderId: v.string(),
    userId: v.string(),
    reason: v.string(), // Customer's reason for refund
    photoStorageId: v.optional(v.id("_storage")), // Photo of damaged product/reason
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("refunded")), // Request status
    refundAmount: v.optional(v.number()), // Amount to refund (may be partial)
    refundId: v.optional(v.string()), // Razorpay refund ID after processing
    createdAt: v.number(), // When request was created
    reviewedAt: v.optional(v.number()), // When admin reviewed
    reviewedBy: v.optional(v.string()), // Admin userId who reviewed
    adminNotes: v.optional(v.string()), // Admin notes/feedback
    refundedAt: v.optional(v.number()), // When refund was processed
  })
    .index("by_orderId", ["orderId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  /* ================= RECENTLY VIEWED ================= */
  recentlyViewed: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    viewedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_viewedAt", ["userId", "viewedAt"]),

  /* ================= DISTRIBUTOR APPLICATIONS ================= */
  distributor_applications: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.optional(v.string()),
    location: v.string(),
    message: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")), // Application status
    reviewedBy: v.optional(v.string()), // Admin userId who reviewed
    reviewedAt: v.optional(v.number()), // Timestamp of review
    notes: v.optional(v.string()), // Admin notes
    userId: v.optional(v.string()), // Firebase UID (assigned when user is created/approved)
    createdAt: v.number(), // Timestamp
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),

  /* ================= DISTRIBUTOR PROFILES ================= */
  distributor_profiles: defineTable({
    userId: v.string(), // Firebase UID (links to users.userId)
    gstin: v.optional(v.string()), // GST Identification Number (optional, can be added later)
    creditLimit: v.number(), // Credit limit in INR
    companyName: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  })
    .index("by_userId", ["userId"]),

  /* ================= OTP VERIFICATION ================= */
  otps: defineTable({
    email: v.string(),
    otp: v.string(), // 6-digit OTP
    purpose: v.union(v.literal("signup"), v.literal("login")), // Purpose of OTP
    expiresAt: v.number(), // Timestamp when OTP expires (10 minutes)
    verified: v.boolean(), // Whether OTP has been verified
    attempts: v.number(), // Number of verification attempts
    createdAt: v.number(), // Timestamp when OTP was created
  })
    .index("by_email", ["email"])
    .index("by_email_purpose", ["email", "purpose"]),
});
