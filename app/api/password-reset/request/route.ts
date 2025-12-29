import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { logger } from "@/lib/logger";
import { sendPasswordResetEmail } from "@/lib/emailNotifications";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { isEmailConfigured } from "@/lib/emailConfig";

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
    // But always send email to prevent information leakage and improve UX
    let userExists = true; // Default to true
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        await adminAuth.getUserByEmail(email.toLowerCase());
        userExists = true;
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          userExists = false;
          // Still send email to prevent email enumeration
          // The token will just be invalid if user doesn't exist
        } else {
          // For other errors, assume user exists
          logger.error("Error checking user existence", error, {
            email: email.toLowerCase(),
          });
        }
      }
    }

    // Always generate token and attempt to send email
    // This prevents email enumeration and improves UX
    try {
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
        logger.info("Password reset email sent successfully", {
          email: email.toLowerCase(),
        });
      } catch (emailError: any) {
        // Log detailed error information
        logger.error("Failed to send password reset email", emailError as Error, {
          email: email.toLowerCase(),
          errorCode: emailError.code,
          errorMessage: emailError.message,
          errorStack: emailError.stack,
          emailConfigured: isEmailConfigured("security"),
        });
        
        // If email is not configured, this is a critical error
        // But we still return success to prevent email enumeration
        if (emailError.message?.includes("not configured")) {
          console.error("CRITICAL: Email service not configured. Set EMAIL_SECURITY_USER and EMAIL_SECURITY_PASS in environment variables.");
        }
        // Don't throw - we still want to return success to prevent enumeration
      }
    } catch (tokenError: any) {
      logger.error("Failed to generate password reset token", tokenError as Error, {
        email: email.toLowerCase(),
      });
      // Still return success to prevent email enumeration
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

