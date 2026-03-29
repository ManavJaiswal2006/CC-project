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
  image = "/cc-projectLogo.png",
  url,
  type = "website",
  price,
  availability,
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cc-project-phi.vercel.app";
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
      siteName: "cc-project Industries",
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cc-project-phi.vercel.app";

  if (type === "Organization") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "cc-project Industries Pvt. Ltd.",
      url: siteUrl,
      logo: `${siteUrl}/cc-projectLogo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-88008-30465",
        contactType: "Customer Service",
        email: "cc-projectindustries@gmail.com",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "22  R VANI VIHAR UTTAM NAGAR",
        addressLocality: "New Delhi",
        postalCode: "110059",
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
        name: "cc-project Industries",
      },
    };
  }

  return null;
}

