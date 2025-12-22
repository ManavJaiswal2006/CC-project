import type { Metadata } from "next"; // Optional: for TypeScript types
import "./globals.css";
import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/footer";
import { AuthProvider } from "./context/AuthContext";
import ConvexClientProvider from "./ConvexClientProvider";
import { CartProvider } from "./context/CartContext";

export const metadata: Metadata = {
  title: "My App",
  description: "My App Description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#080808] text-white selection:bg-white selection:text-black antialiased">
        <ConvexClientProvider>
          {/* Background Gradient */}
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

          <CartProvider>
            <Navbar />
            <AuthProvider>
                {children}
            </AuthProvider>
            <Footer />
          </CartProvider>
          
        </ConvexClientProvider>
      </body>
    </html>
  );
}