import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";

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
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes } = body;

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
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}

