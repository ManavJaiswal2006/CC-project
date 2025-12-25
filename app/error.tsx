"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
    
    // TODO: In production, log to error tracking service
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-full space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="text-red-600" size={64} />
        </div>
        
        <div>
          <h1 className="text-4xl font-black mb-4 text-black">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-2">
            We apologize for the inconvenience. An unexpected error occurred.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all"
          >
            <RefreshCw size={14} />
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

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left bg-gray-50 p-4 rounded border">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs bg-white p-3 rounded overflow-auto border mt-2">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

