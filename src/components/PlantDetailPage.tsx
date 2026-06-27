"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const PriceHistoryChart = dynamic(() => import("@/components/PriceHistoryChart"), {
  loading: () => <div className="h-48 animate-pulse rounded bg-background-soft" />,
  ssr: false,
});
import type { PriceHistoryPoint } from "@/lib/prices/types";
import { getPriceRarityTier, getStaticTierLabel, TIER_RANGES } from "@/lib/prices/priceRarityTier";
import { getBotanicalTypeDetails } from "@/components/GenusPlantList";

interface PricePoint {
  date: string;
  medianPriceGBP: number;
  dataPointsAnalyzed: number;
}

interface RecommendedPlant {
  name: string;
  slug: string;
  rarity: string;
  price: string;
  genus?: string;
}

interface QuickFacts {
  growthHabit: string;
  matureSize: string;
  light: string;
  humidity: string;
  temperature: string;
  difficulty: string;
  growthSpeed: string;
}

interface Morphology {
  leafShape: string;
  leafLength: string;
  leafWidth: string;
  petioleColor: string;
  venation: string;
  texture: string;
  variegation: string;
  growthHabit: string;
}

interface PlantData {
  name: string;
  slug: string;
  scientificName: string;
  commonName: string;
  statusTag: string;
  botanicalType: string;
  family: string;
  genus: string;
  species: string;
  origin: string;
  collectorPopularity: number;
  rarityStatus: string;
  availability: string;
  priceGuideTier: string;
  aboutText: string;
  quickFacts: QuickFacts;
  morphology: Morphology;
  marketMetrics: {
    currentMedianPriceGBP: number | null;
    threeMonthChangePercent: number | null;
    marketStatus: string | null;
  };
  priceHistory?: PricePoint[];
  recommendedPlants: RecommendedPlant[];
  fieldNotes?: {
    title: string;
    date: string;
    author: string;
    content: string;
  };
}

function ShareButton({ scientificName }: { scientificName: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${scientificName} on Aroid Atlas — rare plant profiles & live UK prices`;
    if (navigator.share) {
      try {
        await navigator.share({ title: scientificName, text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium text-muted transition-all duration-150 hover:border-border-strong hover:text-heading"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-leaf" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Link Copied
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

const GENUS_LABELS: Record<string, string> = {
  monstera: "Monstera",
  philodendron: "Philodendron",
  anthurium: "Anthurium",
  alocasia: "Alocasia",
  begonia: "Begonia",
  other: "Other Aroids",
};

export default function PlantDetailPage({
  data,
  genus,
}: {
  data: PlantData;
  genus: string;
}) {
  const morphEntries = Object.entries(data.morphology);
  const genusLabel = GENUS_LABELS[genus] ?? genus;

  interface RecentSale {
    title: string;
    soldPrice: number;
    totalPrice: number;
    soldDate: string | null;
    currency: string;
    url: string;
    listingType?: string;
  }

  const [soldCompsData, setSoldCompsData] = useState<PriceHistoryPoint[]>([]);
  const [fairPrice, setFairPrice] = useState<number | null>(null);
  const [fairPriceIsEstimate, setFairPriceIsEstimate] = useState(false);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [hoveredWeekDate, setHoveredWeekDate] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/plants/${data.slug}/price-history`)
      .then((res) => res.json())
      .then((json) => {
        if (json.history && Array.isArray(json.history)) {
          setSoldCompsData(json.history);
        }
        if (typeof json.fairPurchasePrice === "number") {
          setFairPrice(json.fairPurchasePrice);
        }
        setFairPriceIsEstimate(json.isEstimate === true);
        if (json.recentSales && Array.isArray(json.recentSales)) {
          setRecentSales(json.recentSales);
        }
      })
      .catch(() => {});
  }, [data.slug]);

  const [retailData, setRetailData] = useState<{
    listings: any[];
    statsByType: Record<string, any>;
    history: any[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/plants/${data.slug}/retail-market`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setRetailData({
            listings: json.listings || [],
            statsByType: json.statsByType || {},
            history: json.history || [],
          });
        }
      })
      .catch(() => {});
  }, [data.slug]);

  function getISOWeekKey(dateStr: string): string {
    const date = new Date(dateStr);
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  const retailAverage: { value: number; count: number } | null = (() => {
    if (retailData?.statsByType?.all) {
      return { value: retailData.statsByType.all.trimmedMean, count: retailData.statsByType.all.count };
    }
    if (retailData && retailData.listings.length > 0) {
      const prices = retailData.listings.map((l: any) => l.priceGbp as number);
      const mean = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      return { value: mean, count: prices.length };
    }
    return null;
  })();

  const aaDisplayPrice: { value: number; source: "ebay" | "retail" | "estimate" } | null = (() => {
    if (fairPrice !== null && !fairPriceIsEstimate) return { value: fairPrice, source: "ebay" };
    if (retailAverage !== null) return { value: Math.round(retailAverage.value), source: "retail" };
    if (fairPrice !== null) return { value: fairPrice, source: "estimate" };
    return null;
  })();

  const combinedTier = aaDisplayPrice !== null
    ? getPriceRarityTier(aaDisplayPrice.value)
    : { tier: data.priceGuideTier, label: getStaticTierLabel(data.priceGuideTier) };

  return (
    <div className="plant-detail-container">
      <div className="plant-detail-grid">

        {/* ===== LEFT COLUMN ===== */}
        <div className="plant-detail-main-col">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted">
            <Link href="/plants" className="transition-colors duration-150 hover:text-heading">
              Species
            </Link>
            <span className="text-border-strong">/</span>
            <Link href={`/plants/${genus}`} className="transition-colors duration-150 hover:text-heading">
              {genusLabel}
            </Link>
            <span className="text-border-strong">/</span>
            <span className="text-heading">{data.name}</span>
          </nav>

          {/* Heading + Status Tags */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-semibold italic leading-tight text-heading md:text-4xl">
                {data.name}
              </h1>
              <p className="mt-1 text-sm text-muted">{data.commonName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {data.botanicalType && (() => {
                const details = getBotanicalTypeDetails(data.botanicalType);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-xs font-medium ${details.badgeClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${details.dotClass}`} />
                    {details.label}
                  </span>
                );
              })()}
              {data.statusTag && (
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-rarity/10 border border-rarity/20 px-3 py-1 text-xs font-medium text-rarity">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {data.statusTag}
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <ShareButton scientificName={data.scientificName} />
          </div>

          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {combinedTier.tier} · {combinedTier.label}
            </span>
            {data.availability && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
                {data.availability}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              {data.origin}
            </span>
          </div>

          {/* ── AA Price Hero Callout ──────────────────────────────── */}
          {aaDisplayPrice !== null && (
            <div className="flex items-center gap-4 rounded border border-accent/30 bg-accent/8 px-5 py-4">
              {/* Brass top rule */}
              <div className="absolute left-0 right-0 top-0 h-px bg-accent/40" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-accent/20 bg-accent/10">
                <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536-.219-2.121-.659C8.707 9.46 8.707 8.034 9.879 7.155c1.17-.879 3.07-.879 4.242 0L15 7.818" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-accent/80">
                  Aroid Atlas Price Guide
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  The <span className="font-semibold text-heading">AA Price</span> suggests this should cost{" "}
                  <span className="font-bold text-accent text-base">£{aaDisplayPrice.value.toFixed(0)}</span>
                  {" "}—{" "}
                  {aaDisplayPrice.source === "ebay"
                    ? "based on verified eBay UK auction data"
                    : aaDisplayPrice.source === "retail"
                    ? "based on current UK retail prices"
                    : "community estimate"}
                </p>
                {soldCompsData.length > 0 && (
                  <p className="mt-1 text-[10px] text-muted/60">
                    Data as of{" "}
                    {new Date(soldCompsData[soldCompsData.length - 1].date).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <a
                href="#market-analysis"
                className="shrink-0 text-[10px] font-semibold text-accent/70 underline underline-offset-2 transition-colors duration-150 hover:text-accent"
              >
                See full data
              </a>
            </div>
          )}

          {/* Main Feature Image */}
          <div className="relative overflow-hidden rounded border border-border bg-background-soft">
            <div className="relative aspect-[3/4]">
              <Image
                src={`/plants/${genus}/${data.slug}.png`}
                alt={data.commonName}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/plant-placeholder.png";
                }}
              />
            </div>
          </div>

          {/* Morphology + About split */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 font-heading text-lg font-semibold text-heading">
                Morphology
              </h2>
              <div className="space-y-3">
                {morphEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between border-b border-border pb-2"
                  >
                    <span className="text-xs font-medium capitalize text-muted">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="max-w-[180px] text-right text-sm text-heading">
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-heading text-lg font-semibold text-heading">
                About
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-muted">
                {data.aboutText}
              </p>

              <div className="rounded border border-border bg-surface p-4">
                <h4 className="mb-3 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-heading">
                  Climate Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Origin</span>
                    <span className="font-medium text-heading">{data.origin}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Humidity</span>
                    <span className="font-medium text-heading">{data.quickFacts.humidity}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Temperature</span>
                    <span className="font-medium text-heading">{data.quickFacts.temperature}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Light</span>
                    <span className="font-medium text-heading">{data.quickFacts.light}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Family</span>
                    <span className="font-medium text-heading">{data.family}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted">Genus</span>
                    <span className="font-medium text-heading">{data.genus}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Market Analysis & Price Guide ─────────────────────── */}
          <div id="market-analysis" className="rounded border border-border bg-surface p-6 md:p-8 space-y-6">
            {/* Brass top rule */}
            <div className="-mx-6 -mt-6 mb-6 h-px bg-accent/30 md:-mx-8 md:-mt-8 md:mb-8" />

            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                Market Analysis
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-heading md:text-2xl">
                Price Guide & Market Data
              </h2>
              <p className="mt-1 text-xs text-muted">
                Historical auction metrics and live retailer listings updated weekly.
              </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* AA Price */}
              <div className="flex flex-col justify-between rounded border border-accent/25 bg-accent/8 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider text-accent/80">AA Price</span>
                  <span className="rounded-sm bg-accent/10 px-1.5 py-0.5 text-[9px] font-semibold text-accent">
                    {aaDisplayPrice?.source === "ebay"
                      ? "eBay Verified"
                      : aaDisplayPrice?.source === "retail"
                      ? "Retail Derived"
                      : "Estimate"}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  {aaDisplayPrice ? (
                    <>
                      <span className={`font-heading text-2xl font-semibold ${aaDisplayPrice.source === "estimate" ? "text-accent/60" : "text-accent"}`}>
                        £{aaDisplayPrice.value.toFixed(0)}
                      </span>
                      <span className="text-[10px] text-muted">GBP</span>
                    </>
                  ) : (
                    <span className="font-heading text-xl font-semibold text-accent/70">
                      {TIER_RANGES[data.priceGuideTier]?.label ?? "—"}
                    </span>
                  )}
                </div>
                <span className="mt-2 text-[10px] leading-relaxed text-muted">
                  {aaDisplayPrice?.source === "ebay"
                    ? "Trimmed mean of verified eBay UK sold listings"
                    : aaDisplayPrice?.source === "retail"
                    ? "Derived from current UK retail asking prices"
                    : aaDisplayPrice?.source === "estimate"
                    ? "Community estimate — limited market data"
                    : "No price data — rarity tier shown above"}
                </span>
              </div>

              {/* Retail Price */}
              <div className="flex flex-col justify-between rounded border border-border bg-background-soft p-4">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-muted">Retail Price</span>
                <div className="mt-3 flex items-baseline gap-1.5">
                  {retailAverage ? (
                    <>
                      <span className="font-heading text-2xl font-semibold text-primary">£{retailAverage.value.toFixed(0)}</span>
                      <span className="text-[10px] text-muted">GBP</span>
                    </>
                  ) : (
                    <span className="font-heading text-xl font-semibold text-muted/50">Not tracked</span>
                  )}
                </div>
                <span className="mt-2 text-[10px] leading-relaxed text-muted">
                  {retailAverage
                    ? `Trimmed mean across ${retailAverage.count} active UK listing${retailAverage.count !== 1 ? "s" : ""}`
                    : "Not currently stocked by tracked UK retailers"}
                </span>
              </div>

              {/* Market Trend */}
              <div className="flex flex-col justify-between rounded border border-border bg-background-soft p-4">
                <span className="font-body text-[10px] font-bold uppercase tracking-wider text-muted">Market Trend</span>
                <div className="mt-3 flex items-center gap-1.5">
                  {data.marketMetrics.marketStatus ? (
                    <>
                      <span className={`font-heading text-base font-semibold ${
                        data.marketMetrics.marketStatus === "Rising"
                          ? "text-leaf"
                          : data.marketMetrics.marketStatus === "Declining"
                          ? "text-accent-muted"
                          : "text-rarity"
                      }`}>
                        {data.marketMetrics.marketStatus}
                      </span>
                      {data.marketMetrics.threeMonthChangePercent !== null && (
                        <span className="text-[10px] text-muted">
                          ({data.marketMetrics.threeMonthChangePercent > 0 ? "+" : ""}{data.marketMetrics.threeMonthChangePercent.toFixed(0)}%)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-heading text-base font-semibold text-muted">—</span>
                  )}
                </div>
                <span className="mt-2 text-[10px] leading-relaxed text-muted">
                  Price direction over the last 90 days
                </span>
              </div>
            </div>

            {/* Methodology note */}
            <div className="flex items-start gap-3 rounded border border-border bg-background-soft px-4 py-3">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
              </svg>
              <p className="text-[10px] leading-relaxed text-muted">
                <span className="font-semibold text-heading/70">How prices are calculated:</span>{" "}
                The <span className="text-accent/80">AA Price</span> uses verified eBay UK completed auction data — we take the trimmed mean (removing the top and bottom 20% of prices) to produce a fair-value guide. When recent auction data is unavailable, the AA Price falls back to the current UK retail average.{" "}
                All prices are in GBP and updated automatically.
              </p>
            </div>

            {/* Price History Chart + Recent Sales */}
            <div className="border-t border-border pt-6">
              {soldCompsData.length === 0 && recentSales.length === 0 ? (
                <p className="py-4 text-center text-xs italic text-muted">
                  No eBay auction history available yet. Data is collected automatically as sales appear on eBay UK.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Chart */}
                  <div className="space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-heading">eBay Auction Price Trend</h3>
                        <p className="text-[10px] text-muted">Weekly aggregated completed auction sales in the UK</p>
                      </div>
                      {soldCompsData.length > 0 && (
                        <span className="rounded-sm border border-border bg-background-soft px-2 py-0.5 text-[10px] text-muted">
                          {soldCompsData.reduce((sum, d) => sum + d.sampleSize, 0)} sales analyzed
                        </span>
                      )}
                    </div>
                    <PriceHistoryChart data={soldCompsData} onHover={setHoveredWeekDate} />
                  </div>

                  {/* Recent Sales */}
                  <div className="flex flex-col space-y-4 lg:col-span-1">
                    <div>
                      <h3 className="text-sm font-semibold text-heading">Recent eBay Sales</h3>
                      <p className="text-[10px] text-muted">Verified completed transaction history</p>
                    </div>

                    <div className="max-h-[300px] flex-1 space-y-2 overflow-y-auto rounded border border-border bg-background-soft p-3 pr-1">
                      {recentSales && recentSales.length > 0 ? (
                        recentSales.map((sale, idx) => {
                          const displayTitle = sale.title || `${data.scientificName} - eBay Sale`;
                          const displayDate = sale.soldDate
                            ? new Date(sale.soldDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date N/A";

                          const isHighlighted =
                            hoveredWeekDate && sale.soldDate
                              ? getISOWeekKey(hoveredWeekDate) === getISOWeekKey(sale.soldDate)
                              : false;

                          const typeLabel =
                            sale.listingType && sale.listingType !== "unknown"
                              ? sale.listingType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                              : null;

                          const cardClass = [
                            "flex flex-col gap-1 rounded border p-2.5 transition-all duration-150",
                            isHighlighted
                              ? "border-accent/30 bg-accent/8"
                              : "border-border bg-surface hover:bg-background-soft",
                          ].join(" ");

                          const inner = (
                            <div className={cardClass}>
                              <div className="line-clamp-2 text-[10px] font-medium leading-snug text-heading">
                                {displayTitle}
                              </div>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                {typeLabel && (
                                  <span className="rounded-sm bg-primary/8 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                                    {typeLabel}
                                  </span>
                                )}
                                <span className="text-[9px] text-muted">{displayDate}</span>
                              </div>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-xs font-bold text-leaf">£{sale.totalPrice.toFixed(2)}</span>
                                {sale.url && (
                                  <span className="text-[9px] text-muted/60">View on eBay →</span>
                                )}
                              </div>
                            </div>
                          );

                          if (sale.url) {
                            return (
                              <a key={idx} href={sale.url} target="_blank" rel="noopener noreferrer" className="block group">
                                {inner}
                              </a>
                            );
                          }
                          return <div key={idx}>{inner}</div>;
                        })
                      ) : (
                        <p className="py-8 text-center text-xs italic text-muted">
                          {soldCompsData.length > 0
                            ? "Individual sales unavailable — chart shows aggregate data."
                            : "No recent eBay transactions found."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Retail Listings */}
            {retailData && (retailData.listings.length > 0 || Object.keys(retailData.statsByType).length > 0) && (
              <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-5">
                <div className="space-y-3 md:col-span-3">
                  <div>
                    <h3 className="text-sm font-semibold text-heading">Available Retail Specimens</h3>
                    <p className="text-[10px] text-muted">Click to visit store and purchase directly (prices include VAT)</p>
                  </div>

                  {retailData.listings.length > 0 ? (
                    <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                      {retailData.listings.map((list: any, idx: number) => (
                        <a
                          key={idx}
                          href={list.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col gap-3 rounded border border-border bg-background-soft p-3.5 transition-all duration-150 hover:border-border-strong hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="space-y-1">
                            <div className="line-clamp-1 text-xs font-semibold text-heading transition-colors duration-150 group-hover:text-primary">
                              {list.title}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-muted">
                              <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 font-medium text-primary">{list.retailerName}</span>
                              {list.potSizeCm && <span>{list.potSizeCm}cm Pot</span>}
                              {list.plantSizeLabel && <span className="capitalize">{list.plantSizeLabel.replace(/_/g, " ")}</span>}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <div className="text-sm font-bold text-leaf">
                                £{list.priceGbp.toFixed(2)}
                              </div>
                              {list.originalPriceGbp && (
                                <div className="text-[9px] text-muted line-through">
                                  £{list.originalPriceGbp.toFixed(2)}
                                </div>
                              )}
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-sm bg-primary px-3 py-1.5 text-[10px] font-semibold text-surface transition-colors duration-150 group-hover:bg-primary-dark">
                              Buy Now
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted">No retail specimens currently in stock.</p>
                  )}
                </div>

                {/* Price by Form */}
                <div className="space-y-3 md:col-span-2">
                  <div>
                    <h3 className="text-sm font-semibold text-heading">Average Price by Form</h3>
                    <p className="text-[10px] text-muted">Based on active retail listings</p>
                  </div>

                  <div className="rounded border border-border bg-background-soft p-4 space-y-3.5">
                    {Object.entries(retailData.statsByType).map(([type, stats]: [string, any]) => {
                      if (type === "all") return null;
                      const formattedType = type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={type} className="flex flex-col gap-1 border-b border-border pb-2.5 last:border-0 last:pb-0">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-muted">{formattedType}</span>
                            <span className="font-semibold text-heading">£{stats.trimmedMean.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-muted">
                            <span>Range: £{stats.min.toFixed(0)} – £{stats.max.toFixed(0)}</span>
                            <span>{stats.count} items</span>
                          </div>
                        </div>
                      );
                    })}

                    {Object.keys(retailData.statsByType).filter((k) => k !== "all").length === 0 && (
                      <p className="text-xs italic text-muted">No form statistics available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Field Notes */}
          {data.fieldNotes && (
            <div className="relative overflow-hidden rounded border-2 border-border bg-surface p-8">
              {/* Double-ruled frame */}
              <div className="pointer-events-none absolute inset-3 border border-dashed border-border" />

              {/* Brass rule at top */}
              <div className="absolute left-0 right-0 top-0 h-px bg-accent/40" />

              <div className="relative z-10 px-2 py-1">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                  <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                    Field Notes &middot; Vol. 1
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {new Date(data.fieldNotes.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="mb-3 font-heading text-xl font-semibold italic leading-tight text-heading">
                  {data.fieldNotes.title}
                </h3>

                <p className="font-heading text-sm leading-relaxed text-muted">
                  {data.fieldNotes.content}
                </p>

                <div className="mt-6 flex items-center justify-between text-xs text-muted">
                  <span className="italic">Written at AroidAtlas research station</span>
                  <span className="font-heading text-sm font-semibold italic text-heading">
                    &mdash; Aroid Aaron
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="plant-detail-sidebar-col">
          <div className="rounded border border-border bg-surface p-5">
            {/* Brass top rule */}
            <div className="-mx-5 -mt-5 mb-4 h-px bg-accent/30" />
            <h3 className="mb-4 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-heading">
              Quick Facts
            </h3>
            <div className="space-y-3">
              {Object.entries(data.quickFacts).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-2">
                  <span className="shrink-0 text-xs capitalize text-muted">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="max-w-[140px] text-right text-xs font-medium text-heading">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/learn"
              className="mt-5 block w-full rounded-sm bg-primary px-5 py-3 text-center text-sm font-semibold tracking-wide text-surface transition-colors duration-150 hover:bg-primary-dark"
            >
              View Care Guide
            </Link>
          </div>

          <a
            href={`https://www.etsy.com/uk/search?q=${encodeURIComponent(data.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-primary/30 bg-transparent px-5 py-3 text-sm font-semibold text-primary transition-all duration-150 hover:border-primary/50 hover:bg-primary/5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
            </svg>
            Find on Etsy UK
          </a>
        </div>
      </div>

      {/* ===== RECOMMENDED PLANTS ===== */}
      <div className="plant-detail-recommended-section">
        <h2 className="mb-6 font-heading text-lg font-semibold text-heading">
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.recommendedPlants.map((plant) => {
            const recommendedGenus = (plant.genus || plant.name.split(" ")[0].replace(/['"]/g, "")).toLowerCase();
            return (
              <Link
                key={plant.slug}
                href={`/plants/${recommendedGenus}/${plant.slug}`}
                className="group rounded border border-border bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-glass"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-heading transition-colors duration-150 group-hover:text-primary">
                      {plant.name}
                    </h3>
                    <div className="mt-2">
                      <span className="badge-price">
                        {plant.price} · {getStaticTierLabel(plant.price)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-border bg-background-soft">
                    <Image
                      src={`/plants/${recommendedGenus}/${plant.slug}.png`}
                      alt={plant.name}
                      fill
                      className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.06]"
                      sizes="64px"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
