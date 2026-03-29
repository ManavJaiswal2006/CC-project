"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error") || "Payment failed";

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="text-red-600" size={48} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-2">
            We couldn't process your payment.
          </p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Please try again or use a different payment method.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-black text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
            >
              <RefreshCw size={14} />
              Try Again
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">
            Need help? Contact us:
          </p>
          <a
            href="mailto:cc-projectindustries@gmail.com"
            className="text-sm text-blue-600 hover:underline"
          >
            cc-projectindustries@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}

