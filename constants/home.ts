export const navlinks = [
  { name: "HOME", href: "/" },
  { name: "ABOUT", href: "/about" },
  { name: "PRODUCTS", href: "/product" },
  { name: "CONTACT", href: "/customer-care" },

];

export const heroData = {
  subtitle: "Good For a Lifetime",
  title: ["BEYOND", "QUALITY.", "BEYOND", "DESIGN."],
  description:
    "Experience the epitome of culinary elegance. Our premium cutlery and kitchen tools are crafted for those who demand excellence in every detail.",
  buttonText: "Explore Collection",
  buttonLink: "/product",
  mainImage: "/home/img-1.png", 
  watermarkImage: "/home/img-1.png",
};

export const heroBento = [
  {
    id: 1,
    title: "Precision Essentials",
    subtitle: "Masterful Baking",
    imageSrc: "/home/img-2.png", // Whisk
    href: "/product",
    className: "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto", // Large square item
    darkText: true,
  },
  {
    id: 2,
    title: "Vibrant Living",
    subtitle: "Fantacy Collection",
    imageSrc: "/home/img-3.png", // Red set
    href: "/product",
    className: "md:col-span-1 md:row-span-1 aspect-square",
    darkText: true,
  },
  {
    id: 3,
    title: "Timeless Silver",
    subtitle: "Prime Series",
    imageSrc: "/home/img-4.png", // Silver set on black plate
    href: "/product",
    className: "md:col-span-1 md:row-span-1 aspect-square",
  },
  {
    id: 4,
    title: "Culinary Utility",
    subtitle: "Professional Tools",
    imageSrc: "/home/img-5.png", // Tool stand
    href: "/product",
    className: "md:col-span-1 md:row-span-2 aspect-square md:aspect-auto object-top", // Tall item
  },
  {
    id: 5,
    title: "Modern Patterns",
    subtitle: "Elite Aroma",
    imageSrc: "/home/img-6.png", // Checkered pattern
    href: "/product",
    className: "md:col-span-2 md:row-span-1 aspect-square md:aspect-[2/1]", // Wide item
    darkText: true,
  },
];

export const brandSectionData = {
  title: "Beyond Quality, Beyond Design",
  paragraphs: [
    "In the world of technology and innovation, everyone is looking for the best, out of everything. And we are very happy to introduce BOURGON products that will not only match your expectation, but also make you trust on us.",
    "We believe in world class quality with innovative approach using Man-Machine combination. Each item from BOURGON, that reaches to you, goes through expert inspection, so as to provide you the best.",
    "We have climbed to the global company as Cooking with love provides food for the soul and our products are that comfort which makes undemanding dishes unique and rigid things easy.",
  ],
  imageSrc: "/home/img-7.png",
 // Using the whole image, focusing on the bottom dining scene
};

export const featureBanner = {
  title: "The Gold Standard",
  description: "Elevate your dining experience with our exclusive PVD coated vector collection. Good for a lifetime.",
  buttonText: "Shop Vector Gold",
  imageSrc: "/home/img-8.png", // Gold Set
};