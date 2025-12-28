import { NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // Rate limiting - 10 verification attempts per 5 minutes per IP
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 5 * 60 * 1000, maxRequests: 10 });
  
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
    const { email, otp, purpose } = await req.json();

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string" || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP format. Must be 6 digits." },
        { status: 400 }
      );
    }

    if (!purpose || (purpose !== "signup" && purpose !== "login")) {
      return NextResponse.json(
        { success: false, message: "Invalid purpose. Must be 'signup' or 'login'" },
        { status: 400 }
      );
    }

    // Verify OTP via Convex
    // Note: Type assertion needed until Convex types are regenerated
    const otpApi = api as any;
    await fetchMutation(otpApi.otp.verifyOTP, {
      email: email.toLowerCase(),
      otp,
      purpose,
    });

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error: any) {
    logger.error("OTP verification error", error, {
      identifier,
    });

    // Return specific error messages
    if (
      error.message.includes("No valid OTP") ||
      error.message.includes("Invalid OTP") ||
      error.message.includes("Too many failed attempts")
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}

