import type { Metadata } from "next";
import { Merriweather, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ariodatlas.com"), // TODO: update with real domain before going live
  title: {
    default: "Ariod Atlas — Rare Tropical Plant Encyclopedia",
    template: "%s | Ariod Atlas",
  },
  description:
    "The visual encyclopedia of rare tropical plants. Discover, explore and compare the world's most extraordinary aroids — with live eBay UK market prices.",
  keywords: [
    "aroids",
    "rare tropical plants",
    "monstera",
    "philodendron",
    "anthurium",
    "alocasia",
    "plant encyclopedia",
    "rare plants for sale",
    "aroid care guide",
  ],
  authors: [{ name: "Ariod Atlas" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Ariod Atlas",
    title: "Ariod Atlas — Rare Tropical Plant Encyclopedia",
    description:
      "The visual encyclopedia of rare tropical plants. Live eBay UK market prices, species profiles, and cultivation data.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Ariod Atlas — Rare Tropical Plant Encyclopedia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ariod Atlas — Rare Tropical Plant Encyclopedia",
    description:
      "The visual encyclopedia of rare tropical plants. Live market prices and species profiles.",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${merriweather.variable} ${inter.variable}`}>
      <body className="bg-background text-muted font-body antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
