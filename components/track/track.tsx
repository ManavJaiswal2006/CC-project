"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PackageSearch, Loader2 } from "lucide-react";

export default function TrackOrder() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim().toUpperCase();
    
    if (!trimmed) {
      setError("Please enter an order ID");
      return;
    }

    // Validate format (should be ORD-XXXXXX)
    if (!trimmed.startsWith("ORD-") || trimmed.length < 8) {
      setError("Invalid order ID format. Order IDs start with ORD-");
      return;
    }

    setError(null);
    setLoading(true);
    
    // Navigate to order details page
    router.push(`/orders/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="w-full px-6">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <PackageSearch size={64} className="text-red-600" />
          </div>
          <h1 className="text-4xl font-bold uppercase mb-4 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-gray-500 w-full">
            Enter your order ID from your confirmation email to view order status, 
            tracking information, and delivery updates.
          </p>
        </div>

        <div className="bg-gray-50 border p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
                Order ID
              </label>
              <input
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="ORD-123456"
                className="w-full border border-gray-300 px-4 py-4 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-black transition-all"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Your order ID can be found in your confirmation email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full bg-black text-white py-4 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  Track Order <PackageSearch size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">
              Need help finding your order ID?
            </p>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-semibold">Your order ID can be found in:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500 ml-4">
                <li>Order confirmation email sent after purchase</li>
                <li>Your account page (if logged in)</li>
                <li>Order details page URL</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

