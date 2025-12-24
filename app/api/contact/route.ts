import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sanitizeString, validateEmail, escapeHtml } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // Rate limiting
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 5 }); // 5 requests per minute
  
  if (!limitResult.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(limitResult.resetAt).toISOString(),
        },
      }
    );
  }

  let sanitizedEmail: string | undefined;
  
  try {
    const { name, email, message } = await req.json();

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 200) {
      return NextResponse.json(
        { success: false, message: "Invalid name" },
        { status: 400 }
      );
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Invalid message" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name, 200);
    sanitizedEmail = email.toLowerCase().trim();
    const sanitizedMessage = sanitizeString(message, 5000);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${escapeHtml(sanitizedName)}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: sanitizedEmail!,
      subject: `New Bourgon Inquiry: ${escapeHtml(sanitizedName)}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; color: #1e293b;">
          <h2 style="color: #b91c1c; font-style: italic; border-bottom: 2px solid #b91c1c; padding-bottom: 10px;">New Concierge Request</h2>
          <p style="margin-top: 20px;"><strong>Client Name:</strong> ${escapeHtml(sanitizedName)}</p>
          <p><strong>Client Email:</strong> ${escapeHtml(sanitizedEmail!)}</p>
          <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #b91c1c; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #64748b;">Message Detail:</p>
            <p style="line-height: 1.6; margin-top: 10px; white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
          </div>
          <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 40px;">SENT VIA BOURGON INDUSTRIES SECURE PORTAL</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    logger.error("Contact form error", error, {
      email: sanitizedEmail || "unknown",
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to send message. Please try again later." 
      }, 
      { status: 500 }
    );
  }
}