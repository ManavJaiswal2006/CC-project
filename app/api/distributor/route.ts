import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sanitizeString, validateEmail, validatePhone, escapeHtml } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // Rate limiting
  const identifier = getClientIdentifier(req);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 3 }); // 3 requests per minute
  
  if (!limitResult.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(limitResult.resetAt).toISOString(),
        },
      }
    );
  }

  try {
    const { name, email, phone, company, location, message } = await req.json();

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

    if (!phone || typeof phone !== "string" || !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || location.trim().length === 0 || location.length > 200) {
      return NextResponse.json(
        { success: false, message: "Invalid location" },
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
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPhone = sanitizeString(phone, 15);
    const sanitizedCompany = company ? sanitizeString(company, 200) : "";
    const sanitizedLocation = sanitizeString(location, 200);
    const sanitizedMessage = sanitizeString(message, 5000);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to admin
    const mailOptions = {
      from: `"${escapeHtml(sanitizedName)}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: sanitizedEmail,
      subject: `New Distributor Application: ${escapeHtml(sanitizedName)}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; color: #1e293b;">
          <h2 style="color: #b91c1c; font-style: italic; border-bottom: 2px solid #b91c1c; padding-bottom: 10px;">New Distributor Application</h2>
          
          <div style="margin-top: 20px;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>
            ${sanitizedCompany ? `<p style="margin: 8px 0;"><strong>Company:</strong> ${escapeHtml(sanitizedCompany)}</p>` : ''}
            <p style="margin: 8px 0;"><strong>Location:</strong> ${escapeHtml(sanitizedLocation)}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #b91c1c; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #64748b;">Application Details:</p>
            <p style="line-height: 1.6; margin-top: 10px; white-space: pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
          </div>
          
          <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 40px;">SENT VIA BOURGON INDUSTRIES DISTRIBUTOR PORTAL</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to applicant
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Bourgon Industries" <${process.env.EMAIL_USER}>`,
        to: sanitizedEmail,
        subject: "Thank you for your distributor application",
        html: `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb;">
            <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Thank you for your interest, ${escapeHtml(sanitizedName)}!</h1>
            <p style="margin: 0 0 16px; color: #374151;">
              We have received your distributor application and will review it carefully. 
              Our team will contact you within 3-5 business days to discuss the opportunity further.
            </p>
            <p style="margin: 0 0 8px; color: #374151;"><strong>Application Summary:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px; color: #374151;">
              <li>Name: ${escapeHtml(sanitizedName)}</li>
              <li>Location: ${escapeHtml(sanitizedLocation)}</li>
              ${sanitizedCompany ? `<li>Company: ${escapeHtml(sanitizedCompany)}</li>` : ''}
            </ul>
            <p style="margin: 24px 0 8px; color: #374151;">If you have any questions, feel free to contact us:</p>
            <p style="margin: 0; color: #374151;">Email: bourgonindustries@gmail.com</p>
            <p style="margin: 0; color: #374151;">Phone: +91 88008 30465</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 32px;">Bourgon Industries Pvt. Ltd.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Distributor application error", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

