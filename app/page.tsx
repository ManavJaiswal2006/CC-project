import Hero from "@/components/home/hero";
import { homePageDescription, homePageTitle } from "@/constants/metadata";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: homePageTitle,
  description: homePageDescription,
};

export default function Home() {
  return (
    <div>
      <Hero />
    </div>
  );
}
