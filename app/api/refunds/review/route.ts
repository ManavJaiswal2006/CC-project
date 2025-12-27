import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { logger } from "@/lib/logger";
import { sendRefundStatusUpdateEmail } from "@/lib/refundEmailNotifications";

export async function POST(req: Request) {
  try {
    // Check admin authentication via API key
    const adminKey = req.headers.get("x-admin-key");
    if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { refundRequestId, action, adminNotes, refundAmount, reviewedBy } = body;

    if (!refundRequestId || !action || !reviewedBy) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    // Get refund request details before updating
    const request = await fetchQuery(api.refund.getRefundRequestById, {
      id: refundRequestId as any,
    });

    if (!request) {
      return NextResponse.json(
        { success: false, message: "Refund request not found" },
        { status: 404 }
      );
    }

    // Get order details
    const order = await fetchQuery(api.order.getByOrderId, {
      orderId: request.orderId,
    });

    // Review refund request
    await fetchMutation(api.refund.reviewRefundRequest, {
      id: refundRequestId as any,
      action: action as "approve" | "reject",
      adminNotes,
      refundAmount,
      reviewedBy,
    });

    // Send email notification
    if (order?.customerEmail && order.shippingName) {
      try {
        await sendRefundStatusUpdateEmail({
          orderId: request.orderId,
          customerName: order.shippingName,
          customerEmail: order.customerEmail,
          reason: request.reason,
          refundAmount: refundAmount || request.refundAmount || order.totalAmount,
          status: action === "approve" ? "approved" : "rejected",
          adminNotes,
        });
      } catch (emailError) {
        logger.error("Failed to send refund status update email", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Refund request ${action}d successfully`,
    });
  } catch (error: any) {
    logger.error("Review refund request error", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to review refund request",
      },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Check admin authentication
    const adminKey = req.headers.get("x-admin-key");
    if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Get specific refund request
      const request = await fetchQuery(api.refund.getRefundRequestById, {
        id: id as any,
      });
      return NextResponse.json({ success: true, request });
    } else {
      // Get all refund requests
      const requests = await fetchQuery(api.refund.getAllRefundRequests, {});
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

