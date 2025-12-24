"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  }, [countdown, orderId, router]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your order has been placed successfully.
          </p>
          {paymentId && (
            <p className="text-sm text-gray-500 mt-2">
              Payment ID: {paymentId}
            </p>
          )}
        </div>

        {orderId && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono font-semibold">{orderId}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/orders/${orderId}`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
              >
                View Order
                <ArrowRight size={14} />
              </Link>
              <a
                href={`/api/orders/pdf?orderId=${orderId}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-black text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
              >
                <Download size={14} />
                Download Invoice
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Redirecting to order details in {countdown} seconds...
        </p>

        <Link
          href="/shop"
          className="inline-block text-sm text-gray-600 hover:text-black transition-colors"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

