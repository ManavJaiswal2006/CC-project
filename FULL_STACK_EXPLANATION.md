# 🎓 Complete Full Stack Development Guide - Bourgon Industries E-Commerce Platform

## 📚 Table of Contents
1. [What is This Project?](#what-is-this-project)
2. [Understanding Full Stack Development](#understanding-full-stack-development)
3. [Tech Stack Overview](#tech-stack-overview)
4. [Project Structure](#project-structure)
5. [Frontend (Client-Side) Explained](#frontend-client-side-explained)
6. [Backend (Server-Side) Explained](#backend-server-side-explained)
7. [Database Architecture](#database-architecture)
8. [Authentication System](#authentication-system)
9. [Payment Processing Flow](#payment-processing-flow)
10. [Order Management System](#order-management-system)
11. [Key Features Breakdown](#key-features-breakdown)
12. [How Everything Works Together](#how-everything-works-together)

---

## 🛍️ What is This Project?

**Bourgon Industries** is a complete **e-commerce website** (like Amazon or Flipkart) that sells stainless steel products. Think of it as a digital store where:

- Customers can browse products
- Add items to a shopping cart
- Create accounts and log in
- Place orders and pay online
- Track their orders
- Request refunds if needed

This is a **full stack application**, meaning it has both:
- **Frontend**: What users see and interact with (the website)
- **Backend**: The server that processes requests, stores data, and handles business logic

---

## 🎯 Understanding Full Stack Development

### What is "Full Stack"?

Imagine a restaurant:
- **Frontend** = The dining room (what customers see)
- **Backend** = The kitchen (where food is prepared)
- **Database** = The pantry (where ingredients are stored)

In web development:
- **Frontend** = The user interface (buttons, forms, pages)
- **Backend** = Server logic (processing orders, handling payments)
- **Database** = Where all data is stored (user info, products, orders)

---

## 🛠️ Tech Stack Overview

### Frontend Technologies

1. **Next.js 16** (React Framework)
   - **What it is**: A framework built on React that makes building websites easier
   - **Why use it**: Handles routing, server-side rendering, and optimizations automatically
   - **Think of it as**: A smart assistant that helps organize your website

2. **React 19**
   - **What it is**: A JavaScript library for building user interfaces
   - **Why use it**: Makes it easy to create interactive, reusable components
   - **Think of it as**: Building blocks (like LEGO) for your website

3. **TypeScript**
   - **What it is**: JavaScript with type checking
   - **Why use it**: Catches errors before they happen, makes code more reliable
   - **Think of it as**: A spell-checker for code

4. **Tailwind CSS**
   - **What it is**: A CSS framework for styling
   - **Why use it**: Makes styling faster with utility classes
   - **Think of it as**: Pre-made design templates

### Backend Technologies

1. **Next.js API Routes**
   - **What it is**: Server-side endpoints that handle requests
   - **Location**: `app/api/` folder
   - **Purpose**: Process payments, create orders, send emails

2. **Convex**
   - **What it is**: A backend-as-a-service (BaaS) platform
   - **Why use it**: Handles database, real-time updates, and server functions
   - **Think of it as**: Your database + server combined

3. **Firebase Authentication**
   - **What it is**: Google's authentication service
   - **Why use it**: Handles user login, signup, password reset securely
   - **Think of it as**: A security guard for your website

### Payment & Services

1. **Razorpay**
   - **What it is**: Payment gateway (like Stripe for India)
   - **Why use it**: Processes online payments securely
   - **Think of it as**: A cashier that handles money transactions

2. **Nodemailer**
   - **What it is**: Library for sending emails
   - **Why use it**: Sends order confirmations, invoices
   - **Think of it as**: A postal service for emails

---

## 📁 Project Structure

```
bourgon/
├── app/                    # Next.js app directory (pages & API routes)
│   ├── api/               # Backend API endpoints
│   ├── context/           # React Context (global state)
│   ├── shop/              # Product pages
│   ├── checkout/          # Checkout page
│   ├── orders/            # Order pages
│   └── ...
├── components/            # Reusable UI components
│   ├── home/              # Homepage components
│   ├── shop/              # Shop page components
│   ├── checkout/          # Checkout components
│   └── ...
├── convex/                # Convex backend (database & functions)
│   ├── schema.ts          # Database structure
│   ├── product.ts         # Product-related functions
│   ├── order.ts           # Order-related functions
│   └── ...
├── lib/                   # Utility functions
├── public/                # Static files (images, etc.)
└── package.json           # Dependencies list
```

---

## 🎨 Frontend (Client-Side) Explained

### What Happens in the Browser?

When a user visits your website, their browser:
1. Downloads HTML, CSS, and JavaScript files
2. Runs the JavaScript code
3. Displays the website
4. Responds to user clicks and interactions

### Key Frontend Concepts

#### 1. **React Components**

Components are like reusable building blocks. For example:

```tsx
// A button component
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}

// Use it anywhere
<Button text="Add to Cart" onClick={handleAddToCart} />
```

**In this project**: 
- `components/checkout/checkout.tsx` = The checkout page component
- `components/home/navbar.tsx` = The navigation bar component

#### 2. **React Context (Global State)**

Context lets you share data across components without passing props everywhere.

**Example from the project**:

```tsx
// CartContext.tsx - Stores shopping cart data globally
const CartContext = createContext();

// Any component can access the cart
function CheckoutPage() {
  const { cart, addToCart, cartTotal } = useCart();
  // Now you can use cart data here!
}
```

**Three main contexts in this project**:
- `AuthContext`: Stores user login status
- `CartContext`: Stores shopping cart items
- `ProfessionalModeContext`: Stores distributor/customer mode

#### 3. **Pages (Next.js App Router)**

In Next.js, each folder in `app/` becomes a route:

```
app/
├── page.tsx              → https://yoursite.com/
├── shop/page.tsx         → https://yoursite.com/shop
├── checkout/page.tsx     → https://yoursite.com/checkout
└── orders/[orderid]/page.tsx → https://yoursite.com/orders/12345
```

The `[orderid]` is a dynamic route - it can be any order ID.

### Frontend Flow Example: Adding to Cart

1. User clicks "Add to Cart" button
2. JavaScript function runs: `addToCart(item)`
3. Item is added to `CartContext` state
4. Cart is saved to `localStorage` (browser storage)
5. UI updates to show new item count
6. Toast notification appears: "Item added to cart!"

**Code location**: `app/context/CartContext.tsx`

---

## ⚙️ Backend (Server-Side) Explained

### What Happens on the Server?

The server:
1. Receives requests from the frontend
2. Processes the request (validate data, check permissions)
3. Interacts with the database
4. Sends a response back

### API Routes (Next.js)

API routes are server endpoints that handle specific tasks.

**Example**: Creating an order

```typescript
// app/api/orders/route.ts
export async function POST(req: Request) {
  // 1. Get data from request
  const { userId, items, total } = await req.json();
  
  // 2. Validate the data
  if (!userId || !items) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  
  // 3. Create order in database
  const orderId = await createOrderInDatabase(userId, items, total);
  
  // 4. Send email confirmation
  await sendEmail(userId, orderId);
  
  // 5. Return response
  return NextResponse.json({ success: true, orderId });
}
```

**Key API Routes in this project**:
- `/api/orders` - Create new orders
- `/api/razorpay/create-order` - Initialize payment
- `/api/razorpay/verify-payment` - Verify payment after completion
- `/api/otp/generate` - Generate OTP for login
- `/api/refunds/request` - Handle refund requests

### Convex Backend Functions

Convex provides two types of functions:

1. **Queries** (Read data)
   ```typescript
   // convex/product.ts
   export const getProducts = query({
     handler: async (ctx) => {
       return await ctx.db.query("products").collect();
     }
   });
   ```

2. **Mutations** (Write data)
   ```typescript
   // convex/order.ts
   export const createOrder = mutation({
     args: { userId: v.string(), items: v.any() },
     handler: async (ctx, args) => {
       return await ctx.db.insert("orders", {
         userId: args.userId,
         items: args.items,
         // ...
       });
     }
   });
   ```

**How frontend uses Convex**:
```tsx
// In a React component
const products = useQuery(api.product.getProducts);
// This automatically fetches products and updates when data changes!
```

---

## 🗄️ Database Architecture

### What is a Database?

A database is like a digital filing cabinet that stores:
- User information
- Product details
- Orders
- Reviews
- etc.

### Convex Schema (Database Structure)

The schema defines what data you can store. Think of it as a blueprint.

**Example from `convex/schema.ts`**:

```typescript
export default defineSchema({
  // Users table
  users: defineTable({
    userId: v.string(),        // Firebase user ID
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    addresses: v.array(...),  // Array of saved addresses
  }),
  
  // Products table
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    soldOut: v.boolean(),
    // ...
  }),
  
  // Orders table
  orders: defineTable({
    userId: v.string(),
    orderId: v.string(),
    items: v.any(),           // Cart items snapshot
    totalAmount: v.number(),
    status: v.string(),        // "pending", "confirmed", "shipped", etc.
    // ...
  }),
});
```

### Database Relationships

Tables are connected through IDs:

```
User (userId: "abc123")
  └── Orders (userId: "abc123")
       └── Order Items (orderId: "ORD-001")
```

**In this project**:
- `users.userId` → links to `orders.userId`
- `orders.orderId` → links to `orderStatusHistory.orderId`
- `products._id` → links to `wishlist.productId`

---

## 🔐 Authentication System

### How User Login Works

1. **User enters email/password** → Frontend sends to Firebase
2. **Firebase validates credentials** → Returns user token if valid
3. **Token stored in browser** → Used for future requests
4. **AuthContext updates** → All components know user is logged in

**Code flow**:

```tsx
// 1. User logs in (app/login/page.tsx)
await signInWithEmailAndPassword(auth, email, password);

// 2. Firebase returns user object
// 3. AuthContext detects change (app/context/AuthContext.tsx)
onAuthStateChanged(auth, (user) => {
  setUser(user); // Update global state
});

// 4. Any component can check login status
const { user } = useAuth();
if (user) {
  // User is logged in!
}
```

### Protected Routes

Some pages require login. Example:

```tsx
// components/auth/ProtectedRoute.tsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Redirect to="/login" />;
  
  return children; // Show protected content
}
```

**Protected pages in this project**:
- `/checkout` - Must be logged in to checkout
- `/orders` - Must be logged in to view orders
- `/account` - Must be logged in to view account

---

## 💳 Payment Processing Flow

### Complete Payment Journey

Let's trace what happens when a user pays:

#### Step 1: User Clicks "Place Order"
```tsx
// components/checkout/checkout.tsx
const handlePlaceOrder = async () => {
  // User filled form, clicked "Place Order"
}
```

#### Step 2: Create Razorpay Order
```typescript
// Frontend calls API
const orderRes = await fetch("/api/razorpay/create-order", {
  method: "POST",
  body: JSON.stringify({ amount: 1000, currency: "INR" })
});

// Backend (app/api/razorpay/create-order/route.ts)
const razorpay = new Razorpay({ key_id, key_secret });
const order = await razorpay.orders.create({
  amount: 1000 * 100, // Convert to paise
  currency: "INR"
});
// Returns: { orderId: "order_xxx", amount: 100000 }
```

#### Step 3: Open Razorpay Checkout
```tsx
// Frontend opens Razorpay payment popup
openRazorpay({
  key: "rzp_test_xxx",
  amount: 100000,
  order_id: "order_xxx",
  handler: async (response) => {
    // User completed payment!
    // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  }
});
```

#### Step 4: Verify Payment
```typescript
// Frontend sends payment details to backend
await fetch("/api/razorpay/verify-payment", {
  method: "POST",
  body: JSON.stringify({
    razorpay_payment_id: "pay_xxx",
    razorpay_order_id: "order_xxx",
    razorpay_signature: "sig_xxx"
  })
});

// Backend verifies signature (app/api/razorpay/verify-payment/route.ts)
const crypto = require("crypto");
const generatedSignature = crypto
  .createHmac("sha256", RAZORPAY_SECRET)
  .update(orderId + "|" + paymentId)
  .digest("hex");

if (generatedSignature === receivedSignature) {
  // Payment is legitimate!
  // Create order in database
  await createOrder(userId, items, total);
}
```

#### Step 5: Redirect to Success Page
```tsx
router.push(`/payment/success?orderId=${orderId}`);
```

### Payment Methods

This project supports two payment methods:

1. **Online Payment** (Card/UPI/Net Banking)
   - Uses Razorpay
   - Payment happens immediately
   - Order created after payment verification

2. **Cash on Delivery (COD)**
   - No payment gateway needed
   - Order created directly
   - Customer pays when product arrives
   - Extra ₹40 handling fee

---

## 📦 Order Management System

### Order Lifecycle

```
1. Order Placed
   ↓
2. Order Confirmed
   ↓
3. Processing
   ↓
4. Shipped (tracking number added)
   ↓
5. Out for Delivery
   ↓
6. Delivered
```

### How Orders Are Created

**For COD Orders**:
```typescript
// components/checkout/checkout.tsx
if (paymentMethod === "cod") {
  // Direct API call - no payment gateway
  await fetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      userId, items, total, paymentMethod: "cod"
    })
  });
}
```

**For Online Payments**:
```typescript
// Payment happens first, then order is created
// In verify-payment route:
await fetch("/api/orders", {
  method: "POST",
  body: JSON.stringify({ userId, items, total, paymentMethod: "online" })
});
```

### Order Status Updates

Orders have a status history stored in `orderStatusHistory` table:

```typescript
// When admin updates order status
await ctx.db.insert("orderStatusHistory", {
  orderId: "ORD-001",
  status: "shipped",
  message: "Order shipped via BlueDart",
  timestamp: Date.now(),
  updatedBy: adminUserId
});
```

### Email Notifications

When order status changes, emails are sent:

```typescript
// lib/emailNotifications.ts
await sendOrderStatusEmail({
  orderId,
  customerEmail,
  status: "Shipped",
  trackingNumber: "BD123456789"
});
```

---

## 🎯 Key Features Breakdown

### 1. Shopping Cart

**How it works**:
- Items stored in browser `localStorage` (persists after refresh)
- Also stored in React Context (for real-time updates)
- Each item has: id, name, price, quantity, size/color variants

**Code**: `app/context/CartContext.tsx`

### 2. Product Variants

Products can have different variants:
- **Size-based**: Small, Medium, Large (different prices)
- **Color-based**: Red, Blue, Green
- **Subproduct-based**: Fork, Spoon, Knife (in a set)

**Code**: `convex/schema.ts` (products table)

### 3. Promo Codes

**Flow**:
1. User enters promo code
2. Frontend validates with Convex: `api.promo.validatePromo`
3. If valid, discount applied to total
4. Discount saved with order

**Code**: 
- Validation: `convex/promo.ts`
- Application: `components/checkout/checkout.tsx`

### 4. Wishlist

**How it works**:
- Products saved to `wishlist` table in database
- Linked to user ID
- Can add/remove from any product page

**Code**: `convex/wishlist.ts`

### 5. Reviews & Ratings

**Structure**:
- Reviews linked to products
- Only verified purchasers can review
- Ratings from 1-5 stars

**Code**: `convex/review.ts`

### 6. Distributor System

**Two user types**:
- **Customer**: Regular buyer, standard prices
- **Distributor**: Bulk buyer, discounted prices

**How it works**:
1. User applies to become distributor
2. Admin reviews application
3. If approved, user role changed to "distributor"
4. Products show distributor prices

**Code**: 
- Application: `convex/distributorApplications.ts`
- Pricing: `convex/product.ts` (calculates prices based on role)

### 7. Refund System

**Flow**:
1. User requests refund (with reason + photo)
2. Request saved to `refundRequests` table
3. Admin reviews request
4. If approved, refund processed via Razorpay
5. Money returned to customer

**Code**: 
- Request: `app/api/refunds/request/route.ts`
- Processing: `app/api/refunds/process/route.ts`

---

## 🔄 How Everything Works Together

### Complete User Journey: Buying a Product

Let's trace a complete flow:

#### 1. User Visits Homepage
```
User → Browser → Next.js Server
     → Renders app/page.tsx
     → Shows Hero component
```

#### 2. User Browses Products
```
User clicks "Shop" 
  → Navigates to /shop
  → Next.js renders app/shop/page.tsx
  → Component calls: useQuery(api.product.getProducts)
  → Convex fetches products from database
  → Products displayed on screen
```

#### 3. User Views Product Details
```
User clicks product
  → Navigates to /shop/[id]
  → Component calls: useQuery(api.product.getProduct, { id })
  → Product details fetched
  → User selects size/color
  → Clicks "Add to Cart"
  → addToCart() called (CartContext)
  → Item saved to localStorage + Context state
```

#### 4. User Goes to Checkout
```
User clicks "Checkout"
  → Navigates to /checkout
  → ProtectedRoute checks if logged in
  → If not logged in → redirect to /login
  → If logged in → Shows checkout form
  → User fills name, address
  → Selects payment method
  → Applies promo code (optional)
  → Clicks "Place Order"
```

#### 5. Order Processing (COD)
```
handlePlaceOrder() called
  → Validates form data
  → If COD:
     → POST /api/orders
     → Backend validates data
     → Creates order in Convex: api.order.createOrder
     → Sends confirmation email
     → Clears cart
     → Redirects to /orders/[orderId]
```

#### 6. Order Processing (Online Payment)
```
handlePlaceOrder() called
  → POST /api/razorpay/create-order
  → Backend creates Razorpay order
  → Returns order ID + key
  → Frontend opens Razorpay popup
  → User enters card details
  → Razorpay processes payment
  → Payment success → POST /api/razorpay/verify-payment
  → Backend verifies signature
  → Creates order in Convex
  → Sends confirmation email
  → Redirects to /payment/success
```

#### 7. Order Tracking
```
User visits /orders/[orderId]
  → Component calls: useQuery(api.order.getOrder, { orderId })
  → Fetches order + status history
  → Displays order details, tracking info
  → User can cancel/request refund
```

---

## 🎓 Learning Path for Beginners

### Week 1: Understanding the Basics
1. Learn HTML, CSS, JavaScript fundamentals
2. Understand what React is (components, props, state)
3. Learn about APIs and HTTP requests

### Week 2: Next.js Basics
1. Understand Next.js file-based routing
2. Learn about Server Components vs Client Components
3. Practice creating pages

### Week 3: State Management
1. Learn React Context API
2. Understand when to use Context vs Props
3. Practice with CartContext example

### Week 4: Backend Concepts
1. Learn about API routes
2. Understand request/response cycle
3. Practice creating simple API endpoints

### Week 5: Database
1. Learn about databases (SQL vs NoSQL)
2. Understand Convex schema
3. Practice queries and mutations

### Week 6: Authentication
1. Learn about Firebase Auth
2. Understand tokens and sessions
3. Practice protecting routes

### Week 7: Payment Integration
1. Learn about payment gateways
2. Understand Razorpay flow
3. Practice with test payments

### Week 8: Advanced Features
1. Email sending with Nodemailer
2. File uploads
3. Error handling and validation

---

## 🔍 Key Files to Study

### Frontend Files (Start Here)
1. `app/context/CartContext.tsx` - Shopping cart logic
2. `app/context/AuthContext.tsx` - Authentication logic
3. `components/checkout/checkout.tsx` - Complete checkout flow
4. `components/shop/shop.tsx` - Product listing page

### Backend Files
1. `app/api/orders/route.ts` - Order creation API
2. `app/api/razorpay/create-order/route.ts` - Payment initialization
3. `convex/order.ts` - Order database functions
4. `convex/product.ts` - Product database functions

### Database
1. `convex/schema.ts` - Complete database structure

---

## 💡 Common Patterns in This Project

### 1. Loading States
```tsx
const [loading, setLoading] = useState(false);

if (loading) {
  return <Loader />;
}
```

### 2. Error Handling
```tsx
try {
  await someOperation();
} catch (error) {
  setError(error.message);
}
```

### 3. Form Validation
```tsx
if (!name.trim() || !address.trim()) {
  setError("Please fill all fields");
  return;
}
```

### 4. Protected Routes
```tsx
const { user } = useAuth();
if (!user) {
  router.push("/login");
  return null;
}
```

---

## 🚀 Next Steps

1. **Run the project locally**
   ```bash
   npm install
   npm run dev
   ```

2. **Explore the code**
   - Start with `app/page.tsx` (homepage)
   - Follow user journey through code

3. **Make small changes**
   - Change button text
   - Modify colors
   - Add console.logs to understand flow

4. **Read the documentation**
   - Next.js docs: https://nextjs.org/docs
   - React docs: https://react.dev
   - Convex docs: https://docs.convex.dev

5. **Build something similar**
   - Start with a simple todo app
   - Add authentication
   - Add a database
   - Gradually increase complexity

---

## 📝 Summary

This project is a **complete e-commerce platform** built with:

- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Convex
- **Database**: Convex (NoSQL)
- **Authentication**: Firebase Auth
- **Payments**: Razorpay
- **Emails**: Nodemailer

**Key Concepts**:
- Components (reusable UI pieces)
- Context (global state)
- API Routes (server endpoints)
- Database Queries/Mutations (data operations)
- Authentication (user login)
- Payment Processing (handling money)

**Remember**: Full stack development is about connecting the frontend (what users see) with the backend (server logic) and database (data storage) to create a complete application.

---

## ❓ Questions to Test Your Understanding

1. What happens when a user clicks "Add to Cart"?
2. How does the checkout page know if a user is logged in?
3. What's the difference between a Query and a Mutation in Convex?
4. How does Razorpay payment verification work?
5. Where is the shopping cart data stored?
6. How are orders created differently for COD vs Online payment?
7. What is the purpose of React Context in this project?
8. How does the database schema relate to the actual data?

---

**Happy Learning! 🎉**

If you have questions about any specific part, feel free to ask!

