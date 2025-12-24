"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin2424");

  if (!isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <main className="bg-gray-50">
        {children}
      </main>
    </div>
  );
}

