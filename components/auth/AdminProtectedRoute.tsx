"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Get admin emails from environment variable (client-side, so must be NEXT_PUBLIC_*)
// Format: "email1@example.com,email2@example.com"
// Fallback to hardcoded email if env not set (for backward compatibility)
const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const emails = adminEmailsEnv
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
  
  // Fallback to hardcoded email if env not set (for backward compatibility)
  if (emails.length === 0) {
    return ["2858.manav@gmail.com"];
  }
  
  return emails;
};

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Get admin emails (memoized to avoid recalculation)
  const adminEmails = useMemo(() => getAdminEmails(), []);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && user?.email) {
      const admin = adminEmails.includes(user.email);
      setIsAdmin(admin);
      
      if (!admin) {
        router.push("/?error=unauthorized");
      }
    } else if (!authLoading && !user) {
      router.push(`/login?returnTo=${pathname}`);
    }
  }, [user, authLoading, router, pathname, adminEmails]);

  // Show loading while checking
  if (authLoading || isAdmin === null) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-700 mb-4">cc-project</div>
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

