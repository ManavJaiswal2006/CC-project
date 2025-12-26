import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  price?: number;
  availability?: "in stock" | "out of stock" | "preorder";
}

export function generateSEO({
  title,
  description,
  image = "/bourgonLogo.png",
  url,
  type = "website",
  price,
  availability,
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      type: type === "product" ? "website" : type, // Next.js doesn't support "product" type
      title,
      description,
      url: fullUrl,
      siteName: "Bourgon Industries",
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImage],
    },
  };

  // Add product-specific structured data
  if (type === "product" && price !== undefined) {
    metadata.other = {
      "product:price:amount": price.toString(),
      "product:price:currency": "INR",
      ...(availability && { "product:availability": availability }),
    };
  }

  return metadata;
}

// Generate JSON-LD structured data
export function generateStructuredData({
  type,
  name,
  description,
  image,
  price,
  availability,
  rating,
  reviewCount,
}: {
  type: "Product" | "Organization" | "WebSite";
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  availability?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bourgon.in";

  if (type === "Organization") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Bourgon Industries Pvt. Ltd.",
      url: siteUrl,
      logo: `${siteUrl}/bourgonLogo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-88008-30465",
        contactType: "Customer Service",
        email: "bourgonindustries@gmail.com",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "B - 30, Ambedkar Colony, Chhatarpur",
        addressLocality: "New Delhi",
        postalCode: "110074",
        addressCountry: "IN",
      },
    };
  }

  if (type === "Product" && name) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description,
      image: image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : undefined,
      ...(price && {
        offers: {
          "@type": "Offer",
          price,
          priceCurrency: "INR",
          availability: availability
            ? `https://schema.org/${availability === "in stock" ? "InStock" : "OutOfStock"}`
            : undefined,
        },
      }),
      ...(rating && reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount,
        },
      }),
      brand: {
        "@type": "Brand",
        name: "Bourgon Industries",
      },
    };
  }

  return null;
}

