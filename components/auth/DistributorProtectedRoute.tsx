"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DistributorProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userData = useQuery(
    api.user.getUser,
    user?.uid ? { userId: user.uid } : "skip"
  );

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // If no user, redirect to login
    if (!user) {
      router.push(`/login?returnTo=${pathname}`);
      return;
    }

    // If user data is loaded, check role
    if (userData !== undefined) {
      const role = userData?.role || (userData?.category === "distributor" ? "distributor" : "customer");
      
      if (role !== "distributor") {
        // User is not a distributor, redirect to home
        router.push("/");
        return;
      }
    }
  }, [user, authLoading, userData, router, pathname]);

  // Show loading while checking authentication and role
  if (authLoading || userData === undefined) {
    return (
      <div className="h-screen bg-[#fcfcfc] flex flex-col items-center justify-center">
        <div className="text-4xl font-serif italic text-slate-300 animate-pulse mb-4">
          BOURGON
        </div>
        <div className="w-12 h-px bg-red-600 animate-scale-x"></div>
        <p className="text-xs text-gray-400 mt-4 tracking-wider uppercase">
          Verifying Access
        </p>
      </div>
    );
  }

  // If user exists and is a distributor, render the page
  const role = userData?.role || (userData?.category === "distributor" ? "distributor" : "customer");
  if (user && role === "distributor") {
    return <>{children}</>;
  }

  // Default: don't render (redirect is happening)
  return null;
}

