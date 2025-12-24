"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/footer";
import AdminNavbar from "@/components/Admin/AdminNavbar";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin2424");

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <main className="bg-gray-50">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

