import type { Metadata } from "next"; // Optional: for TypeScript types
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import ConvexClientProvider from "./ConvexClientProvider";
import { CartProvider } from "./context/CartContext";
import { ProfessionalModeProvider } from "./context/ProfessionalModeContext";
import ErrorBoundary from "@/components/UI/ErrorBoundary";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import ConditionalLayout from "@/components/ConditionalLayout";
import { ToastContainer } from "@/components/UI/Toast";

export const metadata: Metadata = {
  title: {
    default: "Manmal | Authentic Football Jerseys",
    template: "%s | Manmal",
  },
  description: "Premium authentic football jerseys by Manmal. Bringing the thrill of football to every fan through championship-quality sports apparel.",
  keywords: ["Manmal", "football jerseys", "authentic jerseys", "sports apparel", "football gear", "India"],
  authors: [{ name: "Manmal" }],
  creator: "Manmal",
  publisher: "Manmal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://manmal.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://manmal.vercel.app",
    siteName: "Manmal",
    title: "Manmal | Authentic Football Jerseys",
    description: "Premium authentic football jerseys by Manmal. Bringing the thrill of football to every fan.",
    images: [
      {
        url: "/manmalLogo.png",
        width: 1200,
        height: 630,
        alt: "Manmal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manmal | Authentic Football Jerseys",
    description: "Premium authentic football jerseys by Manmal.",
    images: ["/manmalLogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification code here when available
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#080808] text-white selection:bg-white selection:text-black antialiased">
        <GoogleAnalytics />
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

          <ErrorBoundary>
            <CartProvider>
              <AuthProvider>
                <ProfessionalModeProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                  <ToastContainer />
                </ProfessionalModeProvider>
              </AuthProvider>
            </CartProvider>
          </ErrorBoundary>
          
        </ConvexClientProvider>
      </body>
    </html>
  );
}