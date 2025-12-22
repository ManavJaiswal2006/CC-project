"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If the authentication check is finished and no user is found
    if (!loading && !user) {
      // We redirect to login and pass the current path as a 'returnTo' parameter
      // This allows the user to be sent back to /contact after they log in.
      router.push(`/login?returnTo=${pathname}`);
    }
  }, [user, loading, router, pathname]);

  // Show a premium loader while checking the session
  if (loading) {
    return (
      <div className="h-screen bg-[#fcfcfc] flex flex-col items-center justify-center">
        <div className="text-4xl font-serif italic text-slate-300 animate-pulse mb-4">Bourgon</div>
        <div className="w-12 h-[1px] bg-red-600 animate-scale-x"></div>
      </div>
    );
  }

  // If user exists, render the page
  return user ? <>{children}</> : null;
}