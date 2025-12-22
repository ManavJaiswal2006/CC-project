"use client";

import { useRef } from "react";
import "./globals.css";
import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/footer";
import { AuthProvider } from "./context/AuthContext";
import ConvexClientProvider from "./ConvexClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgRef = useRef(null);
  return (
    <html lang="en">
      <body className="bg-[#080808] text-white selection:bg-white selection:text-black antialiased" suppressHydrationWarning={true}>
        <ConvexClientProvider>
          <div
            className="fixed inset-0 z-[-1] pointer-events-none"
            style={{
              background: `
            radial-gradient(circle at 20% 30%, #ffffff 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, #f0f0f0 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, #f9f9f9 0%, #ffffff 100%);
            `,
            }}
          />

          <Navbar />
          <AuthProvider>{children}</AuthProvider>
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
