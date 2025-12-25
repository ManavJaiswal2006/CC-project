import { NextResponse } from "next/server";
import { sendOrderStatusEmail } from "@/lib/emailNotifications";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  let body: any = null;
  
  try {
    const adminKey = req.headers.get("x-admin-key");
    if (!process.env.ADMIN_API_KEY || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    body = await req.json();
    const { orderId, customerEmail, customerName, status, trackingNumber, trackingUrl } = body as {
      orderId: string;
      customerEmail?: string;
      customerName?: string;
      status: string;
      trackingNumber?: string;
      trackingUrl?: string;
    };

    if (!orderId || !customerEmail) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    // Fetch full order data
    const order = await fetchQuery(api.order.getByOrderId, { orderId });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Calculate subtotal
    const subtotal = order.promoDiscount && order.promoDiscount > 0
      ? order.totalAmount + order.promoDiscount
      : order.totalAmount;

    // Format order date
    const orderDate = order._creationTime
      ? new Date(order._creationTime).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    // Send enhanced email notification
    await sendOrderStatusEmail({
      orderId: order.orderId,
      customerName: customerName || order.shippingName || "Customer",
      customerEmail,
      status: status || order.status,
      trackingNumber: trackingNumber || order.trackingNumber,
      trackingUrl: trackingUrl || order.trackingUrl,
      items: (order.items || []) as Array<{
        id: string;
        name: string;
        image?: string;
        size?: string | null;
        price: number;
        basePrice?: number;
        discount?: number;
        quantity: number;
      }>,
      subtotal,
      promoDiscount: order.promoDiscount && order.promoDiscount > 0 ? order.promoDiscount : undefined,
      promoCode: order.promoCode,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod || "N/A",
      shippingAddress: order.shippingAddress || "",
      orderDate,
    }, order.status);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    logger.error("Order confirm email error", error, {
      orderId: body?.orderId || "unknown",
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to send email notification. Please try again." 
      }, 
      { status: 500 }
    );
  }
}


