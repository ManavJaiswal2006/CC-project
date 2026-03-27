# 🏗️ Architecture Diagrams - Bourgon Industries

## Visual Guide to System Architecture

---

## 📊 High-Level Architecture :

```
┌─────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   Context    │  │  localStorage │      │
│  │  Components  │  │  (State)     │  │   (Cart)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  API Routes  │  │  Middleware  │      │
│  │  (Routes)    │  │  (Backend)   │  │  (Security)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   CONVEX     │  │   FIREBASE   │  │   RAZORPAY   │
│  (Database)  │  │   (Auth)     │  │  (Payments)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔄 Data Flow: Adding to Cart

```
User clicks "Add to Cart"
         │
         ▼
┌────────────────────┐
│  Product Page      │
│  Component         │
└────────────────────┘
         │
         │ addToCart(item)
         ▼
┌────────────────────┐
│  CartContext       │
│  - Updates state   │
│  - Saves to        │
│    localStorage    │
└────────────────────┘
         │
         │ State update
         ▼
┌────────────────────┐
│  UI Updates        │
│  - Cart icon shows │
│    new count       │
│  - Toast appears   │
└────────────────────┘
```

---

## 🔄 Data Flow: User Login

```
User enters email/password
         │
         ▼
┌────────────────────┐
│  Login Page        │
│  Component         │
└────────────────────┘
         │
         │ signInWithEmailAndPassword()
         ▼
┌────────────────────┐
│  Firebase Auth     │
│  - Validates       │
│  - Returns token   │
└────────────────────┘
         │
         │ User object + token
         ▼
┌────────────────────┐
│  AuthContext       │
│  - Updates state   │
│  - Stores user     │
└────────────────────┘
         │
         │ State update
         ▼
┌────────────────────┐
│  All Components    │
│  - Can access user │
│  - Show user menu  │
└────────────────────┘
```

---

## 🔄 Data Flow: Placing an Order (COD)

```
User clicks "Place Order"
         │
         ▼
┌────────────────────┐
│  Checkout Page     │
│  - Validates form  │
│  - Prepares data   │
└────────────────────┘
         │
         │ POST /api/orders
         ▼
┌────────────────────┐
│  API Route         │
│  /api/orders       │
│  - Validates data  │
│  - Rate limiting   │
└────────────────────┘
         │
         │ fetchMutation(api.order.createOrder)
         ▼
┌────────────────────┐
│  Convex Mutation   │
│  - Creates order   │
│  - Saves to DB     │
│  - Returns orderId │
└────────────────────┘
         │
         │ orderId
         ▼
┌────────────────────┐
│  API Route         │
│  - Sends email     │
│  - Returns success │
└────────────────────┘
         │
         │ { success: true, orderId }
         ▼
┌────────────────────┐
│  Frontend          │
│  - Clears cart     │
│  - Redirects to    │
│    /orders/[id]    │
└────────────────────┘
```

---

## 🔄 Data Flow: Online Payment

```
User clicks "Place Order"
         │
         ▼
┌────────────────────┐
│  Checkout Page     │
│  - Validates form  │
└────────────────────┘
         │
         │ POST /api/razorpay/create-order
         ▼
┌────────────────────┐
│  API Route         │
│  - Creates Razorpay│
│    order           │
│  - Returns orderId │
└────────────────────┘
         │
         │ { orderId, key, amount }
         ▼
┌────────────────────┐
│  Frontend          │
│  - Opens Razorpay  │
│    checkout popup  │
└────────────────────┘
         │
         │ User enters card details
         ▼
┌────────────────────┐
│  Razorpay         │
│  - Processes       │
│    payment         │
│  - Returns payment │
│    details         │
└────────────────────┘
         │
         │ { payment_id, order_id, signature }
         ▼
┌────────────────────┐
│  Frontend          │
│  - Calls handler   │
└────────────────────┘
         │
         │ POST /api/razorpay/verify-payment
         ▼
┌────────────────────┐
│  API Route         │
│  - Verifies        │
│    signature       │
│  - Creates order   │
│  - Sends email     │
└────────────────────┘
         │
         │ { success: true, orderId }
         ▼
┌────────────────────┐
│  Frontend          │
│  - Redirects to    │
│    success page    │
└────────────────────┘
```

---

## 🗄️ Database Schema Relationships

```
┌─────────────┐
│   users     │
│─────────────│
│ userId (PK) │◄─────┐
│ name        │      │
│ email       │      │
│ addresses[] │      │
└─────────────┘      │
                     │
                     │ userId
                     │
┌─────────────┐      │
│   orders    │      │
│─────────────│      │
│ _id (PK)    │      │
│ userId (FK) │──────┘
│ orderId     │◄─────┐
│ items[]     │      │
│ totalAmount │      │
│ status      │      │
└─────────────┘      │
                     │
                     │ orderId
                     │
┌─────────────┐      │
│orderStatus  │      │
│  History    │      │
│─────────────│      │
│ orderId(FK) │──────┘
│ status      │
│ timestamp   │
└─────────────┘

┌─────────────┐
│  products   │
│─────────────│
│ _id (PK)    │◄─────┐
│ name        │      │
│ price       │      │
│ category    │      │
└─────────────┘      │
                     │
                     │ productId
                     │
┌─────────────┐      │
│  wishlist   │      │
│─────────────│      │
│ userId (FK) │      │
│ productId   │──────┘
│            (FK)     │
└─────────────┘
```

---

## 🎨 Component Hierarchy

```
RootLayout
│
├── GoogleAnalytics
│
├── ConvexClientProvider
│   │
│   └── ErrorBoundary
│       │
│       └── CartProvider
│           │
│           └── AuthProvider
│               │
│               └── ProfessionalModeProvider
│                   │
│                   └── ConditionalLayout
│                       │
│                       ├── Navbar (if not admin)
│                       │
│                       └── Page Content
│                           │
│                           ├── Home Page
│                           │   └── Hero Component
│                           │
│                           ├── Shop Page
│                           │   ├── ProductCard (multiple)
│                           │   └── Filters
│                           │
│                           ├── Checkout Page
│                           │   ├── Payment Options
│                           │   ├── Address Form
│                           │   └── Order Summary
│                           │
│                           └── Orders Page
│                               └── OrderList
│
└── ToastContainer
```

---

## 🔐 Authentication Flow

```
┌─────────────────┐
│  Unauthenticated │
│     User         │
└─────────────────┘
         │
         │ Visits protected route
         ▼
┌─────────────────┐
│ ProtectedRoute  │
│  Component      │
└─────────────────┘
         │
         │ Checks useAuth()
         ▼
    ┌────┴────┐
    │         │
    │         │
    ▼         ▼
┌──────┐  ┌──────────┐
│ User │  │ No User  │
│Found │  │ Found    │
└──────┘  └──────────┘
    │         │
    │         │ Redirect to /login
    │         ▼
    │    ┌──────────┐
    │    │ Login    │
    │    │ Page     │
    │    └──────────┘
    │         │
    │         │ signInWithEmailAndPassword()
    │         ▼
    │    ┌──────────┐
    │    │ Firebase │
    │    │   Auth   │
    │    └──────────┘
    │         │
    │         │ User object
    │         ▼
    │    ┌──────────┐
    │    │AuthContext│
    │    │ Updates  │
    │    └──────────┘
    │         │
    └─────────┘
         │
         │ User authenticated
         ▼
┌─────────────────┐
│  Protected      │
│  Content        │
│  Rendered       │
└─────────────────┘
```

---

## 💳 Payment Flow Comparison

### Cash on Delivery (COD)
```
User → Checkout → API → Convex → Email → Success
  (No payment gateway)
```

### Online Payment
```
User → Checkout → Razorpay Order → Razorpay Payment → 
Verify → Convex → Email → Success
```

---

## 📧 Email Notification Flow

```
Order Created/Updated
         │
         ▼
┌────────────────────┐
│  API Route or      │
│  Convex Function   │
└────────────────────┘
         │
         │ Calls sendOrderStatusEmail()
         ▼
┌────────────────────┐
│  Email Service     │
│  (Nodemailer)      │
│  - Generates HTML  │
│  - Sends via SMTP  │
└────────────────────┘
         │
         │
         ▼
┌────────────────────┐
│  Customer Email    │
│  Inbox             │
└────────────────────┘
```

---

## 🔍 Search Flow

```
User types in search
         │
         ▼
┌────────────────────┐
│  Search Component  │
│  - Debounced input │
└────────────────────┘
         │
         │ useQuery(api.product.searchProducts)
         ▼
┌────────────────────┐
│  Convex Query      │
│  - Uses searchIndex│
│  - Filters results │
└────────────────────┘
         │
         │ Products array
         ▼
┌────────────────────┐
│  UI Updates        │
│  - Shows results   │
│  - Highlights match│
└────────────────────┘
```

---

## 🛒 Cart Persistence Flow

```
User adds item to cart
         │
         ▼
┌────────────────────┐
│  CartContext       │
│  - Updates state   │
└────────────────────┘
         │
         │ useEffect hook
         ▼
┌────────────────────┐
│  localStorage      │
│  - Saves cart      │
│  - Persists data   │
└────────────────────┘
         │
         │ Page refresh
         ▼
┌────────────────────┐
│  CartContext       │
│  - Loads from      │
│    localStorage    │
│  - Restores cart   │
└────────────────────┘
```

---

## 📊 Admin Dashboard Flow

```
Admin logs in
         │
         ▼
┌────────────────────┐
│  Admin Check       │
│  - Verifies email  │
│    in ADMIN_EMAILS │
└────────────────────┘
         │
         │ Authorized
         ▼
┌────────────────────┐
│  Admin Dashboard   │
│  - View orders     │
│  - Manage products │
│  - Handle refunds  │
└────────────────────┘
         │
         │ Actions
         ▼
┌────────────────────┐
│  Convex Mutations  │
│  - Updates data    │
│  - Sends emails    │
└────────────────────┘
```

---

## 🔄 Real-time Updates (Convex)

```
Database Change
         │
         ▼
┌────────────────────┐
│  Convex Backend    │
│  - Detects change  │
└────────────────────┘
         │
         │ WebSocket connection
         ▼
┌────────────────────┐
│  Frontend          │
│  - useQuery hook   │
│  - Auto-updates    │
└────────────────────┘
         │
         │ State change
         ▼
┌────────────────────┐
│  UI Re-renders     │
│  - Shows new data  │
└────────────────────┘
```

---

## 📱 Responsive Design Flow

```
User visits site
         │
         ▼
┌────────────────────┐
│  Device Detection  │
│  - Mobile/Tablet/  │
│    Desktop         │
└────────────────────┘
         │
         │ Tailwind classes
         ▼
┌────────────────────┐
│  Layout Adapts     │
│  - Mobile: Stack   │
│  - Desktop: Grid   │
└────────────────────┘
```

---

## 🎯 Key Takeaways

1. **Frontend** = What user sees and interacts with
2. **Backend** = Server logic that processes requests
3. **Database** = Stores all data persistently
4. **API Routes** = Bridge between frontend and backend
5. **Context** = Global state management
6. **Real-time** = Convex automatically updates UI when data changes

---

**Use these diagrams alongside the code to understand how everything connects!**

