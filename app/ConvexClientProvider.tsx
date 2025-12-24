"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { useFirebaseAuth } from "./lib/usefirebaseauth";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

if (!convexUrl && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.error(
    "NEXT_PUBLIC_CONVEX_URL is not set. Please configure it in your environment variables."
  );
}

const convex = new ConvexReactClient(convexUrl);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    // ✅ Fix: Pass the hook function directly, do NOT call it with ()
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}