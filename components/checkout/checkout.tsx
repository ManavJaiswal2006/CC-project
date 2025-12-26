"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, ArrowRight, CreditCard, Wallet, MapPin, Tag, X, Check, ShoppingBag, Globe } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { loadRazorpayScript, openRazorpay, type RazorpayResponse } from "@/lib/razorpay";

const COD_HANDLING_FEE = 40;

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  /* ================= CONVEX ================= */
  const userData = useQuery(
    api.user.getUser,
    user?.uid ? { userId: user.uid } : "skip"
  );

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [shouldValidatePromo, setShouldValidatePromo] = useState(false);

  /* ================= TOTAL CALCULATION ================= */
  const handlingFee = paymentMethod === "cod" ? COD_HANDLING_FEE : 0;
  const subtotal = cartTotal + handlingFee;

  /* ================= PROMO VALIDATION ================= */
  const promoValidation = useQuery(
    api.promo.validatePromo,
    shouldValidatePromo && promoCode.trim() && appliedPromo === null
      ? { code: promoCode.trim(), orderAmount: subtotal }
      : "skip"
  );

  useEffect(() => {
    if (shouldValidatePromo && promoValidation) {
      setShouldValidatePromo(false);
      if (promoValidation.valid && promoValidation.promo) {
        setAppliedPromo(promoValidation.promo);
        setPromoError(null);
      } else {
        setPromoError(promoValidation.error || "Invalid promo code");
      }
    }
  }, [promoValidation, shouldValidatePromo]);

  /* ================= TOTAL CALCULATION ================= */
  const promoDiscount = appliedPromo?.discountAmount ?? 0;
  const finalTotal = Math.max(0, subtotal - promoDiscount);

  /* ================= LOAD SAVED DATA ================= */
  useEffect(() => {
    if (userData && !dataLoaded) {
      // Pre-fill name
      if (userData.name) {
        setName(userData.name);
      }
      setDataLoaded(true);
    }
  }, [userData, dataLoaded]);

  /* ================= ADDRESS SELECTION ================= */
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (!userData?.addresses) return;

    const selectedAddr = userData.addresses.find((addr) => addr.id === addressId);
    if (selectedAddr) {
      // Format address for shipping
      const label = selectedAddr.label === "Other" && selectedAddr.customLabel
        ? selectedAddr.customLabel
        : selectedAddr.label;
      
      const formattedAddress = `${label}\n${selectedAddr.street}\n${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.pincode}`;
      setAddress(formattedAddress);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500">Add some items to your cart to continue</p>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="px-8 py-3 bg-black text-white text-xs font-bold tracking-wider uppercase rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }
    setPromoError(null);
    setShouldValidatePromo(true);
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setPromoError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Please log in to place an order.");
      return;
    }

    if (!name.trim() || !address.trim()) {
      setError("Please fill in your name and address.");
      return;
    }

    // For COD, create order directly
    if (paymentMethod === "cod") {
      try {
        setLoading(true);

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            customerEmail: user.email ?? undefined,
            shippingName: name.trim(),
            shippingAddress: address.trim(),
            items: cart,
            total: finalTotal,
            paymentMethod: "cod",
            promoCode: appliedPromo?.code,
            promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Could not place order.");
        }

        clearCart();
        router.push(`/orders/${data.orderId}`);
      } catch (err: any) {
        setError(err.message || "Could not place order. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // For Online payment, use Razorpay
    try {
      setLoading(true);

      // Load Razorpay script
      await loadRazorpayScript();

      // Create Razorpay order
      // Receipt must be max 40 characters (Razorpay requirement)
      const timestamp = Date.now().toString().slice(-10); // Last 10 digits
      const userIdShort = user.uid.slice(-8); // Last 8 characters of user ID
      const receipt = `RCP${timestamp}${userIdShort}`; // Max 21 characters
      
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          receipt: receipt,
          notes: {
            userId: user.uid,
            customerEmail: user.email || "",
            shippingName: name.trim(),
            shippingAddress: address.trim(),
            promoCode: appliedPromo?.code || "",
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        const errorMsg = orderData.message || "Failed to initialize payment";
        console.error("Razorpay order creation failed:", orderData);
        throw new Error(errorMsg);
      }

      // Prepare order data for verification
      const orderDataForVerification = {
        userId: user.uid,
        customerEmail: user.email ?? undefined,
        shippingName: name.trim(),
        shippingAddress: address.trim(),
        items: cart,
        total: finalTotal,
        paymentMethod: "online", // Online payment (Card/UPI/Net Banking)
        promoCode: appliedPromo?.code,
        promoDiscount: promoDiscount > 0 ? promoDiscount : undefined,
      };

      // Open Razorpay checkout
      openRazorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Bourgon Industries",
        description: `Order for ${name.trim()}`,
        order_id: orderData.orderId,
        prefill: {
          name: name.trim(),
          email: user.email || undefined,
          contact: userData?.phone || undefined,
        },
        notes: {
          userId: user.uid,
          shippingName: name.trim(),
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderDataForVerification,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            // Payment successful!
            clearCart();
            router.push(`/payment/success?orderId=${verifyData.orderId}&paymentId=${response.razorpay_payment_id}`);
          } catch (err: any) {
            console.error("Payment verification error:", err);
            router.push(`/payment/failure?error=${encodeURIComponent(err.message || "Payment verification failed")}`);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled by user");
          },
        },
      });
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900 pt-20 sm:pt-24 pb-12 sm:pb-16 md:pb-20">
      <div className="w-full px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
            Checkout
          </h1>
          <p className="text-sm text-gray-500">Complete your order in a few simple steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* PAYMENT METHODS */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
              </div>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handlePlaceOrder}
            className="lg:col-span-2 space-y-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 md:p-10"
          >
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 block">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white hover:bg-gray-50 shadow-sm hover:shadow-md"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={14} />
                Shipping Address
              </label>
              
              {userData?.addresses && userData.addresses.length > 0 && (
                <div className="mb-3">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddressSelect(e.target.value);
                      } else {
                        setSelectedAddressId("");
                        setAddress("");
                      }
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <option value="">Select a saved address or enter manually</option>
                    {userData.addresses.map((addr) => {
                      const label = addr.label === "Other" && addr.customLabel
                        ? addr.customLabel
                        : addr.label;
                      return (
                        <option key={addr.id} value={addr.id}>
                          {label} - {addr.street}, {addr.city}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  // Clear selection if user manually edits
                  if (selectedAddressId) {
                    setSelectedAddressId("");
                  }
                }}
                placeholder={userData?.addresses && userData.addresses.length > 0 
                  ? "Select an address above or enter manually"
                  : "Enter your complete shipping address"}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y bg-white hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                rows={4}
                required
              />
              {userData?.addresses && userData.addresses.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  No saved addresses. <a href="/account" className="text-blue-600 hover:underline font-medium">Add one in your account</a>
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-3 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  <span>Processing Order…</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight size={18} className="shrink-0" />
                </>
              )}
            </button>
          </form>

          {/* SUMMARY */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 h-fit sticky top-24">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-6 flex items-center gap-2 pb-4 border-b border-gray-200">
              <ShoppingBag size={18} />
              Order Summary
            </h2>

            <ul className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <li
                  key={`${item.id}-${item.size}-${item.subproduct}-${item.color}`}
                  className="flex justify-between items-start text-sm pb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    {item.size && (
                      <span className="text-gray-500 text-xs block">Size: {item.size}</span>
                    )}
                    {item.subproduct && (
                      <span className="text-gray-500 text-xs block">Subproduct: {item.subproduct}</span>
                    )}
                    {item.color && (
                      <span className="text-gray-500 text-xs block">Color: {item.color}</span>
                    )}
                    {item.packQuantity && item.packQuantity > 1 && (
                      <span className="text-red-600 text-xs font-semibold block">Pack of {item.packQuantity}</span>
                    )}
                    <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            {handlingFee > 0 && (
              <div className="flex justify-between text-sm mb-3 pb-3 border-b border-gray-200">
                <span className="text-gray-600">Handling Fee (COD)</span>
                <span className="font-medium">₹{handlingFee}</span>
              </div>
            )}

            {/* PROMO CODE SECTION */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Check size={18} className="text-green-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-green-800 truncate">
                        {appliedPromo.code} Applied
                      </p>
                      {appliedPromo.description && (
                        <p className="text-xs text-green-600 truncate">{appliedPromo.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded transition-colors shrink-0 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError(null);
                      }}
                      placeholder="PROMO CODE"
                      className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2.5 text-xs uppercase font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                      disabled={shouldValidatePromo}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={shouldValidatePromo || !promoCode.trim()}
                      className="px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md shrink-0 cursor-pointer"
                    >
                      {shouldValidatePromo ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Tag size={14} />
                          <span className="hidden sm:inline">Apply</span>
                        </>
                      )}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600 font-medium">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm mb-4 text-green-600 font-semibold">
                <span>Promo Discount ({appliedPromo?.code})</span>
                <span>-₹{promoDiscount}</span>
              </div>
            )}

            <div className="flex justify-between items-center font-bold text-xl border-t-2 border-gray-200 pt-4">
              <span className="uppercase tracking-wider text-gray-700">Total</span>
              <span className="text-2xl text-black">₹{finalTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  label,
  description,
  icon,
  active,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-3 p-4 sm:p-5 border-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
        active 
          ? "border-black shadow-lg bg-black text-white transform scale-105" 
          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`shrink-0 ${active ? "text-white" : "text-gray-700"}`}>{icon}</span>
        <span className={`font-bold text-sm sm:text-base ${active ? "text-white" : "text-gray-900"}`}>{label}</span>
      </div>
      <p className={`text-xs break-words ${active ? "text-gray-200" : "text-gray-500"}`}>{description}</p>
      {active && (
        <div className="flex items-center gap-1.5 mt-1">
          <Check size={14} className="text-green-400" />
          <span className="text-[10px] uppercase font-black text-green-400">Selected</span>
        </div>
      )}
    </button>
  );
}


