import { Building2, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export const BRAND = {
  name: "BOURGON",
  tagline: "beyond quality beyond design", // 
  logo: "/logo.png",
};

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Prime Series", href: "/series/prime" }, // 
  { name: "PVD Luxury", href: "/series/pvd" }, // 
];

export const logoImg = "/bourgonLogo.png";

export const footerData = {
  brand: {
    name: "Bourgon",
    dotColor: "text-red-600",
    tagline: "Beyond Quality. Beyond Design.",
    description: "Setting new benchmarks in industrial excellence through innovative design and uncompromising manufacturing standards.",
  },
  sections: [
    {
      title: "Corporate Headquarters",
      items: [
        { icon: MapPin, text: "B - 30, Ambedkar Colony, Chhatarpur, New Delhi - 110074", href: "https://maps.google.com" },
        { icon: Mail, text: "bourgonindustries@gmail.com", href: "mailto:bourgonindustries@gmail.com" },
        { icon: Phone, text: "+91 88008 30465", href: "tel:+918800830465" },
      ],
    },
    {
      title: "Eminence Support",
      type: "numbers", // Special type for larger text
      numbers: [
        { label: "+91 93126 14905", href: "tel:+919312614905" },
        { label: "+91 99110 75315", href: "tel:+919911075315" },
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
    copyright: `© ${new Date().getFullYear()} Bourgon Industries Pvt. Ltd. All Rights Reserved.`,
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