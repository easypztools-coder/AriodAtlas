"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStaticTierLabel } from "@/lib/prices/priceRarityTier";

interface SearchPlant {
  slug: string;
  name: string;
  scientificName: string;
  commonName: string;
  genus: string;
  rarityStatus: string;
  priceGuideTier: string;
}

function StatCard({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      className="flex flex-col items-center gap-1 border-r border-border px-5 py-2 text-center last:border-r-0"
    >
      <span className="font-heading text-xl font-semibold text-heading tabular-nums">{value}</span>
      <span className="text-[9px] uppercase tracking-[0.12em] text-muted">{label}</span>
    </motion.div>
  );
}

const LIVE_STAT_LABELS = [
  { key: "species", label: "Species Tracked" },
  { key: "genera", label: "Genera Covered" },
  { key: "soldCompsAnalysed", label: "Prices Tracked" },
] as const;

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPlant[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [liveStats, setLiveStats] = useState<Record<string, string>>({});
  const [allPlants, setAllPlants] = useState<SearchPlant[]>([]);
  const [indexLoading, setIndexLoading] = useState(false);
  const [indexLoaded, setIndexLoaded] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) =>
        setLiveStats({
          species: d.species.toString(),
          genera: d.genera.toString(),
          soldCompsAnalysed: d.soldCompsAnalysed.toLocaleString(),
        })
      )
      .catch(() => {});
  }, []);

  function ensureSearchIndexLoaded() {
    if (indexLoaded || indexLoading) return;
    setIndexLoading(true);
    fetch("/api/plants")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllPlants(data);
          setIndexLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load search index in Hero:", err);
      })
      .finally(() => {
        setIndexLoading(false);
      });
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(value: string) {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const q = value.toLowerCase();
    const results = allPlants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.commonName.toLowerCase().includes(q) ||
        p.genus.toLowerCase().includes(q)
    );
    setSearchResults(results);
    setShowResults(results.length > 0);
  }

  function handleSelect(slug: string, genus: string) {
    setSearchQuery("");
    setShowResults(false);
    router.push(`/plants/${genus.toLowerCase()}/${slug}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
      handleSelect(searchResults[0].slug, searchResults[0].genus);
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* Subtle warm-brass glow */}
      <div className="hero-glow pointer-events-none absolute inset-0" />

      <div className="section-container relative py-10 md:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">

          {/* ── Left: Text Content ──────────────────────────────── */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-5"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-accent/60" />
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                  The Rare Plant Directory
                </p>
              </div>

              {/* Headline */}
              <h1 className="font-heading text-4xl font-semibold leading-[1.15] text-heading md:text-5xl lg:text-[52px]">
                A curated atlas of rare aroids and their estimated value.
              </h1>

              {/* Supporting copy */}
              <p className="max-w-md text-base leading-relaxed text-muted">
                Explore recognised species, cultivated forms, market history and current value estimates — curated for the serious collector.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative max-w-lg"
              ref={searchRef}
            >
              <form onSubmit={handleSearchSubmit}>
                <svg
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={ensureSearchIndexLoaded}
                  placeholder="Search species, cultivars or common names..."
                  className="w-full rounded-sm border border-border bg-surface py-3.5 pl-11 pr-4 text-sm text-heading placeholder-muted/50 outline-none transition-all duration-150 focus:border-primary/40 focus:shadow-glow"
                />
              </form>

              {/* Search Results Dropdown */}
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded border border-border bg-surface shadow-glass-hover"
                >
                  {searchResults.slice(0, 6).map((plant) => (
                    <button
                      key={plant.slug}
                      onClick={() => handleSelect(plant.slug, plant.genus)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-100 hover:bg-background-soft"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-[10px] font-semibold text-primary">
                        {plant.genus.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium italic text-heading">
                          {plant.scientificName}
                        </p>
                        <p className="truncate text-[10px] text-muted">{plant.commonName}</p>
                      </div>
                      <span className="badge-price shrink-0">
                        {plant.priceGuideTier} · {getStaticTierLabel(plant.priceGuideTier)}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/plants" className="btn-primary">
                Explore the atlas
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link href="/learn" className="text-sm font-medium text-muted underline underline-offset-4 transition-colors duration-150 hover:text-heading">
                View care guides
              </Link>
            </motion.div>

            {/* Live Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="inline-flex items-stretch divide-x divide-border rounded border border-border bg-surface">
                {LIVE_STAT_LABELS.map((s, i) => (
                  <StatCard key={s.key} label={s.label} value={liveStats[s.key] ?? "—"} index={i} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Hero Plant Image ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-sm md:max-w-md mx-auto">
              {/* Subtle decorative ring */}
              <div className="absolute -inset-4 rounded-full border border-accent/10 opacity-60" />
              <div className="absolute -inset-8 rounded-full border border-accent/5 opacity-40" />

              {/* Plant image card */}
              <Link
                href="/plants/philodendron/spiritus-sancti"
                className="group relative block overflow-hidden rounded border border-border bg-surface shadow-glass transition-all duration-200 hover:border-border-strong hover:shadow-glass-hover"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src="/plants/philodendron/spiritus-sancti.png"
                    alt="Philodendron spiritus-sancti — Featured Specimen"
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  {/* Warm ivory fade at base */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
                </div>

                {/* Caption */}
                <div className="px-5 pb-4 pt-2">
                  {/* Fine brass rule above caption */}
                  <div className="mb-3 h-px w-full bg-accent/25" />
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-body text-[9px] uppercase tracking-[0.18em] text-accent">
                        Featured Specimen
                      </p>
                      <p className="mt-0.5 font-heading text-sm italic text-heading">
                        Philodendron spiritus-sancti
                      </p>
                    </div>
                    <svg className="h-4 w-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
