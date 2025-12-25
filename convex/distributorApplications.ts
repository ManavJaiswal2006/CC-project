import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

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
   GET ALL DISTRIBUTOR APPLICATIONS (Admin only)
===================================================== */
export const getAllApplications = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    if (args.status) {
      const applications = await ctx.db
        .query("distributor_applications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
      return applications;
    } else {
      // Get all, order by newest first
      const all = await ctx.db
        .query("distributor_applications")
        .order("desc")
        .collect();
      return all;
    }
  },
});

/* =====================================================
   GET APPLICATION BY ID (Admin only)
===================================================== */
export const getApplication = query({
  args: { id: v.id("distributor_applications") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/* =====================================================
   APPROVE DISTRIBUTOR APPLICATION (Admin only)
   - Creates/updates user account with distributor role
   - Creates distributor profile
   - Updates application status
===================================================== */
export const approveApplication = mutation({
  args: {
    applicationId: v.id("distributor_applications"),
    userId: v.optional(v.string()), // Firebase UID if user already exists
    gstin: v.optional(v.string()),
    creditLimit: v.optional(v.number()), // Default credit limit
  },
  handler: async (ctx, args) => {
    const admin = await checkAdmin(ctx);

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      throw new Error("Application already reviewed");
    }

    const now = Date.now();
    const userId = args.userId || application.userId;

    // If userId provided, update existing user's role
    if (userId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (user) {
        // Update user role to distributor
        await ctx.db.patch(user._id, {
          role: "distributor",
          category: "distributor", // Also update legacy field
        });

        // Create or update distributor profile
        const existingProfile = await ctx.db
          .query("distributor_profiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();

        if (existingProfile) {
          await ctx.db.patch(existingProfile._id, {
            companyName: application.company || application.name,
            contactPerson: application.name,
            businessAddress: application.location,
            gstin: args.gstin,
            creditLimit: args.creditLimit ?? 100000, // Default 1 lakh
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("distributor_profiles", {
            userId,
            companyName: application.company || application.name,
            contactPerson: application.name,
            businessAddress: application.location,
            gstin: args.gstin || "",
            creditLimit: args.creditLimit ?? 100000, // Default 1 lakh
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // Update application status
    await ctx.db.patch(args.applicationId, {
      status: "approved",
      reviewedBy: admin.subject, // Admin identifier
      reviewedAt: now,
      userId: userId || undefined,
    });

    return { success: true };
  },
});

/* =====================================================
   REJECT DISTRIBUTOR APPLICATION (Admin only)
===================================================== */
export const rejectApplication = mutation({
  args: {
    applicationId: v.id("distributor_applications"),
    notes: v.optional(v.string()), // Optional rejection reason
  },
  handler: async (ctx, args) => {
    const admin = await checkAdmin(ctx);

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      throw new Error("Application already reviewed");
    }

    const now = Date.now();

    await ctx.db.patch(args.applicationId, {
      status: "rejected",
      reviewedBy: admin.subject,
      reviewedAt: now,
      notes: args.notes || undefined,
    });

    return { success: true };
  },
});

/* =====================================================
   CREATE DISTRIBUTOR APPLICATION (Requires authentication)
   Called from API route
===================================================== */
export const createApplication = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    company: v.optional(v.string()),
    location: v.string(),
    message: v.string(),
    userId: v.optional(v.string()), // Firebase UID - now required since login is mandatory
  },
  handler: async (ctx, args) => {
    // Check if application with this email already exists and is pending
    const existing = await ctx.db
      .query("distributor_applications")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existing) {
      throw new Error("Application already submitted for this email");
    }

    // Create new application
    const applicationId = await ctx.db.insert("distributor_applications", {
      name: args.name,
      email: args.email.toLowerCase().trim(),
      phone: args.phone,
      company: args.company,
      location: args.location,
      message: args.message,
      status: "pending",
      userId: args.userId, // Store userId if provided
      createdAt: Date.now(),
    });

    return applicationId;
  },
});

