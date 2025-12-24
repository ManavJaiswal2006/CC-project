import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import {
  sanitizeString,
  validateEmail,
  validateOrderTotal,
  validateCartItems,
  escapeHtml,
} from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { generateBillHTML } from "@/lib/billTemplate";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // Rate limiting
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 10 }); // 10 orders per minute
  
  if (!limitResult.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(limitResult.resetAt).toISOString(),
        },
      }
    );
  }

  let body: any = null;
  
  try {
    body = await req.json();

    const {
      userId,
      customerEmail,
      shippingName,
      shippingAddress,
      items,
      total,
      paymentMethod,
      promoCode,
      promoDiscount,
    } = body as {
      userId: string;
      customerEmail?: string;
      shippingName: string;
      shippingAddress: string;
      items: unknown[];
      total: number;
      paymentMethod: string;
      promoCode?: string;
      promoDiscount?: number;
    };

    // Validation
    if (!userId || typeof userId !== "string" || userId.length > 200) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (!shippingName || !shippingAddress) {
      return NextResponse.json(
        { success: false, message: "Shipping name and address are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || !validateCartItems(items)) {
      return NextResponse.json(
        { success: false, message: "Invalid cart items" },
        { status: 400 }
      );
    }

    if (!validateOrderTotal(total)) {
      return NextResponse.json(
        { success: false, message: "Invalid order total" },
        { status: 400 }
      );
    }

    if (!["card", "upi", "cod"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment method" },
        { status: 400 }
      );
    }

    if (customerEmail && !validateEmail(customerEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedShippingName = sanitizeString(shippingName, 200);
    const sanitizedShippingAddress = sanitizeString(shippingAddress, 1000);
    const sanitizedPromoCode = promoCode ? sanitizeString(promoCode, 50).toUpperCase() : undefined;

    if (sanitizedShippingName.length === 0 || sanitizedShippingAddress.length === 0) {
      return NextResponse.json(
        { success: false, message: "Shipping details cannot be empty" },
        { status: 400 }
      );
    }

    // 1) Create order in Convex
    const { orderId } = await fetchMutation(api.order.createOrder, {
      userId,
      customerEmail: customerEmail?.toLowerCase().trim(),
      shippingName: sanitizedShippingName,
      shippingAddress: sanitizedShippingAddress,
      items,
      total,
      paymentMethod,
      promoCode: sanitizedPromoCode,
      promoDiscount: promoDiscount && promoDiscount > 0 ? promoDiscount : undefined,
    });

    // 2) Send confirmation emails with bill (if SMTP configured)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && customerEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Calculate subtotal (total before promo discount)
      const subtotal = promoDiscount && promoDiscount > 0 
        ? total + promoDiscount 
        : total;

      // Format order date
      const orderDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Generate bill HTML
      const billHTML = generateBillHTML({
        orderId,
        orderDate,
        customerName: sanitizedShippingName,
        customerEmail: customerEmail.toLowerCase().trim(),
        shippingAddress: sanitizedShippingAddress,
        items: items as Array<{
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
        promoDiscount: promoDiscount && promoDiscount > 0 ? promoDiscount : undefined,
        promoCode: sanitizedPromoCode,
        total,
        paymentMethod,
      }, false);

      const mailOptions = {
        from: `"Bourgon Orders" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `Your Order Invoice - ${orderId} | Bourgon Industries`,
        html: billHTML,
      };

      await transporter.sendMail(mailOptions);
    }

    // Email to admin with full bill
    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.ADMIN_EMAIL
    ) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Calculate subtotal (total before promo discount)
      const subtotal = promoDiscount && promoDiscount > 0 
        ? total + promoDiscount 
        : total;

      // Format order date
      const orderDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Generate bill HTML for admin
      const billHTML = generateBillHTML({
        orderId,
        orderDate,
        customerName: sanitizedShippingName,
        customerEmail: customerEmail?.toLowerCase().trim(),
        shippingAddress: sanitizedShippingAddress,
        items: items as Array<{
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
        promoDiscount: promoDiscount && promoDiscount > 0 ? promoDiscount : undefined,
        promoCode: sanitizedPromoCode,
        total,
        paymentMethod,
      }, true);

      await transporter.sendMail({
        from: `"Bourgon Orders" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Order - ${orderId} | Bourgon Industries`,
        html: billHTML,
      });
    }

    return NextResponse.json({ success: true, orderId }, { status: 200 });
  } catch (error: any) {
    logger.error("Order API error", error, {
      userId: body?.userId,
      paymentMethod: body?.paymentMethod,
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create order. Please try again or contact support." 
      }, 
      { status: 500 }
    );
  }
}


