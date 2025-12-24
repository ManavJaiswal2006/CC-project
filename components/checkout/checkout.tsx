"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2, ArrowRight, CreditCard, Smartphone, Wallet, MapPin, Tag, X, Check } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");
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
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Your cart is empty.</p>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-3 bg-black text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-red-600 transition-all"
          >
            Back to Shop
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

    // For Card/UPI, use Razorpay
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
        paymentMethod: paymentMethod === "card" ? "card" : "upi",
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
    <div className="min-h-screen bg-white text-gray-900 pt-20 sm:pt-24 pb-12 sm:pb-16 md:pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase mb-6 sm:mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* PAYMENT */}  
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <PaymentOption
              label="Card"
              description="Visa / MasterCard / Amex"
              icon={<CreditCard size={18} />}
              active={paymentMethod === "card"}
              onClick={() => setPaymentMethod("card")}
            />
            <PaymentOption
              label="UPI"
              description="GPay / PhonePe / Paytm"
              icon={<Smartphone size={18} />}
              active={paymentMethod === "upi"}
              onClick={() => setPaymentMethod("upi")}
            />
            <PaymentOption
              label="COD"
              description="Cash on delivery"
              icon={<Wallet size={18} />}
              active={paymentMethod === "cod"}
              onClick={() => setPaymentMethod("cod")}
            />
          </div>

          {/* FORM */}
          <form
            onSubmit={handlePlaceOrder}
            className="lg:col-span-2 space-y-6 border p-6 sm:p-8 bg-gray-50"
          >
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <MapPin size={12} />
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
                    className="w-full border border-gray-300 px-3 py-2 text-sm mb-2"
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
                  : "Enter your shipping address"}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
                rows={4}
                required
              />
              {userData?.addresses && userData.addresses.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No saved addresses. <a href="/account" className="text-blue-600 hover:underline">Add one in your account</a>
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight size={16} className="shrink-0" />
                </>
              )}
            </button>
          </form>

          {/* SUMMARY */}
          <div className="border p-6 sm:p-8 bg-gray-50">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 sm:mb-6">
              Order Summary
            </h2>

            <ul className="space-y-3 text-sm mb-6">
              {cart.map((item) => (
                <li
                  key={`${item.id}-${item.size}`}
                  className="flex justify-between"
                >
                  <span>
                    {item.name}
                    {item.size ? ` (${item.size})` : ""}
                    x{item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            {handlingFee > 0 && (
              <div className="flex justify-between text-sm mb-3 pb-3 border-b">
                <span className="text-gray-600">Handling Fee (COD)</span>
                <span>₹{handlingFee}</span>
              </div>
            )}

            {/* PROMO CODE SECTION */}
            <div className="mb-4 pb-4 border-b">
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        {appliedPromo.code} Applied
                      </p>
                      {appliedPromo.description && (
                        <p className="text-xs text-green-600">{appliedPromo.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoError(null);
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={shouldValidatePromo}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={shouldValidatePromo || !promoCode.trim()}
                      className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      {shouldValidatePromo ? (
                        <Loader2 size={14} className="animate-spin shrink-0" />
                      ) : (
                        <Tag size={14} className="shrink-0" />
                      )}
                      <span>Apply</span>
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm mb-3 text-green-600">
                <span>Promo Discount ({appliedPromo?.code})</span>
                <span>-₹{promoDiscount}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>₹{finalTotal}</span>
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
      className={`flex flex-col gap-2 p-3 sm:p-4 border text-left transition ${active ? "border-black shadow-sm bg-white" : "border-gray-200 bg-gray-50 hover:border-black"}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-gray-700 shrink-0">{icon}</span>
        <span className="font-semibold text-sm sm:text-base">{label}</span>
      </div>
      <p className="text-xs text-gray-500 break-words">{description}</p>
      {active && <span className="text-[10px] uppercase font-black text-green-600">Selected</span>}
    </button>
  );
}


