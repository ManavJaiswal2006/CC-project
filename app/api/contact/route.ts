import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sanitizeString, validateEmail, escapeHtml } from "@/lib/validation";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { getEmailFrom, getAdminEmail, getEmailTransporterConfig, isEmailConfigured } from "@/lib/emailConfig";

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

    if (!isEmailConfigured("contact")) {
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport(getEmailTransporterConfig("contact"));

    const mailOptions = {
      from: `"${escapeHtml(sanitizedName)}" <${getEmailFrom("contact")}>`,
      to: getAdminEmail(),
      replyTo: sanitizedEmail!,
      subject: `New Bourgon Inquiry: ${escapeHtml(sanitizedName)}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@300;400;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfcfc; font-family: 'Inter', sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #fcfcfc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eeeeee;">
          
          <tr>
            <td style="background-color: #1a1a1a; padding: 50px 40px; text-align: left;">
              <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/bourgonLogo.png" alt="Bourgon Industries" style="max-width: 180px; height: auto; margin-bottom: 20px; display: block;" />
              <div style="color: #b91c1c; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; margin-bottom: 10px;">
                Priority Handling Required
              </div>
              <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #ffffff; margin: 0; font-style: italic; font-weight: 400;">
                Concierge Request
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
                <tr>
                  <td width="50%" valign="top">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 5px;">Client Identity</div>
                    <div style="font-size: 15px; font-weight: 600; color: #111;">${escapeHtml(sanitizedName)}</div>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 5px;">Communication</div>
                    <div style="font-size: 14px; color: #b91c1c;">${escapeHtml(sanitizedEmail!)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px 50px 40px;">
              <div style="background-color: #fafafa; padding: 30px; border-top: 1px solid #eeeeee;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #111; font-weight: 700; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px; display: inline-block;">
                  Inquiry Details
                </div>
                <p style="font-size: 15px; line-height: 1.8; color: #333; margin: 0; white-space: pre-wrap; font-family: 'Inter', sans-serif;">
                  ${escapeHtml(sanitizedMessage)}
                </p>
              </div>
              
              <div style="margin-top: 40px; text-align: center;">
                <a href="mailto:${escapeHtml(sanitizedEmail!)}" style="display: inline-block; padding: 15px 35px; background-color: #111; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">
                  Initiate Response
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #ffffff; border-top: 1px solid #f9f9f9; text-align: center;">
              <p style="font-size: 9px; color: #bbbbbb; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
                © Bourgon Industries — Private & Confidential
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