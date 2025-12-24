import { escapeHtml } from "./validation";

interface CartItem {
  id: string;
  name: string;
  image?: string;
  size?: string | null;
  price: number;
  basePrice?: number;
  discount?: number;
  quantity: number;
}

interface BillData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail?: string;
  shippingAddress: string;
  items: CartItem[];
  subtotal: number;
  promoDiscount?: number;
  promoCode?: string;
  total: number;
  paymentMethod: string;
}

export function generateBillHTML(data: BillData, isAdmin: boolean = false): string {
  const {
    orderId,
    orderDate,
    customerName,
    customerEmail,
    shippingAddress,
    items,
    subtotal,
    promoDiscount,
    promoCode,
    total,
    paymentMethod,
  } = data;

  // Calculate item totals
  const itemsWithTotals = items.map((item) => ({
    ...item,
    itemTotal: item.price * item.quantity,
  }));

  // Format payment method display
  const paymentMethodDisplay = {
    card: "Credit/Debit Card",
    upi: "UPI",
    cod: "Cash on Delivery",
  }[paymentMethod] || paymentMethod;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${escapeHtml(orderId)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-bottom: 3px solid #b91c1c;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px; font-style: italic;">
                      BOURGON
                    </h1>
                    <p style="margin: 5px 0 0; font-size: 11px; color: #d1d5db; letter-spacing: 3px; text-transform: uppercase;">
                      Beyond Quality. Beyond Design.
                    </p>
                  </td>
                  <td align="right">
                    <div style="background-color: #ffffff; padding: 12px 20px; border-radius: 4px; display: inline-block;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                        Invoice
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 8px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Order Number
                    </p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">
                      ${escapeHtml(orderId)}
                    </p>
                  </td>
                  <td width="50%" valign="top" align="right">
                    <p style="margin: 0 0 8px; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Order Date
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #1f2937;">
                      ${escapeHtml(orderDate)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer & Shipping Info -->
          <tr>
            <td style="padding: 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Bill To
                    </p>
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1f2937;">
                      ${escapeHtml(customerName)}
                    </p>
                    ${customerEmail ? `<p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">${escapeHtml(customerEmail)}</p>` : ''}
                  </td>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 12px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Ship To
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #1f2937; line-height: 1.6; white-space: pre-line;">
                      ${escapeHtml(shippingAddress)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                    <th align="left" style="padding: 12px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Item
                    </th>
                    <th align="center" style="padding: 12px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Qty
                    </th>
                    <th align="right" style="padding: 12px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Price
                    </th>
                    <th align="right" style="padding: 12px 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsWithTotals.map((item) => `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                      <td style="padding: 16px 0;">
                        <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1f2937;">
                          ${escapeHtml(item.name)}
                        </p>
                        ${item.size ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">Size: ${escapeHtml(item.size)}</p>` : ''}
                        ${item.discount && item.discount > 0 ? `<p style="margin: 4px 0 0; font-size: 11px; color: #b91c1c;">Discount: ${item.discount}%</p>` : ''}
                      </td>
                      <td align="center" style="padding: 16px 0; font-size: 14px; color: #1f2937;">
                        ${item.quantity}
                      </td>
                      <td align="right" style="padding: 16px 0; font-size: 14px; color: #1f2937;">
                        ₹${item.price.toFixed(2)}
                      </td>
                      <td align="right" style="padding: 16px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                        ₹${item.itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" align="right" style="max-width: 300px;">
                <tr>
                  <td align="right" style="padding: 8px 0;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280;">
                      Subtotal
                    </p>
                  </td>
                  <td align="right" style="padding: 8px 0; padding-left: 20px;">
                    <p style="margin: 0; font-size: 13px; color: #1f2937;">
                      ₹${subtotal.toFixed(2)}
                    </p>
                  </td>
                </tr>
                ${promoDiscount && promoDiscount > 0 ? `
                  <tr>
                    <td align="right" style="padding: 8px 0;">
                      <p style="margin: 0; font-size: 13px; color: #6b7280;">
                        Promo Code ${promoCode ? `(${escapeHtml(promoCode)})` : ''}
                      </p>
                    </td>
                    <td align="right" style="padding: 8px 0; padding-left: 20px;">
                      <p style="margin: 0; font-size: 13px; color: #b91c1c;">
                        -₹${promoDiscount.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ` : ''}
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td align="right" style="padding: 16px 0 8px;">
                    <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">
                      Total
                    </p>
                  </td>
                  <td align="right" style="padding: 16px 0 8px; padding-left: 20px;">
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1f2937;">
                      ₹${total.toFixed(2)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" align="right" style="padding: 8px 0;">
                    <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                      Payment Method: ${escapeHtml(paymentMethodDisplay)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-top: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #1f2937; text-transform: uppercase; letter-spacing: 1px;">
                      Bourgon Industries Pvt. Ltd.
                    </p>
                    <p style="margin: 0 0 4px; font-size: 11px; color: #6b7280; line-height: 1.6;">
                      B - 30, Ambedkar Colony, Chhatarpur<br>
                      New Delhi - 110074, India
                    </p>
                    <p style="margin: 8px 0 4px; font-size: 11px; color: #6b7280;">
                      Email: <a href="mailto:bourgonindustries@gmail.com" style="color: #b91c1c; text-decoration: none;">bourgonindustries@gmail.com</a>
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #6b7280;">
                      Phone: <a href="tel:+918800830465" style="color: #b91c1c; text-decoration: none;">+91 88008 30465</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thank You Message -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #ffffff;">
              ${isAdmin ? `
                <p style="margin: 0; font-size: 12px; color: #6b7280; font-style: italic;">
                  This is a notification of a new order. Please process and confirm payment.
                </p>
              ` : `
                <p style="margin: 0 0 8px; font-size: 14px; color: #1f2937; font-weight: 600;">
                  Thank you for your order!
                </p>
                <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.6;">
                  We're preparing your order with care. You'll receive another email when your order ships.<br>
                  Track your order anytime using your Order ID: <strong>${escapeHtml(orderId)}</strong>
                </p>
              `}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

