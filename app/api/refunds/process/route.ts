import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { logger } from "@/lib/logger";
import { sendRefundStatusUpdateEmail } from "@/lib/refundEmailNotifications";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    // Check admin authentication
    const adminKey = req.headers.get("x-admin-key");
    if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { refundRequestId } = body;

    if (!refundRequestId) {
      return NextResponse.json(
        { success: false, message: "Refund request ID is required" },
        { status: 400 }
      );
    }

    // Get refund request
    const request = await fetchQuery(api.refund.getRefundRequestById, {
      id: refundRequestId as any,
    });

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Refund request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "approved") {
      return NextResponse.json(
        { success: false, message: "Refund request must be approved before processing" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await fetchQuery(api.order.getByOrderId, {
      orderId: request.orderId,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.razorpayPaymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID not found. This order may not be eligible for online refund." },
        { status: 400 }
      );
    }

    // Process refund via Razorpay
    try {
      const refundAmount = request.refundAmount || order.totalAmount;
      const refundAmountInPaise = Math.round(refundAmount * 100); // Razorpay expects amount in paise

      const razorpayRefund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: refundAmountInPaise,
        notes: {
          orderId: order.orderId,
          reason: request.reason,
          refundRequestId: request._id,
        },
      });

      // Mark refund as processed
      await fetchMutation(api.refund.markRefundProcessed, {
        id: refundRequestId as any,
        refundId: razorpayRefund.id,
      });

      // Send email notification
      if (order.customerEmail && order.shippingName) {
        try {
          await sendRefundStatusUpdateEmail({
            orderId: order.orderId,
            customerName: order.shippingName,
            customerEmail: order.customerEmail,
            reason: request.reason,
            refundAmount,
            status: "refunded",
            refundId: razorpayRefund.id,
          });
        } catch (emailError) {
          logger.error("Failed to send refund processed email", emailError);
          // Don't fail the request if email fails
        }
      }

      logger.info("Refund processed successfully", {
        refundRequestId,
        razorpayRefundId: razorpayRefund.id,
        amount: refundAmount,
      });

      return NextResponse.json({
        success: true,
        message: "Refund processed successfully",
        refundId: razorpayRefund.id,
        refund: razorpayRefund,
      });
    } catch (razorpayError: any) {
      logger.error("Razorpay refund error", razorpayError, {
        refundRequestId,
        paymentId: order.razorpayPaymentId,
      });

      return NextResponse.json(
        {
          success: false,
          message: razorpayError.error?.description || "Failed to process refund via Razorpay",
          error: process.env.NODE_ENV === "development" ? razorpayError.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error("Process refund error", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process refund",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

