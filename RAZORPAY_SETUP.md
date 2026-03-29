# Razorpay Integration Setup Guide

## ✅ Integration Complete!

Razorpay has been successfully integrated into your e-commerce website. Here's what was added:

## 📦 What's Included

### 1. **API Routes**
- ✅ `/api/razorpay/create-order` - Creates Razorpay payment order
- ✅ `/api/razorpay/verify-payment` - Verifies payment and creates order

### 2. **Payment Pages**
- ✅ `/payment/success` - Payment success page
- ✅ `/payment/failure` - Payment failure page

### 3. **Updated Components**
- ✅ Checkout component now uses Razorpay for Card/UPI payments
- ✅ COD still works as before (direct order creation)

### 4. **Utilities**
- ✅ Razorpay script loader (`lib/razorpay.ts`)
- ✅ Payment verification logic

## 🔧 Setup Instructions

### Step 1: Get Razorpay Keys

1. **Sign up** at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate **Test Keys** (for development) or **Live Keys** (for production)
4. Copy your **Key ID** and **Key Secret**

### Step 2: Add Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**For Production:**
- Use `rzp_live_` prefix for Key ID
- Use your live Key Secret

### Step 3: Install Dependencies

```bash
npm install razorpay
```

## 🎯 How It Works

### Payment Flow:

1. **Customer selects Card/UPI** in checkout
2. **Clicks "Place Order"**
3. **Razorpay checkout opens** (modal)
4. **Customer completes payment**
5. **Payment is verified** on server
6. **Order is created** in database
7. **Customer redirected** to success page

### COD Flow (Unchanged):

1. **Customer selects COD**
2. **Order created immediately**
3. **Payment status: Pending**
4. **Admin confirms later**

## 💳 Payment Methods Supported

- ✅ **Card** - Visa, MasterCard, Amex, etc.
- ✅ **UPI** - GPay, PhonePe, Paytm, etc.
- ✅ **Net Banking** - All major banks
- ✅ **Wallets** - Paytm, Freecharge, etc.
- ✅ **COD** - Cash on Delivery (unchanged)

## 🔒 Security Features

- ✅ **Payment signature verification** - Prevents fraud
- ✅ **Server-side verification** - All payments verified on backend
- ✅ **Secure key storage** - Keys in environment variables
- ✅ **Order creation after payment** - Only creates order if payment succeeds

## 📝 Testing

### Test Cards (Razorpay Test Mode):

**Success:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI IDs:
- `success@razorpay`
- `failure@razorpay`

## 🚨 Important Notes

### 1. **Payment Verification**
- All payments are verified on the server before order creation
- Never trust client-side payment data
- Signature verification prevents tampering

### 2. **Order Creation**
- Orders are created **after** payment verification
- Razorpay payments: Status = "Paid", Order Status = "Confirmed"
- COD: Status = "Pending", Order Status = "Awaiting Admin Confirmation"

### 3. **Error Handling**
- Payment failures redirect to `/payment/failure`
- Payment cancellations show error message
- All errors are logged for debugging

### 4. **Webhooks (Optional)**
For production, consider setting up Razorpay webhooks:
- Go to Razorpay Dashboard → Settings → Webhooks
- Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
- Handle events: `payment.captured`, `payment.failed`

## 📊 Order Status Flow

### Razorpay Payments:
```
Payment Successful
    ↓
Payment Verified
    ↓
Order Created (Status: "Confirmed", Payment: "Paid")
    ↓
Admin Processes Order
    ↓
Order Shipped
    ↓
Order Delivered
```

### COD:
```
Order Created (Status: "Awaiting Admin Confirmation", Payment: "Pending")
    ↓
Admin Confirms
    ↓
Order Shipped
    ↓
Payment Collected on Delivery
    ↓
Order Delivered
```

## 🐛 Troubleshooting

### Issue: "Razorpay not configured"
- **Solution**: Check `.env.local` has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

### Issue: Payment modal doesn't open
- **Solution**: Check browser console for errors, ensure Razorpay script loads

### Issue: Payment succeeds but order not created
- **Solution**: Check server logs, verify payment verification API route

### Issue: "Invalid payment signature"
- **Solution**: Ensure `RAZORPAY_KEY_SECRET` matches your Razorpay account

## 📱 Mobile Support

- ✅ Razorpay checkout works on mobile browsers
- ✅ Responsive payment modal
- ✅ UPI apps open automatically on mobile

## 🎉 Ready to Use!

Your Razorpay integration is complete and ready for:
- ✅ Test payments (with test keys)
- ✅ Production payments (with live keys)
- ✅ All payment methods (Card, UPI, Net Banking, Wallets)
- ✅ Secure payment processing
- ✅ Automatic order creation

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Support**: support@razorpay.com
- **Your Email**: cc-projectindustries@gmail.com

---

**Next Steps:**
1. Add Razorpay keys to `.env.local`
2. Test with test cards
3. Switch to live keys for production
4. Set up webhooks (optional but recommended)

Happy selling! 🚀

