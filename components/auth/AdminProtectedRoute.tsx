"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const ADMIN_EMAILS = ["2858.manav@gmail.com"]; // Should match convex/product.ts

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && user?.email) {
      const admin = ADMIN_EMAILS.includes(user.email);
      setIsAdmin(admin);
      
      if (!admin) {
        router.push("/?error=unauthorized");
      }
    } else if (!authLoading && !user) {
      router.push(`/login?returnTo=${pathname}`);
    }
  }, [user, authLoading, router, pathname]);

  // Show loading while checking
  if (authLoading || isAdmin === null) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-700 mb-4">Bourgon</div>
        <div className="w-12 h-px bg-red-600 animate-pulse"></div>
        <p className="mt-4 text-sm text-gray-500">Checking admin access...</p>
      </div>
    );
  }

  // If not admin, don't render (redirect already happened)
  if (!isAdmin) {
    return null;
  }

  // Render admin content
  return <>{children}</>;
}

