import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "@/lib/logger";

// Lazy initialization function to avoid build-time errors
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: Request) {
  let amount: number | undefined;
  let currency: string = "INR";
  let receipt: string | undefined;
  
  try {
    const body = await req.json();
    amount = body.amount;
    currency = body.currency || "INR";
    receipt = body.receipt;
    const notes = body.notes;

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    // Validate Razorpay keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: "Razorpay not configured" },
        { status: 500 }
      );
    }

    // Initialize Razorpay instance
    const razorpay = getRazorpayInstance();

    // Create order in Razorpay
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (multiply by 100)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    logger.error("Razorpay order creation error", error, {
      amount,
      currency,
      receipt,
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to create payment order";
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.error) {
      // Razorpay API errors
      errorMessage = error.error.description || error.error.reason || errorMessage;
    }
    
    // Check for common issues
    if (errorMessage.includes("credentials") || errorMessage.includes("not configured")) {
      errorMessage = "Razorpay is not configured. Please contact support.";
    } else if (errorMessage.includes("authentication") || errorMessage.includes("invalid")) {
      errorMessage = "Invalid Razorpay credentials. Please contact support.";
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

