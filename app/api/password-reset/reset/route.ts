import { NextResponse } from "next/server";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { logger } from "@/lib/logger";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  // Rate limiting - 5 attempts per 15 minutes per IP
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 15 * 60 * 1000, maxRequests: 5 });
  
  if (!limitResult.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const { token, newPassword } = await req.json();

    // Validation
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid reset token" },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Verify token via Convex
    const passwordResetApi = api as any;
    const verifyResult: { email: string; success: boolean } = await fetchMutation(
      passwordResetApi.passwordReset.verifyPasswordResetToken,
      {
        token,
      }
    );

    if (!verifyResult.success || !verifyResult.email) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const email = verifyResult.email;

    // Update password using Firebase Admin SDK
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      logger.error("Firebase Admin not initialized", new Error("Cannot update password"));
      return NextResponse.json(
        { success: false, message: "Server configuration error. Please configure Firebase Admin SDK. See PASSWORD_RESET_SETUP.md for instructions." },
        { status: 500 }
      );
    }

    try {
      // Get user by email
      const userRecord = await adminAuth.getUserByEmail(email);
      
      // Update password
      await adminAuth.updateUser(userRecord.uid, {
        password: newPassword,
      });

      return NextResponse.json({
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password.",
      });
    } catch (firebaseError: any) {
      logger.error("Firebase password update error", firebaseError, {
        email: email.toLowerCase(),
      });

      if (firebaseError.code === "auth/user-not-found") {
        return NextResponse.json(
          { success: false, message: "User account not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error("Password reset error", error, {
      identifier,
    });

    if (
      error.message.includes("Invalid") ||
      error.message.includes("expired") ||
      error.message.includes("already been used")
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}

