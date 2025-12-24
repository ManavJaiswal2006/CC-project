import nodemailer from "nodemailer";
import { escapeHtml } from "./validation";
import { generateBillHTML } from "./billTemplate";

interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  status: string;
  trackingNumber?: string;
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
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !orderData.customerEmail) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const statusMessages: Record<string, string> = {
    "Awaiting Admin Confirmation": "Your order has been received and is awaiting confirmation.",
    "Confirmed": "Your order has been confirmed and is being prepared for shipment.",
    "Processing": "Your order is being processed and packed.",
    "Shipped": "Your order has been shipped and is on its way!",
    "Out for Delivery": "Your order is out for delivery and will arrive soon.",
    "Delivered": "Your order has been delivered. Thank you for shopping with us!",
    "Cancelled": "Your order has been cancelled as requested.",
  };

  const statusMessage = statusMessages[orderData.status] || "Your order status has been updated.";

  const subject = `Order ${orderData.orderId} - ${orderData.status} | Bourgon Industries`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-bottom: 3px solid #b91c1c;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px; font-style: italic;">
                BOURGON
              </h1>
              <p style="margin: 5px 0 0; font-size: 11px; color: #d1d5db; letter-spacing: 3px; text-transform: uppercase;">
                Beyond Quality. Beyond Design.
              </p>
            </td>
          </tr>

          <!-- Status Update -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #1f2937;">
                Order Status Update
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; color: #374151; line-height: 1.6;">
                Hi ${escapeHtml(orderData.customerName)},
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #374151; line-height: 1.6;">
                ${statusMessage}
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #b91c1c; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 600;">
                  Order Details
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Order ID:</strong> ${escapeHtml(orderData.orderId)}
                </p>
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Status:</strong> <span style="color: #b91c1c; font-weight: 700;">${escapeHtml(orderData.status)}</span>
                </p>
                ${orderData.trackingNumber && orderData.trackingNumber !== "Awaiting payment" ? `
                  <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                    <strong>Tracking Number:</strong> <span style="font-family: monospace;">${escapeHtml(orderData.trackingNumber)}</span>
                  </p>
                ` : ''}
                <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">
                  <strong>Total Amount:</strong> ₹${orderData.total.toFixed(2)}
                </p>
              </div>

              ${orderData.trackingNumber && orderData.trackingNumber !== "Awaiting payment" ? `
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #1e40af;">
                    Track Your Order
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #1e40af;">
                    Use your tracking number <strong>${escapeHtml(orderData.trackingNumber)}</strong> to track your package on the courier's website.
                  </p>
                </div>
              ` : ''}

              <div style="margin-top: 32px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.com"}/orders/${escapeHtml(orderData.orderId)}" 
                   style="display: inline-block; padding: 12px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  View Order Details
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.6;">
                If you have any questions, please contact us at<br>
                <a href="mailto:bourgonindustries@gmail.com" style="color: #b91c1c; text-decoration: none;">bourgonindustries@gmail.com</a> or call <a href="tel:+918800830465" style="color: #b91c1c; text-decoration: none;">+91 88008 30465</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 10px; color: #9ca3af;">
                © ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd. All Rights Reserved.
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

  await transporter.sendMail({
    from: `"Bourgon Orders" <${process.env.EMAIL_USER}>`,
    to: orderData.customerEmail,
    subject,
    html,
  });
}

