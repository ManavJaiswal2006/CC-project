"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error (only in development or to error tracking service)
    if (process.env.NODE_ENV === "development") {
      console.error("Global error:", error);
    }
    // TODO: In production, send to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="text-red-600" size={64} />
            </div>
            
            <div>
              <h1 className="text-4xl font-black mb-4 text-black">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-4">
                A critical error occurred. Please refresh the page or contact support if the problem persists.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-black text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
              >
                <Home size={14} />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

