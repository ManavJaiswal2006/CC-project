import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { logger } from "@/lib/logger";
import { sendPasswordResetEmail } from "@/lib/emailNotifications";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  // Rate limiting - 3 requests per 15 minutes per IP
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 15 * 60 * 1000, maxRequests: 3 });
  
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
    const { email } = await req.json();

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if user exists in Firebase (if Admin SDK is available)
    let userExists = true; // Default to true to prevent email enumeration
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        await adminAuth.getUserByEmail(email.toLowerCase());
        userExists = true;
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          userExists = false;
        }
        // For other errors, assume user exists to prevent information leakage
      }
    }

    // Only generate token and send email if user exists (or if we can't verify)
    if (userExists) {
      // Generate password reset token via Convex
      const passwordResetApi = api as any;
      const result: { tokenId: string; token: string } = await fetchMutation(
        passwordResetApi.passwordReset.createPasswordResetToken,
        {
          email: email.toLowerCase(),
        }
      );

      // Send password reset email with the token
      try {
        await sendPasswordResetEmail(email, result.token);
      } catch (emailError) {
        logger.error("Failed to send password reset email", emailError as Error, {
          email: email.toLowerCase(),
        });
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error: any) {
    logger.error("Password reset request error", error, {
      identifier,
    });

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  }
}

