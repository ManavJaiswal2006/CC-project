import nodemailer from "nodemailer";
import { escapeHtml } from "./validation";
import { generateBillHTML } from "./billTemplate";
import { getEmailFromField, getEmailTransporterConfig, isEmailConfigured, getReplyToEmail } from "./emailConfig";

/**
 * Get standard email headers to improve deliverability and prevent spam
 */
function getEmailHeaders(): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in";
  const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}@bourgon.in`;
  return {
    "Message-ID": `<${messageId}>`,
    "X-Mailer": "Bourgon Industries Email System",
    "X-Priority": "3",
    "Importance": "normal",
    "List-Unsubscribe": `<${siteUrl}/unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    "X-Auto-Response-Suppress": "All",
    "X-Entity-Ref-ID": `bourgon-${Date.now()}`,
    "X-Company": "Bourgon Industries Pvt. Ltd.",
    "X-Contact": "+91 88008 30465",
  };
}

/**
 * Get logo HTML (text-based to avoid external image loading issues)
 */
function getLogoHTML(): string {
  return `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 42px; color: #ffffff; letter-spacing: 8px; text-transform: uppercase; margin: 0; line-height: 1;">
        BOURGON
      </h1>
      <p style="color: #a1a1a1; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-top: 10px;">
        Industries
      </p>
    </div>
  `;
}

interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items: Array<{
    id: string;
    name: string;
    image?: string;
    size?: string | null;
    price: number;
    basePrice?: number;
    discount?: number;
    quantity: number;
  }>;
  subtotal: number;
  promoDiscount?: number;
  promoCode?: string;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  orderDate: string;
}

export async function sendOrderStatusEmail(
  orderData: OrderData,
  previousStatus?: string
) {
  if (!isEmailConfigured("orders") || !orderData.customerEmail) {
    return;
  }

  const transporter = nodemailer.createTransport(getEmailTransporterConfig("orders"));

  const statusMessages: Record<string, string> = {
    "Order Placed": "Your order has been successfully placed! We're preparing it for you.",
    "Awaiting Admin Confirmation": "Your order has been received and is awaiting confirmation.",
    "Payment Received": "We've received your payment! Your order is now being processed.",
    "Confirmed": "Your order has been confirmed and is being prepared for shipment.",
    "Processing": "Your order is being processed and packed.",
    "Shipped": "Your order has been shipped and is on its way!",
    "Out for Delivery": "Your order is out for delivery and will arrive soon.",
    "Delivered": "Your order has been delivered. Thank you for shopping with us!",
    "Cancelled": "Your order has been cancelled as requested.",
  };

  const statusMessage = statusMessages[orderData.status] || "Your order status has been updated.";

  const subject = `Order ${orderData.orderId} - ${orderData.status} | Bourgon Industries`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in";

  // Use provided tracking URL or generate default one
  const trackingUrl = orderData.trackingUrl || 
    (orderData.trackingNumber && orderData.trackingNumber !== "Awaiting payment" && orderData.trackingNumber !== "Processing"
      ? `${siteUrl}/track-order`
      : "#");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@300;400;600&display=swap');
    
    body { margin: 0; padding: 0; background-color: #fcfcfc; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #fcfcfc; padding-bottom: 60px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Inter', sans-serif; color: #1a1a1a; }
    .header { background-color: #000000; text-align: center; padding: 60px 0; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 42px; color: #ffffff; letter-spacing: 8px; text-transform: uppercase; margin: 0; line-height: 1; }
    .logo-sub { color: #a1a1a1; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-top: 10px; }
    .content { padding: 50px 40px; }
    .status-badge { display: inline-block; padding: 6px 12px; background-color: #fdf2f2; border: 1px solid #f8d7da; color: #b91c1c; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .headline { font-family: 'Cormorant Garamond', serif; font-size: 28px; line-height: 1.2; margin-bottom: 20px; color: #111111; }
    .order-box { border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; padding: 30px 0; margin: 30px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .btn { display: inline-block; padding: 18px 40px; background-color: #111111; color: #ffffff !important; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; transition: all 0.3s ease; }
    .footer { padding: 40px; background-color: #ffffff; text-align: center; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          ${getLogoHTML()}
        </td>
      </tr>

      <tr>
        <td class="content">
          <div class="status-badge">${escapeHtml(orderData.status)}</div>
          <h2 class="headline">An update regarding <br/>your recent acquisition.</h2>
          
          <p style="font-size: 15px; color: #555555; line-height: 1.8;">
            Dear ${escapeHtml(orderData.customerName)},<br><br>
            ${statusMessage}
          </p>

          <div class="order-box">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Order Reference</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">#${escapeHtml(orderData.orderId)}</td>
              </tr>
              <tr><td height="15"></td></tr>
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Amount Processed</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">₹${orderData.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          ${orderData.trackingNumber && orderData.trackingNumber !== "Awaiting payment" && orderData.trackingNumber !== "Processing" ? `
          <div style="background-color: #f9f9f9; padding: 25px; text-align: center; margin-bottom: 30px;">
            <p style="margin: 0 0 15px; font-size: 12px; letter-spacing: 1px; color: #666;">TRACKING IDENTIFIER: <strong>${escapeHtml(orderData.trackingNumber)}</strong></p>
            <a href="${escapeHtml(trackingUrl)}" class="btn" style="background-color: #b91c1c;">Follow Shipment</a>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/orders/${escapeHtml(orderData.orderId)}" class="btn">View Collection Details</a>
          </div>
        </td>
      </tr>

      <tr>
        <td class="footer">
          <p style="font-size: 12px; color: #888888; margin-bottom: 20px;">
            Questions? Concierge is available at <strong>+91 88008 30465 & +91 88008 30467</strong>
          </p>
          <div style="height: 1px; background-color: #eeeeee; width: 50px; margin: 0 auto 20px;"></div>
          <p style="font-size: 10px; color: #bbbbbb; text-transform: uppercase; letter-spacing: 2px;">
            © ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();

  // Generate plain text version
  const text = `Order ${orderData.orderId} - ${orderData.status} | Bourgon Industries

Dear ${escapeHtml(orderData.customerName)},

${statusMessage}

Order Reference: #${escapeHtml(orderData.orderId)}
Amount Processed: ₹${orderData.total.toFixed(2)}

${orderData.trackingNumber && orderData.trackingNumber !== "Awaiting payment" && orderData.trackingNumber !== "Processing" 
  ? `Tracking Number: ${escapeHtml(orderData.trackingNumber)}\nTrack your order: ${escapeHtml(trackingUrl)}\n` 
  : ""}View your order: ${siteUrl}/orders/${escapeHtml(orderData.orderId)}

Questions? Contact us at +91 88008 30465 & +91 88008 30467

© ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd.`;

  await transporter.sendMail({
    from: getEmailFromField("orders"),
    to: orderData.customerEmail,
    replyTo: getReplyToEmail("orders"),
    subject,
    html,
    text,
    headers: getEmailHeaders(),
    priority: "normal",
    date: new Date(),
  });
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: "signup" | "login" | "reset" = "signup"
) {
  if (!isEmailConfigured("security") || !email) {
    return;
  }

  const transporter = nodemailer.createTransport(getEmailTransporterConfig("security"));

  const subject = `Security Verification Code | Bourgon Industries`;

  const html = `
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
        <table width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #eeeeee; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
          
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 36px; color: #ffffff; letter-spacing: 8px; text-transform: uppercase; margin: 0 0 10px 0; line-height: 1;">
                BOURGON
              </h1>
              <p style="color: #a1a1a1; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px;">
                Secure Access Portal
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #111111; margin-bottom: 20px; font-style: italic;">
                Security Verification
              </h2>
              <p style="font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 40px;">
                Your unique verification code for ${purpose === "signup" ? "creating an account" : purpose === "login" ? "accessing your profile" : "resetting your password"} is provided below.
              </p>

              <div style="background-color: #fafafa; border: 1px solid #f0f0f0; padding: 30px; margin-bottom: 30px;">
                <span style="font-size: 36px; font-weight: 400; letter-spacing: 12px; color: #b91c1c; font-family: 'Inter', sans-serif;">
                  ${otp}
                </span>
              </div>

              <p style="font-size: 11px; color: #999999; line-height: 1.8;">
                This identification code is valid for <strong>10 minutes</strong>.<br>
                For your security, do not share this token with anyone.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #ffffff; border-top: 1px solid #f9f9f9; text-align: center;">
              <p style="font-size: 10px; color: #cccccc; letter-spacing: 1px; text-transform: uppercase;">
                © ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // Generate plain text version
  const text = `Security Verification Code | Bourgon Industries

Your unique verification code for ${purpose === "signup" ? "creating an account" : purpose === "login" ? "accessing your profile" : "resetting your password"} is:

${otp}

This identification code is valid for 10 minutes.
For your security, do not share this token with anyone.

© ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd.`;

  await transporter.sendMail({
    from: getEmailFromField("security"),
    to: email,
    replyTo: getReplyToEmail("security"),
    subject,
    html,
    text,
    headers: getEmailHeaders(),
    priority: "normal",
    date: new Date(),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  if (!email) {
    throw new Error("Email address is required");
  }

  if (!isEmailConfigured("security")) {
    const errorMsg = "Email service is not configured. Please set EMAIL_SECURITY_USER and EMAIL_SECURITY_PASS environment variables.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const transporter = nodemailer.createTransport(getEmailTransporterConfig("security"));

  // Use NEXT_PUBLIC_SITE_URL if set, otherwise default to production
  // For local development, you should set NEXT_PUBLIC_SITE_URL=http://localhost:3000 in .env.local
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in";
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = `Password Reset Request | Bourgon Industries`;

  const html = `
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
        <table width="100%" style="max-width: 500px; background-color: #ffffff; border: 1px solid #eeeeee; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
          
          <tr>
            <td style="background-color: #000000; padding: 40px; text-align: center;">
              <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 36px; color: #ffffff; letter-spacing: 8px; text-transform: uppercase; margin: 0 0 10px 0; line-height: 1;">
                BOURGON
              </h1>
              <p style="color: #a1a1a1; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px;">
                Password Recovery
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 50px 40px; text-align: center;">
              <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #111111; margin-bottom: 20px; font-style: italic;">
                Reset Your Password
              </h2>
              <p style="font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 40px;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>

              <div style="margin-bottom: 30px;">
                <a href="${escapeHtml(resetUrl)}" style="display: inline-block; padding: 18px 40px; background-color: #b91c1c; color: #ffffff !important; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; transition: all 0.3s ease;">
                  Reset Password
                </a>
              </div>

              <p style="font-size: 11px; color: #999999; line-height: 1.8; margin-bottom: 20px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${escapeHtml(resetUrl)}" style="color: #b91c1c; word-break: break-all;">${escapeHtml(resetUrl)}</a>
              </p>

              <p style="font-size: 11px; color: #999999; line-height: 1.8;">
                This link will expire in <strong>1 hour</strong>.<br>
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px; background-color: #ffffff; border-top: 1px solid #f9f9f9; text-align: center;">
              <p style="font-size: 10px; color: #cccccc; letter-spacing: 1px; text-transform: uppercase;">
                © ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  // Generate plain text version
  const text = `Password Reset Request - Bourgon Industries

We received a request to reset your password.

Reset your password by clicking this link:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd.`;

  await transporter.sendMail({
    from: getEmailFromField("security"),
    to: email,
    replyTo: getReplyToEmail("security"),
    subject,
    html,
    text,
    headers: getEmailHeaders(),
    priority: "normal",
    date: new Date(),
  });
}

