import type { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Market Radar Hub | Aroid Atlas",
  description: "Live market velocity console tracking rare aroid price changes, Corrections and transaction liquidity.",
};

interface MarketMetrics {
  currentMedianPriceGBP: number | null;
  threeMonthChangePercent: number | null;
  marketStatus: string | null;
}

interface PlantRecord {
  name: string;
  slug: string;
  genus: string;
  scientificName: string;
  commonName: string;
  marketMetrics: MarketMetrics;
  sampleSize: number;
}

function getLatestSnapshotSampleSize(slug: string): number {
  const dirPath = path.join(process.cwd(), "content", "price-snapshots", slug);
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    if (files.length === 0) return 0;
    const latestFile = files.sort()[files.length - 1];
    const raw = fs.readFileSync(path.join(dirPath, latestFile), "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.stats?.sampleSize ?? parsed.snapshot?.acceptedCount ?? 0;
  } catch {
    return 0;
  }
}

function loadAllPlants(): PlantRecord[] {
  const plantsRoot = path.join(process.cwd(), "content", "plants");
  const records: PlantRecord[] = [];

  if (fs.existsSync(plantsRoot)) {
    const folders = fs.readdirSync(plantsRoot).filter((f) => {
      return fs.statSync(path.join(plantsRoot, f)).isDirectory();
    });

    for (const genus of folders) {
      const dirPath = path.join(plantsRoot, genus);
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

      for (const file of files) {
        try {
          const raw = fs.readFileSync(path.join(dirPath, file), "utf-8");
          const parsed = JSON.parse(raw);
          const slug = file.replace(".json", "");
          records.push({
            name: parsed.name || parsed.scientificName,
            slug: slug,
            genus: genus.toLowerCase(),
            scientificName: parsed.scientificName,
            commonName: parsed.commonName,
            marketMetrics: parsed.marketMetrics || {
              currentMedianPriceGBP: null,
              threeMonthChangePercent: null,
              marketStatus: null,
            },
            sampleSize: getLatestSnapshotSampleSize(slug),
          });
        } catch {
          // skip malformed entries
        }
      }
    }
  }

  return records;
}

export default function RadarHubPage() {
  const allPlants = loadAllPlants();

  // 1. Top Market Gainers (sorted descending by change percent, must have change, default non-null)
  const gainers = allPlants
    .filter((p) => p.marketMetrics.threeMonthChangePercent !== null)
    .sort((a, b) => (b.marketMetrics.threeMonthChangePercent || 0) - (a.marketMetrics.threeMonthChangePercent || 0))
    .slice(0, 5);

  // 2. Market Corrections (sorted ascending by change percent, must have change, default non-null)
  const corrections = allPlants
    .filter((p) => p.marketMetrics.threeMonthChangePercent !== null)
    .sort((a, b) => (a.marketMetrics.threeMonthChangePercent || 0) - (b.marketMetrics.threeMonthChangePercent || 0))
    .slice(0, 5);

  // 3. High-Liquidity Specimens (sorted descending by sample size)
  const liquidity = allPlants
    .sort((a, b) => b.sampleSize - a.sampleSize)
    .slice(0, 5);

  return (
    <div className="section-container py-16 md:py-24">
      {/* Header section */}
      <div className="mb-12 border-b border-border/30 pb-8">
        <span className="font-body text-xs font-semibold tracking-widest uppercase text-accent">
          Market Velocity Console
        </span>
        <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-heading md:text-5xl">
          Market Radar Hub
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Real-time transaction momentum analysis across rare aroid catalog listings. Track positive trends,
          downward corrections, and active transaction liquidity in the UK collector market.
        </p>
      </div>

      {/* Grid console */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Column 1: Gainers */}
        <div className="rounded-xl border border-border/30 bg-surface p-6 shadow-card-sm">
          <div className="mb-6">
            <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-leaf">
              Bullish Momentum
            </span>
            <h2 className="mt-1 font-heading text-xl font-semibold italic text-heading">
              Top Market Gainers
            </h2>
            <p className="text-[11px] text-muted">Steepest 90d positive median price increases.</p>
          </div>
          <div className="space-y-3">
            {gainers.length > 0 ? (
              gainers.map((plant) => {
                const change = plant.marketMetrics.threeMonthChangePercent || 0;
                return (
                  <Link
                    key={plant.slug}
                    href={`/plants/${plant.genus}/${plant.slug}`}
                    className="group flex items-center justify-between rounded-lg border border-border/20 bg-background-soft/40 p-3 transition-all duration-300 ease-in-out hover:border-border-strong hover:-translate-y-0.5 hover:shadow-glass"
                  >
                    <div>
                      <h3 className="font-heading text-xs font-semibold italic text-heading transition-colors group-hover:text-primary">
                        {plant.scientificName}
                      </h3>
                      <p className="text-[10px] text-muted">{plant.commonName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-leaf">
                        +{change.toFixed(1)}%
                      </span>
                      <p className="font-mono text-[9px] text-muted">
                        £{plant.marketMetrics.currentMedianPriceGBP}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-center text-xs text-muted py-6">No positive trajectory records tracked.</p>
            )}
          </div>
        </div>

        {/* Column 2: Corrections */}
        <div className="rounded-xl border border-border/30 bg-surface p-6 shadow-card-sm">
          <div className="mb-6">
            <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-rarity">
              Bearish Momentum
            </span>
            <h2 className="mt-1 font-heading text-xl font-semibold italic text-heading">
              Market Corrections
            </h2>
            <p className="text-[11px] text-muted">Steepest 90d negative median price adjustments.</p>
          </div>
          <div className="space-y-3">
            {corrections.length > 0 ? (
              corrections.map((plant) => {
                const change = plant.marketMetrics.threeMonthChangePercent || 0;
                return (
                  <Link
                    key={plant.slug}
                    href={`/plants/${plant.genus}/${plant.slug}`}
                    className="group flex items-center justify-between rounded-lg border border-border/20 bg-background-soft/40 p-3 transition-all duration-300 ease-in-out hover:border-border-strong hover:-translate-y-0.5 hover:shadow-glass"
                  >
                    <div>
                      <h3 className="font-heading text-xs font-semibold italic text-heading transition-colors group-hover:text-primary">
                        {plant.scientificName}
                      </h3>
                      <p className="text-[10px] text-muted">{plant.commonName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-rarity">
                        {change.toFixed(1)}%
                      </span>
                      <p className="font-mono text-[9px] text-muted">
                        £{plant.marketMetrics.currentMedianPriceGBP}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-center text-xs text-muted py-6">No correction records tracked.</p>
            )}
          </div>
        </div>

        {/* Column 3: High-Liquidity */}
        <div className="rounded-xl border border-border/30 bg-surface p-6 shadow-card-sm">
          <div className="mb-6">
            <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-accent">
              Active Trade
            </span>
            <h2 className="mt-1 font-heading text-xl font-semibold italic text-heading">
              High-Liquidity Specimens
            </h2>
            <p className="text-[11px] text-muted">Most active specimens by transactional sample volume.</p>
          </div>
          <div className="space-y-3">
            {liquidity.length > 0 ? (
              liquidity.map((plant) => {
                return (
                  <Link
                    key={plant.slug}
                    href={`/plants/${plant.genus}/${plant.slug}`}
                    className="group flex items-center justify-between rounded-lg border border-border/20 bg-background-soft/40 p-3 transition-all duration-300 ease-in-out hover:border-border-strong hover:-translate-y-0.5 hover:shadow-glass"
                  >
                    <div>
                      <h3 className="font-heading text-xs font-semibold italic text-heading transition-colors group-hover:text-primary">
                        {plant.scientificName}
                      </h3>
                      <p className="text-[10px] text-muted">{plant.commonName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-heading">
                        {plant.sampleSize} sales
                      </span>
                      <p className="font-mono text-[9px] text-muted">
                        £{plant.marketMetrics.currentMedianPriceGBP || "—"}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-center text-xs text-muted py-6">No transaction records available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
