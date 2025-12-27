import nodemailer from "nodemailer";
import { escapeHtml } from "./validation";
import { getEmailFromField, getEmailTransporterConfig, isEmailConfigured } from "./emailConfig";

interface RefundRequestData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  refundAmount: number;
  status: "pending" | "approved" | "rejected" | "refunded";
  adminNotes?: string;
  refundId?: string;
}

export async function sendRefundRequestEmail(data: RefundRequestData) {
  if (!isEmailConfigured("refunds") || !data.customerEmail) {
    return;
  }

  const transporter = nodemailer.createTransport(getEmailTransporterConfig("refunds"));

  const subject = `Refund Request Received | Order ${data.orderId} | Bourgon Industries`;

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
    .content { padding: 50px 40px; }
    .badge { display: inline-block; padding: 6px 12px; background-color: #fdf2f2; border: 1px solid #f8d7da; color: #b91c1c; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .headline { font-family: 'Cormorant Garamond', serif; font-size: 28px; line-height: 1.2; margin-bottom: 20px; color: #111111; }
    .info-box { border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; padding: 30px 0; margin: 30px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .footer { padding: 40px; background-color: #ffffff; text-align: center; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/bourgonLogo.png" alt="Bourgon Industries" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
        </td>
      </tr>

      <tr>
        <td class="content">
          <div class="badge">REFUND REQUEST RECEIVED</div>
          <h2 class="headline">Your refund request has been received</h2>
          
          <p style="font-size: 15px; color: #555555; line-height: 1.8;">
            Dear ${escapeHtml(data.customerName)},<br><br>
            We have received your refund request for order <strong>#${escapeHtml(data.orderId)}</strong>. Our team will review your request and get back to you within 2-3 business days.
          </p>

          <div class="info-box">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Order Reference</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">#${escapeHtml(data.orderId)}</td>
              </tr>
              <tr><td height="15"></td></tr>
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">₹${data.refundAmount.toFixed(2)}</td>
              </tr>
              <tr><td height="15"></td></tr>
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Reason</td>
                <td align="right" style="font-size: 14px;">${escapeHtml(data.reason)}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #666666; line-height: 1.8;">
            You will receive an email notification once your refund request has been reviewed. If you have any questions, please contact our customer care team.
          </p>
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

  await transporter.sendMail({
    from: getEmailFromField("refunds"),
    to: data.customerEmail,
    subject,
    html,
  });
}

export async function sendRefundStatusUpdateEmail(data: RefundRequestData) {
  if (!isEmailConfigured("refunds") || !data.customerEmail) {
    return;
  }

  const transporter = nodemailer.createTransport(getEmailTransporterConfig("refunds"));

  const statusMessages: Record<string, { subject: string; message: string; badge: string }> = {
    approved: {
      subject: `Refund Request Approved | Order ${data.orderId} | Bourgon Industries`,
      message: "Your refund request has been approved! The refund will be processed shortly and credited to your original payment method within 5-7 business days.",
      badge: "APPROVED",
    },
    rejected: {
      subject: `Refund Request Update | Order ${data.orderId} | Bourgon Industries`,
      message: data.adminNotes 
        ? `We regret to inform you that your refund request could not be approved. ${escapeHtml(data.adminNotes)}`
        : "We regret to inform you that your refund request could not be approved. If you have any questions, please contact our customer care team.",
      badge: "NOT APPROVED",
    },
    refunded: {
      subject: `Refund Processed | Order ${data.orderId} | Bourgon Industries`,
      message: data.refundId
        ? `Your refund has been successfully processed! The amount of ₹${data.refundAmount.toFixed(2)} has been credited to your original payment method. Refund ID: ${escapeHtml(data.refundId)}`
        : `Your refund has been successfully processed! The amount of ₹${data.refundAmount.toFixed(2)} has been credited to your original payment method.`,
      badge: "REFUNDED",
    },
  };

  const statusInfo = statusMessages[data.status];
  if (!statusInfo) return;

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
    .content { padding: 50px 40px; }
    .badge { display: inline-block; padding: 6px 12px; background-color: ${data.status === "approved" || data.status === "refunded" ? "#f0fdf4" : "#fdf2f2"}; border: 1px solid ${data.status === "approved" || data.status === "refunded" ? "#bbf7d0" : "#f8d7da"}; color: ${data.status === "approved" || data.status === "refunded" ? "#166534" : "#b91c1c"}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .headline { font-family: 'Cormorant Garamond', serif; font-size: 28px; line-height: 1.2; margin-bottom: 20px; color: #111111; }
    .info-box { border-top: 1px solid #eeeeee; border-bottom: 1px solid #eeeeee; padding: 30px 0; margin: 30px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
    .footer { padding: 40px; background-color: #ffffff; text-align: center; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/bourgonLogo.png" alt="Bourgon Industries" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
        </td>
      </tr>

      <tr>
        <td class="content">
          <div class="badge">${statusInfo.badge}</div>
          <h2 class="headline">Refund request update</h2>
          
          <p style="font-size: 15px; color: #555555; line-height: 1.8;">
            Dear ${escapeHtml(data.customerName)},<br><br>
            ${statusInfo.message}
          </p>

          <div class="info-box">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Order Reference</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">#${escapeHtml(data.orderId)}</td>
              </tr>
              <tr><td height="15"></td></tr>
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Refund Amount</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">₹${data.refundAmount.toFixed(2)}</td>
              </tr>
              ${data.refundId ? `
              <tr><td height="15"></td></tr>
              <tr>
                <td style="font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 1px;">Refund ID</td>
                <td align="right" style="font-size: 14px; font-weight: 600;">${escapeHtml(data.refundId)}</td>
              </tr>
              ` : ""}
            </table>
          </div>

          ${data.status === "refunded" ? `
          <p style="font-size: 14px; color: #666666; line-height: 1.8;">
            Please allow 5-7 business days for the refund to reflect in your account. Thank you for your patience.
          </p>
          ` : ""}
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

  await transporter.sendMail({
    from: getEmailFromField("refunds"),
    to: data.customerEmail,
    subject: statusInfo.subject,
    html,
  });
}

