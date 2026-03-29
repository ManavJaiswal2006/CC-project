import { Building2, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export const BRAND = {
  name: "Manmal",
  tagline: "Authentic Football Gear", //
  logo: "/logo.png",
};

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Club Jerseys", href: "/series/club" }, //
  { name: "National Teams", href: "/series/national" }, //
];

export const logoImg = "/manmalLogo.png";

export const footerData = {
  brand: {
    name: "Manmal",
    dotColor: "text-red-600",
    tagline: "Authentic Jerseys. Ultimate Performance.",
    description: "Bringing the thrill of football to every fan through premium authentic jerseys and championship-quality sports apparel.",
  },
  sections: [
    {
      title: "Corporate Headquarters",
      items: [
        { icon: MapPin, text: "22  R VANI VIHAR UTTAM NAGAR NEW DELHI  110059", href: "https://maps.google.com" },
        { icon: Mail, text: "info@manmal.com", href: "mailto:info@manmal.com" },
        { icon: Phone, text: "+91 88008 30465 & +91 88008 30467", href: "tel:+918800830465" },
      ],
    },
    {
      title: "Eminence Support",
      type: "numbers", // Special type for larger text
      numbers: [
        { label: "+91 88008 30465", href: "tel:+918800830465" },
        { label: "+91 88008 30467", href: "tel:+918800830467" },
      ],
      socials: [
        { icon: Instagram, href: "#" },
        { icon: Facebook, href: "#" },
      ],
    },
    {
      title: "Business Opportunities",
      items: [
        { icon: Building2, text: "Become a Distributor", href: "/distributor" },
      ],
    },
  ],
  bottomBar: {
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Shipping", href: "/shipping" },
      { label: "Cancellation & Refunds", href: "/cancellation-refunds" },
    ],
    copyright: `© ${new Date().getFullYear()} Manmal. All Rights Reserved.`,
  },
};

export const searchedItems = [
  {
    id: 1,
    title: "Digital Electronics",
    href: "/digital-electronics",
    keywords: ["logic", "gates", "flipflop", "boolean"],
  },
  {
    id: 2,
    title: "Embedded Systems",
    href: "/embedded-systems",
    keywords: ["microcontroller", "arduino", "8051"],
  },
  {
    id: 3,
    title: "Analog Electronics",
    href: "/analog-electronics",
    keywords: ["opamp", "diodes", "amplifier"],
  },
  {
    id: 4,
    title: "VLSI Design",
    href: "/vlsi",
    keywords: ["verilog", "systemverilog", "ic"],
  },
  {
    id: 5,
    title: "Control Systems",
    href: "/control-systems",
    keywords: ["pid", "transfer function", "stability"],
  },
];