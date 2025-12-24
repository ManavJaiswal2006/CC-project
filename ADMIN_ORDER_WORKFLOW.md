# Admin Order Workflow Guide

This guide explains what you need to do as an admin when a customer places an order.

## 📋 Order Placement Flow

When a customer places an order:
1. **Order is created** with status: `"Awaiting Admin Confirmation"`
2. **Payment status** is set to: `"Pending"`
3. **Emails are sent**:
   - Customer receives order confirmation email with invoice
   - Admin receives notification email (if configured)

## 🔧 Admin Actions Required

### Step 1: Review New Orders

1. Go to **Admin Panel** → `/admin2424/orders`
2. Look for orders with status: **"Awaiting Admin Confirmation"**
3. You can filter by:
   - Status: Select "Awaiting Admin Confirmation"
   - Payment Status: Select "Pending"
   - Search by Order ID, Customer Name, or Email

### Step 2: Verify Order Details

1. Click **"View"** on any order to see full details
2. Review:
   - ✅ Customer information (name, email, address)
   - ✅ Order items and quantities
   - ✅ Total amount
   - ✅ Payment method (Card/UPI/COD)
   - ✅ Shipping address
   - ✅ Promo code used (if any)

### Step 3: Process Payment

#### For Card/UPI Payments:
1. **Check your payment gateway** (Razorpay, Stripe, etc.) for payment confirmation
2. If payment is **confirmed**:
   - Update **Payment Status** to: `"Paid"`
   - Update **Order Status** to: `"Confirmed"` or `"Processing"`
3. If payment is **failed/pending**:
   - Keep status as `"Pending"`
   - Contact customer if needed

#### For COD (Cash on Delivery):
1. Payment status remains `"Pending"` until delivery
2. Update **Order Status** to: `"Confirmed"` to proceed with shipping
3. Payment will be collected on delivery

### Step 4: Confirm Order

1. In the order details page:
   - Set **Order Status** to: `"Confirmed"` or `"Processing"`
   - If payment is received, set **Payment Status** to: `"Paid"`
2. Click **"Update Order"**
3. **Customer will automatically receive** an email notification

### Step 5: Prepare Shipment

1. **Check inventory**:
   - Verify all items are in stock
   - If any item is out of stock, contact customer
2. **Prepare the order**:
   - Pack items carefully
   - Include invoice (PDF available)
3. **Generate shipping label** (if using shipping service)

### Step 6: Ship Order

1. **Update Order Status** to: `"Shipped"`
2. **Add Tracking Number**:
   - Enter tracking number from courier service
   - Format: e.g., "DT123456789IN"
3. Click **"Update Order"**
4. **Customer will automatically receive**:
   - Email with tracking information
   - Order status update

### Step 7: Track Delivery

1. Monitor tracking number
2. When delivered:
   - Update **Order Status** to: `"Delivered"`
   - For COD orders, update **Payment Status** to: `"Paid"`
3. **Customer receives** delivery confirmation email

## 🚨 Important Status Updates

### Order Status Flow:
```
Awaiting Admin Confirmation
    ↓
Confirmed / Processing
    ↓
Shipped
    ↓
Delivered
```

### Payment Status:
- **Pending**: Payment not received yet
- **Paid**: Payment confirmed

## 📧 Email Notifications

The system automatically sends emails to customers when you:
- ✅ Confirm the order
- ✅ Mark payment as paid
- ✅ Ship the order (with tracking)
- ✅ Mark as delivered

**No manual email sending required!**

## 🎯 Quick Actions

### Common Scenarios:

#### Scenario 1: Payment Received (Card/UPI)
1. Go to order details
2. Set Payment Status: `"Paid"`
3. Set Order Status: `"Confirmed"`
4. Click Update
5. ✅ Customer notified automatically

#### Scenario 2: COD Order
1. Go to order details
2. Set Order Status: `"Confirmed"`
3. Keep Payment Status: `"Pending"`
4. Click Update
5. Proceed to shipping

#### Scenario 3: Order Shipped
1. Go to order details
2. Set Order Status: `"Shipped"`
3. Enter Tracking Number
4. Click Update
5. ✅ Customer receives tracking info

#### Scenario 4: Order Delivered
1. Go to order details
2. Set Order Status: `"Delivered"`
3. If COD, set Payment Status: `"Paid"`
4. Click Update
5. ✅ Customer receives confirmation

## 🔍 Finding Orders

### Filter Options:
- **By Status**: All, Awaiting Admin Confirmation, Confirmed, Shipped, Delivered
- **By Payment**: All, Pending, Paid
- **By Search**: Order ID, Customer Name, Email

### Export Orders:
- Click **"Export CSV"** to download order data
- Useful for accounting/reporting

## ⚠️ Troubleshooting

### Order Not Showing?
- Check if you're logged in as admin
- Verify order was actually placed
- Check filters aren't hiding it

### Email Not Sending?
- Check email configuration in `.env`
- Verify customer email is correct
- Check spam folder

### Payment Status Confusion?
- **Card/UPI**: Check payment gateway dashboard
- **COD**: Payment status stays "Pending" until delivery

## 📊 Order Management Tips

1. **Check orders daily** - Don't let orders sit in "Awaiting Admin Confirmation"
2. **Update status promptly** - Customers appreciate quick updates
3. **Add tracking numbers** - Helps customers track their orders
4. **Verify addresses** - Especially for COD orders
5. **Keep inventory updated** - Prevents overselling

## 🎁 Additional Features

### Order Cancellation Requests
- Customers can request cancellations
- View requests in order details
- Approve/reject with notes

### Order History
- View complete status history
- See all updates and timestamps
- Track who made changes

### Invoice Generation
- Customers can download PDF invoices
- Available in order details page
- Includes all order information

## 📞 Support

If you encounter issues:
1. Check order details page for error messages
2. Verify admin API key is set in environment variables
3. Check email service configuration
4. Review order status history for clues

---

**Remember**: The system handles email notifications automatically. Focus on verifying orders, updating statuses, and ensuring smooth fulfillment!

