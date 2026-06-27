import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aroidatlas.co.uk"),
  title: {
    default: "Aroid Atlas — Rare Houseplant Price Guide",
    template: "%s | Aroid Atlas",
  },
  description:
    "Know what every rare houseplant is worth. Live UK auction prices and retailer data for 170+ tropical species including Monstera, Philodendron, Anthurium and Alocasia.",
  keywords: [
    "rare houseplant price",
    "rare houseplant value",
    "houseplant price guide",
    "rare tropical plants UK",
    "monstera price",
    "philodendron price",
    "anthurium price",
    "alocasia price",
    "rare plants for sale UK",
    "aroid price guide",
  ],
  authors: [{ name: "Aroid Atlas" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Aroid Atlas",
    title: "Aroid Atlas — Rare Tropical Plant Encyclopedia",
    description:
      "The visual encyclopedia of rare tropical plants. Live eBay UK market prices, species profiles, and cultivation data.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aroid Atlas — Rare Tropical Plant Encyclopedia",
    description:
      "The visual encyclopedia of rare tropical plants. Live market prices and species profiles.",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aroid Atlas",
  url: "https://aroidatlas.co.uk",
  logo: "https://aroidatlas.co.uk/images/aroidatlas-emblem-transparent-tight.png",
  description:
    "The visual encyclopedia of rare tropical plants. Live eBay UK market prices, species profiles, and cultivation data.",
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${inter.variable}`}>
      <body className="bg-background text-muted font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
