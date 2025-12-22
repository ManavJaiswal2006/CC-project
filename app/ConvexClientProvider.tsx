"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { useFirebaseAuth } from "./lib/usefirebaseauth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    // ✅ Fix: Pass the hook function directly, do NOT call it with ()
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}