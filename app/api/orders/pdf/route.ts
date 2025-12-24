import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { generateBillHTML } from "@/lib/billTemplate";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order data
    const order = await fetchQuery(api.order.getByOrderId, { orderId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
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

    // Generate bill HTML
    const billHTML = generateBillHTML({
      orderId: order.orderId,
      orderDate,
      customerName: order.shippingName || "Customer",
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress || "",
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
    }, false);

    // For now, return HTML that can be printed/saved as PDF
    // In production, you might want to use a library like puppeteer or pdfkit
    return new NextResponse(billHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${orderId}.html"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

