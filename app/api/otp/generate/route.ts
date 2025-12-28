import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { sendOTPEmail } from "@/lib/emailNotifications";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // Rate limiting - 3 OTP requests per 5 minutes per IP
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 5 * 60 * 1000, maxRequests: 3 });
  
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
    const { email, purpose } = await req.json();

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!purpose || (purpose !== "signup" && purpose !== "login")) {
      return NextResponse.json(
        { success: false, message: "Invalid purpose. Must be 'signup' or 'login'" },
        { status: 400 }
      );
    }

    // Generate OTP via Convex
    // Note: Type assertion needed until Convex types are regenerated
    const otpApi = api as any;
    const result: { otpId: string; otp: string } = await fetchMutation(
      otpApi.otp.createOTP,
      {
        email: email.toLowerCase(),
        purpose,
      }
    );

    // Send OTP email
    try {
      await sendOTPEmail(email, result.otp, purpose);
    } catch (emailError) {
      logger.error("Failed to send OTP email", emailError as Error, {
        email: email.toLowerCase(),
        purpose,
      });
      // Don't fail the request if email fails, but log it
      // In production, you might want to fail here
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error: any) {
    logger.error("OTP generation error", error, {
      identifier,
    });

    if (error.message.includes("Invalid email")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to generate OTP. Please try again." },
      { status: 500 }
    );
  }
}

