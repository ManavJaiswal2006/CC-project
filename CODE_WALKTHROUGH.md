# 💻 Code Walkthrough - Step by Step Examples

## Learning by Example: Real Code from the Project

This document walks through actual code from the project, explaining each part in detail.

---

## 📝 Example 1: Shopping Cart Context

**File**: `app/context/CartContext.tsx`

### What This Does
Manages the shopping cart globally across the entire app.

### Code Breakdown

```typescript
// 1. Define what a cart item looks like
export interface CartItem {
  id: string;              // Product ID
  name: string;            // Product name
  price: number;           // Price per item
  quantity: number;        // How many in cart
  size?: string | null;    // Optional: size variant
  color?: string | null;   // Optional: color variant
}
```

**Explanation**: This is a TypeScript interface. It's like a blueprint that says "every cart item must have these properties."

```typescript
// 2. Create the context (like a global box to store cart)
const CartContext = createContext<CartContextType | undefined>(undefined);
```

**Explanation**: `createContext` creates a "box" that can hold cart data. Any component can access this box.

```typescript
// 3. The Provider component (wraps the app)
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Load cart from browser storage when app starts
  useEffect(() => {
    const saved = localStorage.getItem("bourgon_cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);
  
  // Save cart to browser storage whenever it changes
  useEffect(() => {
    localStorage.setItem("bourgon_cart", JSON.stringify(cart));
  }, [cart]);
```

**Explanation**:
- `useState` creates a variable (`cart`) that can change, and a function (`setCart`) to update it
- `useEffect` runs code when something changes
- First `useEffect`: Loads saved cart from browser storage when app starts
- Second `useEffect`: Saves cart to browser storage whenever cart changes

```typescript
  // Function to add item to cart
  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      // Check if item already exists in cart
      const existing = prev.find(
        (p) => p.id === item.id && p.size === item.size && p.color === item.color
      );
      
      if (existing) {
        // If exists, increase quantity
        return prev.map((p) =>
          p.id === item.id && p.size === item.size && p.color === item.color
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      }
      
      // If new item, add to cart
      return [...prev, { ...item, quantity }];
    });
  };
```

**Explanation**:
- `addToCart` is a function that takes an item and optional quantity
- `setCart((prev) => ...)` uses the previous cart state to create a new state
- `prev.find()` searches for an existing item with same ID, size, and color
- If found: updates quantity
- If not found: adds new item using spread operator `[...prev, newItem]`

### How to Use It

```tsx
// In any component
import { useCart } from "@/app/context/CartContext";

function ProductPage() {
  const { cart, addToCart, cartTotal } = useCart();
  
  return (
    <div>
      <p>Items in cart: {cart.length}</p>
      <p>Total: ₹{cartTotal}</p>
      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}
```

---

## 📝 Example 2: Checkout Page - Payment Method Selection

**File**: `components/checkout/checkout.tsx`

### Code Breakdown

```typescript
// State to track selected payment method
const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
```

**Explanation**: 
- `useState` creates a variable that starts as "online"
- Type is `"online" | "cod"` meaning it can only be one of these two values
- `setPaymentMethod` is used to change the value

```typescript
// Calculate handling fee based on payment method
const handlingFee = paymentMethod === "cod" ? COD_HANDLING_FEE : 0;
```

**Explanation**: 
- This is a ternary operator (shorthand if/else)
- If payment method is "cod", add handling fee (₹40)
- Otherwise, no fee

```tsx
// Payment method selection UI
<PaymentOption
  label="Online"
  description="Card / UPI / Net Banking"
  icon={<Globe size={20} />}
  active={paymentMethod === "online"}
  onClick={() => setPaymentMethod("online")}
/>
<PaymentOption
  label="COD"
  description="Cash on delivery"
  icon={<Wallet size={20} />}
  active={paymentMethod === "cod"}
  onClick={() => setPaymentMethod("cod")}
/>
```

**Explanation**:
- Two `PaymentOption` components
- `active` prop is true when that option is selected
- `onClick` changes the payment method when clicked

### PaymentOption Component

```tsx
function PaymentOption({ label, description, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 border-2 rounded-xl ${
        active 
          ? "border-black bg-black text-white" 
          : "border-gray-200 bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>
      <p>{description}</p>
    </button>
  );
}
```

**Explanation**:
- Takes props (label, description, icon, active, onClick)
- Uses template literals for conditional styling
- If `active` is true, uses black background
- If `active` is false, uses gray background

---

## 📝 Example 3: API Route - Creating an Order

**File**: `app/api/orders/route.ts`

### Code Breakdown

```typescript
export async function POST(req: Request) {
  // 1. Get data from request body
  const body = await req.json();
  const { userId, items, total, paymentMethod } = body;
```

**Explanation**:
- `export async function POST` = This function handles POST requests
- `req.json()` = Converts request body from JSON to JavaScript object
- Destructuring extracts specific fields from body

```typescript
  // 2. Validate the data
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { success: false, message: "Invalid user ID" },
      { status: 400 }
    );
  }
```

**Explanation**:
- Checks if userId exists and is a string
- If invalid, returns error response with status 400 (Bad Request)
- `NextResponse.json()` creates a JSON response

```typescript
  // 3. Sanitize inputs (remove dangerous characters)
  const sanitizedShippingName = sanitizeString(shippingName, 200);
```

**Explanation**:
- `sanitizeString` removes potentially dangerous characters
- Second parameter (200) is max length
- Prevents security issues like XSS attacks

```typescript
  // 4. Create order in database
  const { orderId } = await fetchMutation(api.order.createOrder, {
    userId,
    shippingName: sanitizedShippingName,
    items,
    total,
    paymentMethod,
  });
```

**Explanation**:
- `fetchMutation` calls a Convex mutation function
- `api.order.createOrder` is the function to call
- Passes data as second parameter
- `await` waits for it to complete
- Gets `orderId` from the response

```typescript
  // 5. Send confirmation email
  if (isEmailConfigured("orders") && customerEmail) {
    const transporter = nodemailer.createTransport(getEmailTransporterConfig("orders"));
    
    await transporter.sendMail({
      from: "orders@cc-project-phi.vercel.app",
      to: customerEmail,
      subject: `Your Order Invoice - ${orderId}`,
      html: billHTML,
    });
  }
```

**Explanation**:
- Checks if email is configured
- Creates email transporter (like setting up a mail service)
- Sends email with order details
- `await` waits for email to be sent

```typescript
  // 6. Return success response
  return NextResponse.json({ success: true, orderId }, { status: 200 });
}
```

**Explanation**:
- Returns JSON response with success status
- Status 200 means "OK"
- Frontend receives this and can redirect user

---

## 📝 Example 4: Convex Query - Getting Products

**File**: `convex/product.ts`

### Code Breakdown

```typescript
export const getProducts = query({
  handler: async (ctx) => {
    // Get all products from database
    const products = await ctx.db.query("products").collect();
    
    // Return products
    return products;
  }
});
```

**Explanation**:
- `export const getProducts = query(...)` = Exports a query function
- `query` means it only reads data (doesn't modify)
- `ctx` = Context object with database access
- `ctx.db.query("products")` = Queries the "products" table
- `.collect()` = Gets all results
- Returns the products array

### How Frontend Uses It

```tsx
// In a React component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function ShopPage() {
  // This automatically fetches products and updates when data changes!
  const products = useQuery(api.product.getProducts);
  
  if (!products) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

**Explanation**:
- `useQuery` is a React hook that fetches data
- Automatically re-fetches when data changes in database
- Returns `undefined` while loading
- Once loaded, returns the products array
- `.map()` loops through products and renders each one

---

## 📝 Example 5: Convex Mutation - Creating an Order

**File**: `convex/order.ts`

### Code Breakdown

```typescript
export const createOrder = mutation({
  args: {
    userId: v.string(),
    items: v.any(),
    total: v.number(),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert order into database
    const orderDocId = await ctx.db.insert("orders", {
      userId: args.userId,
      orderId: orderId,
      items: args.items,
      totalAmount: args.total,
      status: "pending",
      paymentMethod: args.paymentMethod,
      createdAt: Date.now(),
    });
    
    // Create initial status history entry
    await ctx.db.insert("orderStatusHistory", {
      orderId: orderId,
      status: "pending",
      message: "Order placed",
      timestamp: Date.now(),
    });
    
    return { orderId };
  }
});
```

**Explanation**:
- `mutation` means it modifies data (unlike query)
- `args` defines what data the function expects
- `v.string()`, `v.number()` = Validators (ensures correct type)
- `handler` = The function that runs
- `ctx.db.insert()` = Adds new record to database
- First insert: Creates the order
- Second insert: Creates status history entry
- Returns orderId so frontend knows what was created

### How Frontend Uses It

```typescript
// In API route or component
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const { orderId } = await fetchMutation(api.order.createOrder, {
  userId: "user123",
  items: cartItems,
  total: 1000,
  paymentMethod: "cod",
});

console.log("Order created:", orderId);
```

---

## 📝 Example 6: Promo Code Validation

**File**: `components/checkout/checkout.tsx`

### Code Breakdown

```typescript
// State for promo code
const [promoCode, setPromoCode] = useState("");
const [appliedPromo, setAppliedPromo] = useState(null);
const [shouldValidatePromo, setShouldValidatePromo] = useState(false);
```

**Explanation**:
- `promoCode` = What user typed
- `appliedPromo` = The validated promo (null if not applied)
- `shouldValidatePromo` = Flag to trigger validation

```typescript
// Query that validates promo (only runs when shouldValidatePromo is true)
const promoValidation = useQuery(
  api.promo.validatePromo,
  shouldValidatePromo && promoCode.trim()
    ? { code: promoCode.trim(), orderAmount: subtotal }
    : "skip"
);
```

**Explanation**:
- `useQuery` with conditional execution
- If `shouldValidatePromo` is true AND promoCode exists, runs query
- Otherwise, returns "skip" (doesn't run)
- Passes promo code and order amount to validation function

```typescript
// Effect that handles validation result
useEffect(() => {
  if (shouldValidatePromo && promoValidation) {
    setShouldValidatePromo(false); // Reset flag
    
    if (promoValidation.valid && promoValidation.promo) {
      setAppliedPromo(promoValidation.promo); // Apply promo
      setPromoError(null);
    } else {
      setPromoError(promoValidation.error || "Invalid promo code");
    }
  }
}, [promoValidation, shouldValidatePromo]);
```

**Explanation**:
- `useEffect` runs when `promoValidation` or `shouldValidatePromo` changes
- If validation succeeded: saves promo to state
- If validation failed: saves error message

```typescript
// Calculate discount
const promoDiscount = appliedPromo?.discountAmount ?? 0;
const finalTotal = Math.max(0, subtotal - promoDiscount);
```

**Explanation**:
- `appliedPromo?.discountAmount` = Optional chaining (safe access)
- `?? 0` = If null/undefined, use 0
- `Math.max(0, ...)` = Ensures total never goes below 0

### Apply Promo Button

```tsx
<button
  onClick={handleApplyPromo}
  disabled={shouldValidatePromo || !promoCode.trim()}
>
  Apply
</button>
```

**Explanation**:
- `onClick` calls `handleApplyPromo` function
- `disabled` prevents clicking while validating or if code is empty

---

## 📝 Example 7: Protected Route

**File**: `components/auth/ProtectedRoute.tsx`

### Code Breakdown

```tsx
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login");
    return null;
  }
  
  // Show protected content if authenticated
  return <>{children}</>;
}
```

**Explanation**:
- Gets user and loading state from AuthContext
- If loading: shows loading message
- If no user: redirects to login page
- If user exists: shows the protected content (children)

### How to Use It

```tsx
// Wrap any page that needs authentication
<ProtectedRoute>
  <CheckoutPage />
</ProtectedRoute>
```

---

## 📝 Example 8: Razorpay Payment Integration

**File**: `components/checkout/checkout.tsx` (payment section)

### Code Breakdown

```typescript
// Step 1: Load Razorpay script
await loadRazorpayScript();
```

**Explanation**: Loads Razorpay JavaScript library from their CDN

```typescript
// Step 2: Create Razorpay order
const orderRes = await fetch("/api/razorpay/create-order", {
  method: "POST",
  body: JSON.stringify({
    amount: finalTotal,
    currency: "INR",
    receipt: `RCP${Date.now()}`,
  }),
});

const orderData = await orderRes.json();
```

**Explanation**:
- Calls backend API to create Razorpay order
- Backend returns order ID and key

```typescript
// Step 3: Open Razorpay checkout
openRazorpay({
  key: orderData.key,
  amount: orderData.amount,
  order_id: orderData.orderId,
  handler: async (response) => {
    // This runs when payment succeeds
    const verifyRes = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });
    
    // If verification succeeds, redirect to success page
    router.push("/payment/success");
  },
});
```

**Explanation**:
- Opens Razorpay payment popup
- User enters card details
- When payment completes, `handler` function runs
- Verifies payment signature with backend
- Redirects to success page

---

## 📝 Example 9: Form Validation

**File**: `components/checkout/checkout.tsx`

### Code Breakdown

```typescript
const handlePlaceOrder = async (e: React.FormEvent) => {
  e.preventDefault(); // Prevent page refresh
  
  // Validate user is logged in
  if (!user) {
    setError("Please log in to place an order.");
    return; // Stop execution
  }
  
  // Validate form fields
  if (!name.trim() || !address.trim()) {
    setError("Please fill in your name and address.");
    return;
  }
  
  // If validation passes, proceed with order
  // ... rest of order logic
};
```

**Explanation**:
- `e.preventDefault()` = Stops form from submitting normally
- Checks if user exists
- Checks if required fields are filled
- `trim()` = Removes whitespace
- If any validation fails, shows error and stops
- If all pass, continues with order creation

---

## 📝 Example 10: Conditional Rendering

### Code Breakdown

```tsx
// Show different content based on state
{loading ? (
  <Loader />
) : error ? (
  <ErrorMessage message={error} />
) : (
  <OrderDetails />
)}
```

**Explanation**:
- Ternary operator: `condition ? valueIfTrue : valueIfFalse`
- If loading: show loader
- Else if error: show error
- Else: show order details

```tsx
// Show element only if condition is true
{user && <UserMenu />}
```

**Explanation**:
- `&&` = Logical AND
- If `user` exists, show `UserMenu`
- If `user` is null/undefined, show nothing

```tsx
// Show element only if array has items
{cart.length > 0 && (
  <div>
    <p>You have {cart.length} items in cart</p>
  </div>
)}
```

**Explanation**:
- Only shows cart summary if cart has items

---

## 🎯 Key Patterns to Remember

### 1. State Management
```typescript
const [value, setValue] = useState(initialValue);
```

### 2. Side Effects
```typescript
useEffect(() => {
  // Code that runs when dependencies change
}, [dependency1, dependency2]);
```

### 3. API Calls
```typescript
const response = await fetch("/api/endpoint", {
  method: "POST",
  body: JSON.stringify(data),
});
const result = await response.json();
```

### 4. Database Queries
```typescript
const data = useQuery(api.module.function, args);
```

### 5. Database Mutations
```typescript
await fetchMutation(api.module.function, args);
```

### 6. Error Handling
```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error(error);
  setError(error.message);
}
```

---

## 🚀 Practice Exercises

1. **Modify Cart Context**: Add a function to clear all items from cart
2. **Add Validation**: Add email validation to checkout form
3. **Create New API Route**: Create an endpoint to get order by ID
4. **Add New Component**: Create a "Recently Viewed" component
5. **Modify Query**: Add filtering to product query (by category)

---

**Remember**: The best way to learn is to read the code, understand it, then modify it and see what happens!

