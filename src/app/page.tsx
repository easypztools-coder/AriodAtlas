import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturedSpecies from "@/components/FeaturedSpecies";
import GenusGrid from "@/components/GenusGrid";
import PriceMethodology from "@/components/PriceMethodology";
import ExploreCTA from "@/components/ExploreCTA";

export const metadata: Metadata = {
  title: "Rare Houseplant Price Guide — Live UK Market Data",
  description:
    "Know what every rare houseplant is worth. Live eBay UK auction prices and retailer data for 170+ tropical species — so you never overpay again.",
  openGraph: {
    url: "https://aroidatlas.co.uk",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <FeaturedSpecies />
      <GenusGrid />
      <PriceMethodology />
      <ExploreCTA />
    </>
  );
}
