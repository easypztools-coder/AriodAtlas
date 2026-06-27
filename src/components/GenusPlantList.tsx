"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getStaticTierLabel } from "@/lib/prices/priceRarityTier";

interface PlantSummary {
  slug: string;
  name: string;
  scientificName: string;
  commonName: string;
  rarityStatus: string;
  priceGuideTier: string;
  botanicalType: string;
  marketStatus: string | null;
  currentMedianPriceGBP: number | null;
}

interface GenusPlantListProps {
  initialPlants: PlantSummary[];
  genus: string;
}

export function getBotanicalTypeDetails(type: string) {
  switch (type?.toLowerCase()) {
    case "species":
      return {
        label: "Wild Species",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dotClass: "bg-emerald-400",
        pillClass: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
        activePillClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
      };
    case "hybrid":
      return {
        label: "Horticultural Hybrid",
        badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        dotClass: "bg-sky-400",
        pillClass: "border-sky-500/30 text-sky-400 hover:bg-sky-500/10",
        activePillClass: "bg-sky-500/20 text-sky-300 border-sky-500/50",
      };
    case "mutation":
      return {
        label: "Sport Mutation",
        badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        dotClass: "bg-rose-400",
        pillClass: "border-rose-500/30 text-rose-400 hover:bg-rose-500/10",
        activePillClass: "bg-rose-500/20 text-rose-300 border-rose-500/50",
      };
    case "variegated":
      return {
        label: "Variegated Sport",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400",
        pillClass: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
        activePillClass: "bg-amber-500/20 text-amber-300 border-amber-500/50",
      };
    case "cultivar":
      return {
        label: "Cultivar Selection",
        badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/20",
        dotClass: "bg-violet-400",
        pillClass: "border-violet-500/30 text-violet-400 hover:bg-violet-500/10",
        activePillClass: "bg-violet-500/20 text-violet-300 border-violet-500/50",
      };
    default:
      return {
        label: "Variegated Sport",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dotClass: "bg-amber-400",
        pillClass: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
        activePillClass: "bg-amber-500/20 text-amber-300 border-amber-500/50",
      };
  }
}

export default function GenusPlantList({ initialPlants, genus }: GenusPlantListProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Calculate counts for each filter type
  const counts = initialPlants.reduce(
    (acc, plant) => {
      const type = plant.botanicalType || "variegated";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    { all: initialPlants.length } as Record<string, number>
  );

  const filterOptions = [
    { value: "all", label: "All Plants" },
    { value: "species", label: "Wild Species" },
    { value: "variegated", label: "Variegated" },
    { value: "hybrid", label: "Hybrids" },
    { value: "mutation", label: "Mutations" },
    { value: "cultivar", label: "Cultivars" },
  ];

  const filteredPlants =
    selectedFilter === "all"
      ? initialPlants
      : initialPlants.filter((plant) => (plant.botanicalType || "variegated") === selectedFilter);

  return (
    <div className="space-y-8">
      {/* Premium Filter Pill Bar */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted font-body">
          Filter by Origin Type
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {filterOptions.map((opt) => {
            const count = counts[opt.value] || 0;
            const isSelected = selectedFilter === opt.value;
            const details = opt.value !== "all" ? getBotanicalTypeDetails(opt.value) : null;

            // Styles for Active / Inactive states
            let btnClass = "border border-primary/10 text-muted hover:text-heading hover:bg-primary/5 hover:border-primary/20";
            if (isSelected) {
              if (opt.value === "all") {
                btnClass = "bg-primary text-background border-primary";
              } else if (details) {
                btnClass = details.activePillClass;
              }
            } else if (details && count > 0) {
              btnClass = `border ${details.pillClass}`;
            }

            return (
              <button
                key={opt.value}
                onClick={() => setSelectedFilter(opt.value)}
                disabled={count === 0 && !isSelected}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 shrink-0 select-none ${btnClass} ${
                  count === 0 ? "opacity-35 cursor-not-allowed border-dashed" : "cursor-pointer"
                }`}
              >
                {/* Active Indicator Dot */}
                {details && (
                  <span className={`h-1.5 w-1.5 rounded-full ${details.dotClass}`} />
                )}
                <span>{opt.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? opt.value === "all"
                        ? "bg-background/25 text-background"
                        : "bg-heading/10 text-heading"
                      : "bg-primary/5 text-muted-light"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid containing filtered cards */}
      {filteredPlants.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-primary/15 bg-card/10">
          <p className="text-muted">No plants found matching this filter.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredPlants.map((plant) => {
              const details = getBotanicalTypeDetails(plant.botanicalType);

              return (
                <motion.div
                  key={plant.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={`/plants/${genus}/${plant.slug}`}
                    className="glass-card-glow group block overflow-hidden rounded-2xl"
                  >
                    {/* Full botanical plate image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-forest-dark/60">
                      <Image
                        src={`/plants/${genus}/${plant.slug}.png`}
                        alt={plant.commonName}
                        fill
                        className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/plant-placeholder.png";
                        }}
                      />
                      {/* Bottom gradient for text legibility */}
                      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-forest-dark via-forest-dark/80 to-transparent pointer-events-none" />

                      {/* Info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase mb-2 ${details.badgeClass}`}
                        >
                          <span className={`h-1 w-1 rounded-full ${details.dotClass}`} />
                          {details.label}
                        </span>
                        <h3 className="text-sm font-heading font-bold text-heading italic group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {plant.scientificName}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-muted/80 truncate">{plant.commonName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="badge-price text-[10px]">
                            {plant.currentMedianPriceGBP
                              ? `£${plant.currentMedianPriceGBP.toFixed(0)} AA Price`
                              : `${plant.priceGuideTier} · ${getStaticTierLabel(plant.priceGuideTier)}`}
                          </span>
                          {plant.marketStatus && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                plant.marketStatus === "Rising"
                                  ? "bg-green-500/10 text-green-400"
                                  : plant.marketStatus === "Declining"
                                  ? "bg-orange-500/10 text-orange-400"
                                  : "bg-muted/10 text-muted-light"
                              }`}
                            >
                              {plant.marketStatus === "Rising" ? "↑" : plant.marketStatus === "Declining" ? "↓" : "→"}
                              {" "}{plant.marketStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
