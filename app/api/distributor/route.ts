import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sanitizeString, validateEmail, validatePhone, escapeHtml } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getEmailFrom, getEmailFromField, getAdminEmail, getEmailTransporterConfig, isEmailConfigured } from "@/lib/emailConfig";

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

  let sanitizedEmail: string | undefined;
  
  try {
    const { name, email, phone, company, location, message, userId } = await req.json();

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
    const sanitizedEmailValue = email.toLowerCase().trim();
    sanitizedEmail = sanitizedEmailValue;
    const sanitizedPhone = sanitizeString(phone, 15);
    const sanitizedCompany = company ? sanitizeString(company, 200) : "";
    const sanitizedLocation = sanitizeString(location, 200);
    const sanitizedMessage = sanitizeString(message, 5000);

    // Save application to Convex database
    try {
      await fetchMutation(api.distributorApplications.createApplication, {
        name: sanitizedName,
        email: sanitizedEmailValue,
        phone: sanitizedPhone,
        company: sanitizedCompany || undefined,
        location: sanitizedLocation,
        message: sanitizedMessage,
        userId: userId || undefined, // Include userId if provided (required since login is mandatory)
      });
    } catch (error: any) {
      logger.error("Error saving distributor application to database", error, {
        email: sanitizedEmail,
      });
      // Continue to send emails even if DB save fails
    }

    if (!isEmailConfigured("distributor")) {
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport(getEmailTransporterConfig("distributor"));

    // Email to admin
    const mailOptions = {
      from: `"${escapeHtml(sanitizedName)}" <${getEmailFrom("distributor")}>`,
      to: getAdminEmail(),
      replyTo: sanitizedEmail!,
      subject: `New Distributor Application: ${escapeHtml(sanitizedName)}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#fcfcfc; font-family: 'Inter', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fcfcfc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" style="background-color:#ffffff; border:1px solid #e5e5e5;">
          <tr>
            <td style="background-color:#000000; padding:40px; text-align:center;">
              <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/bourgonLogo.png" alt="Bourgon Industries" style="max-width: 180px; height: auto; margin: 0 auto 20px auto; display: block;" />
              <h1 style="font-family:'Cormorant Garamond', serif; font-size:20px; color:#ffffff; letter-spacing:3px; text-transform:uppercase; margin:0;">
                Partnership Division
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#b91c1c; font-weight:700; margin-bottom:10px;">
                New Distributor Inquiry
              </div>
              <h2 style="font-family:'Cormorant Garamond', serif; font-size:28px; color:#111; margin:0 0 30px 0; font-style:italic;">
                Application from ${escapeHtml(sanitizedName)}
              </h2>
              
              <table width="100%" style="border-top: 1px solid #eee; padding-top:20px;">
                <tr>
                  <td style="padding:10px 0; font-size:12px; color:#888; text-transform:uppercase;">Origin</td>
                  <td style="padding:10px 0; font-size:14px; text-align:right;">${escapeHtml(sanitizedLocation)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0; font-size:12px; color:#888; text-transform:uppercase;">Direct Contact</td>
                  <td style="padding:10px 0; font-size:14px; text-align:right;">${escapeHtml(sanitizedPhone)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0; font-size:12px; color:#888; text-transform:uppercase;">Email</td>
                  <td style="padding:10px 0; font-size:14px; text-align:right; color:#b91c1c;">${escapeHtml(sanitizedEmail!)}</td>
                </tr>
              </table>

              <div style="margin-top:30px; background:#f9f9f9; padding:25px; border-left:2px solid #111;">
                <p style="margin:0 0 10px 0; font-size:11px; font-weight:700; color:#555; text-transform:uppercase;">Executive Summary / Message:</p>
                <p style="margin:0; font-size:14px; line-height:1.8; color:#333; white-space:pre-wrap;">${escapeHtml(sanitizedMessage)}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px; text-align:center; background:#fafafa; font-size:10px; color:#aaa; letter-spacing:1px;">
              PROCESSED VIA BOURGON SECURE PARTNER GATEWAY
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to applicant
    if (isEmailConfigured("distributor")) {
      await transporter.sendMail({
        from: getEmailFromField("distributor"),
        to: sanitizedEmail!,
        subject: "Thank you for your distributor application",
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#fcfcfc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" style="background-color:#ffffff; border:1px solid #eeeeee;">
          <tr>
            <td style="padding:60px 40px; text-align:center;">
              <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/bourgonLogo.png" alt="Bourgon Industries" style="max-width: 200px; height: auto; margin: 0 auto 30px auto; display: block;" />
              <div style="height:1px; width:40px; background:#b91c1c; margin:0 auto 30px auto;"></div>
              
              <h2 style="font-family:'Cormorant Garamond', serif; font-size:22px; font-style:italic; margin-bottom:20px;">
                Thank you for your interest in our network.
              </h2>
              
              <p style="font-family:'Inter', sans-serif; font-size:14px; line-height:1.8; color:#555; margin-bottom:30px;">
                Dear ${escapeHtml(sanitizedName)},<br><br>
                We have successfully received your application to become an authorized distributor. 
                Our partnership team reviews each inquiry to ensure alignment with our global standards. 
                Expect a formal response within 3 to 5 business days.
              </p>

              <div style="border:1px solid #eee; padding:20px; display:inline-block; text-align:left; min-width:250px;">
                <div style="font-size:10px; color:#aaa; text-transform:uppercase; margin-bottom:5px;">Application Status</div>
                <div style="font-size:13px; font-weight:600; color:#b91c1c;">PENDING REVIEW</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px; background:#000000; color:#ffffff; text-align:center;">
              <p style="font-size:11px; letter-spacing:1px; margin:0;">
                For urgent inquiries: <a href="mailto:bourgonindustries@gmail.com" style="color:#ffffff; text-decoration:underline;">concierge@bourgon.in</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    logger.error("Distributor application error", error, {
      email: sanitizedEmail || "unknown",
    });
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to submit application. Please try again later." 
      }, 
      { status: 500 }
    );
  }
}

