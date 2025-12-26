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

  const paymentMethodDisplay = {
    online: "Online Payment",
    razorpay: "Online Payment",
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
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@300;400;600&display=swap');
    
    body { margin: 0; padding: 0; background-color: #fcfcfc; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #fcfcfc; padding: 40px 0; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 650px; border-spacing: 0; font-family: 'Inter', sans-serif; color: #111111; border: 1px solid #e5e5e5; }
    .header { background-color: #000000; text-align: center; padding: 60px 40px; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 38px; color: #ffffff; letter-spacing: 10px; text-transform: uppercase; margin: 0; line-height: 1; }
    .logo-sub { color: #a1a1a1; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; margin-top: 12px; }
    .section-padding { padding: 40px 50px; }
    .meta-table { width: 100%; margin-bottom: 40px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888888; margin-bottom: 8px; font-weight: 600; }
    .value { font-size: 14px; font-weight: 400; color: #111111; }
    .item-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .item-header { border-bottom: 1px solid #111111; padding-bottom: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888888; }
    .item-row { border-bottom: 1px solid #f0f0f0; }
    .item-name { font-size: 14px; font-weight: 600; padding: 20px 0 5px; }
    .item-meta { font-size: 12px; color: #888888; padding-bottom: 20px; }
    .price-col { font-size: 14px; text-align: right; vertical-align: top; padding-top: 20px; }
    .total-section { padding: 30px 50px; background-color: #fafafa; border-top: 1px solid #eeeeee; }
    .total-row { display: flex; justify-content: flex-end; margin-bottom: 10px; }
    .grand-total { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; border-top: 2px solid #111111; padding-top: 15px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" align="center">
      <tr>
        <td class="header">
          <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in"}/bourgonLogo.png" alt="Bourgon Industries" style="max-width: 200px; height: auto; margin-bottom: 20px;" />
          <div style="margin-top: 30px; display: inline-block; padding: 8px 15px; border: 1px solid #444; color: #fff; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
            Official Invoice
          </div>
        </td>
      </tr>

      <tr>
        <td class="section-padding">
          <table class="meta-table">
            <tr>
              <td width="50%" valign="top">
                <div class="label">Reference ID</div>
                <div class="value" style="font-weight: 600;">#${escapeHtml(orderId)}</div>
              </td>
              <td width="50%" valign="top" align="right">
                <div class="label">Issue Date</div>
                <div class="value">${escapeHtml(orderDate)}</div>
              </td>
            </tr>
          </table>

          <table class="meta-table">
            <tr>
              <td width="50%" valign="top">
                <div class="label">Billed To</div>
                <div class="value" style="font-weight: 600;">${escapeHtml(customerName)}</div>
                <div class="value" style="color: #666; font-size: 13px;">${customerEmail ? escapeHtml(customerEmail) : ''}</div>
              </td>
              <td width="50%" valign="top">
                <div class="label">Shipping Destination</div>
                <div class="value" style="line-height: 1.6; font-size: 13px;">${escapeHtml(shippingAddress)}</div>
              </td>
            </tr>
          </table>

          <table class="item-table">
            <thead>
              <tr>
                <th align="left" class="item-header">Product Details</th>
                <th align="center" class="item-header" width="60">Qty</th>
                <th align="right" class="item-header" width="100">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item) => `
                <tr class="item-row">
                  <td>
                    <div class="item-name">${escapeHtml(item.name)}</div>
                    <div class="item-meta">
                      ${item.size ? `Size: ${escapeHtml(item.size)}` : ''}
                      ${item.discount ? ` <span style="color: #b91c1c; margin-left: 10px;">(${item.discount}% off)</span>` : ''}
                    </div>
                  </td>
                  <td align="center" class="price-col" style="color: #888;">${item.quantity}</td>
                  <td align="right" class="price-col">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </td>
      </tr>

      <tr>
        <td class="total-section">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td align="right" style="padding: 5px 0; font-size: 13px; color: #888;">Subtotal</td>
              <td align="right" width="120" style="padding: 5px 0; font-size: 13px;">₹${subtotal.toFixed(2)}</td>
            </tr>
            ${promoDiscount && promoDiscount > 0 ? `
            <tr>
              <td align="right" style="padding: 5px 0; font-size: 13px; color: #b91c1c;">Promo: ${escapeHtml(promoCode || 'Applied')}</td>
              <td align="right" style="padding: 5px 0; font-size: 13px; color: #b91c1c;">-₹${promoDiscount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td align="right" class="grand-total">Total Amount</td>
              <td align="right" class="grand-total">₹${total.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" align="right" style="padding-top: 15px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #aaa;">
                Method: ${escapeHtml(paymentMethodDisplay)}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding: 50px; background-color: #ffffff; text-align: center;">
          <div style="font-family: 'Cormorant Garamond', serif; font-size: 20px; font-style: italic; margin-bottom: 10px;">
            ${isAdmin ? 'Notification of Sales' : 'Thank you for your patronage.'}
          </div>
          <div style="font-size: 11px; color: #999; line-height: 1.8; letter-spacing: 0.5px;">
            BOURGON INDUSTRIES PVT. LTD.<br>
            B - 30, Ambedkar Colony, Chhatarpur, New Delhi - 110074<br>
            Phone: +91 88008 30465 | Email: bourgonindustries@gmail.com
          </div>
          <div style="margin-top: 30px; font-size: 10px; color: #ddd; text-transform: uppercase; letter-spacing: 2px;">
            © ${new Date().getFullYear()} All Rights Reserved.
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}
