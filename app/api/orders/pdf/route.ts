import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { generateBillHTML } from "@/lib/billTemplate";
import { logger } from "@/lib/logger";
import puppeteer from "puppeteer";

export async function GET(req: Request) {
  let orderId: string | null = null;
  
  try {
    const { searchParams } = new URL(req.url);
    orderId = searchParams.get("orderId");

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

    // Convert HTML to PDF using Puppeteer
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      const page = await browser.newPage();
      await page.setContent(billHTML, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm',
        },
      });

      await browser.close();

      // Return PDF
      return new NextResponse(Buffer.from(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${orderId}.pdf"`,
        },
      });
    } catch (pdfError: any) {
      if (browser) {
        await browser.close();
      }
      logger.error("PDF generation error", pdfError, {
        orderId: orderId || "unknown",
      });
      // Fallback to HTML if PDF generation fails
      return new NextResponse(billHTML, {
        headers: {
          "Content-Type": "text/html",
          "Content-Disposition": `inline; filename="invoice-${orderId}.html"`,
        },
      });
    }
  } catch (error: any) {
    logger.error("PDF generation error", error, {
      orderId: orderId || "unknown",
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to generate invoice. Please try again later." 
      },
      { status: 500 }
    );
  }
}

