import { NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData, // Contains order details for creation
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment verified! Now create the order in database
    if (orderData) {
      try {
        const orderResult = await fetchMutation(api.order.createOrder, {
          userId: orderData.userId,
          customerEmail: orderData.customerEmail,
          shippingName: orderData.shippingName,
          shippingAddress: orderData.shippingAddress,
          items: orderData.items,
          total: orderData.total,
          paymentMethod: "razorpay", // Use "razorpay" instead of "card" or "upi"
          promoCode: orderData.promoCode,
          promoDiscount: orderData.promoDiscount,
        });

        // Update order with payment details
        // You can store razorpay_payment_id and razorpay_order_id in order if needed

        return NextResponse.json({
          success: true,
          message: "Payment verified and order created",
          orderId: orderResult.orderId,
          paymentId: razorpay_payment_id,
        });
      } catch (orderError: any) {
        console.error("Order creation error after payment:", orderError);
        // Payment succeeded but order creation failed
        // You might want to handle this differently (e.g., manual review)
        return NextResponse.json(
          {
            success: false,
            message: "Payment verified but order creation failed",
            paymentId: razorpay_payment_id,
            error: orderError.message,
          },
          { status: 500 }
        );
      }
    }

    // If no orderData, just verify payment (for existing orders)
    return NextResponse.json({
      success: true,
      message: "Payment verified",
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Payment verification failed",
      },
      { status: 500 }
    );
  }
}

