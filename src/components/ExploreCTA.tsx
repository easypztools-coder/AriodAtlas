"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ExploreCTA() {
  const [speciesCount, setSpeciesCount] = useState<string>("");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.species) {
          setSpeciesCount(`${d.species} `);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative section-spacing bg-background-soft">
      <div className="section-container">
        <div className="relative overflow-hidden rounded border border-border bg-primary px-8 py-12 text-center md:px-12 md:py-16">
          {/* Decorative corner rules */}
          <div className="pointer-events-none absolute left-5 top-5 h-6 w-6 border-l border-t border-accent/30" />
          <div className="pointer-events-none absolute right-5 top-5 h-6 w-6 border-r border-t border-accent/30" />
          <div className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 border-b border-l border-accent/30" />
          <div className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 border-b border-r border-accent/30" />

          {/* Eyebrow */}
          <p className="mb-4 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-accent/80">
            The Full Directory
          </p>

          {/* Thin brass rule */}
          <div className="mx-auto mb-6 h-px w-12 bg-accent/40" />

          <h2 className="font-heading text-2xl font-semibold text-surface md:text-3xl">
            Explore the Full Database
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-surface/60">
            Browse {speciesCount || ""}species across Monstera, Philodendron, Anthurium, Alocasia and beyond — with live eBay UK market prices and value estimates.
          </p>

          <div className="mt-8">
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-sm bg-surface px-7 py-3 text-sm font-semibold tracking-wide text-primary transition-colors duration-150 hover:bg-surface-raised"
            >
              Browse All Species
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
