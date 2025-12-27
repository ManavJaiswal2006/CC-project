import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { logger } from "@/lib/logger";
import { sendRefundRequestEmail } from "@/lib/refundEmailNotifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, orderId, reason, photoStorageId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    if (!orderId || !reason) {
      return NextResponse.json(
        { success: false, message: "Order ID and reason are required" },
        { status: 400 }
      );
    }

    // Get order details for email
    const order = await fetchQuery(api.order.getByOrderId, { orderId });
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Create refund request
    await fetchMutation(api.refund.createRefundRequest, {
      orderId,
      userId,
      reason,
      photoStorageId: photoStorageId || undefined,
    });

    // Send email notification
    if (order.customerEmail && order.shippingName) {
      try {
        await sendRefundRequestEmail({
          orderId,
          customerName: order.shippingName,
          customerEmail: order.customerEmail,
          reason,
          refundAmount: order.totalAmount,
          status: "pending",
        });
      } catch (emailError) {
        logger.error("Failed to send refund request email", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Refund request submitted successfully",
    });
  } catch (error: any) {
    logger.error("Refund request error", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to submit refund request",
      },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 401 }
      );
    }

    if (orderId) {
      // Get refund request for specific order
      const request = await fetchQuery(api.refund.getRefundRequestByOrderId, {
        orderId,
        userId,
      });
      return NextResponse.json({ success: true, request });
    } else {
      // Get all refund requests for user
      const requests = await fetchQuery(api.refund.getRefundRequests, {
        userId,
      });
      return NextResponse.json({ success: true, requests });
    }
  } catch (error: any) {
    logger.error("Get refund requests error", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch refund requests",
      },
      { status: 500 }
    );
  }
}

