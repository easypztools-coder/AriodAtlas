/**
 * ─── TEST SOLDCOMPS ────────────────────────────────────────────────────────
 *
 * Dry-run test for the SoldComps API integration.
 *
 * Usage:
 *   npx tsx scripts/test-soldcomps.ts [query]
 *
 * Examples:
 *   npx tsx scripts/test-soldcomps.ts "Alocasia Venom"
 *   npx tsx scripts/test-soldcomps.ts "Monstera Devil Monster"
 *   npx tsx scripts/test-soldcomps.ts "Philodendron spiritus sancti"
 *
 * Requires:
 *   - SOLDCOMPS_API_KEY env var set
 *
 * What it does:
 *   1. Calls fetchSoldCompsRaw with the given query
 *   2. Normalises and filters all results using the plant's priceTracking config
 *      (if a matching slug is found in content/plants/)
 *   3. Logs accepted and rejected listings with reasons
 *   4. Does NOT save any data
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

import path from "path";
import fs from "fs";
import { fetchSoldCompsRaw } from "../src/lib/prices/soldcomps";
import { normaliseListing } from "../src/lib/prices/normaliseListing";
import { filterPlantListings } from "../src/lib/prices/filterPlantListings";
import type { PriceTrackingConfig } from "../src/lib/prices/types";

async function main() {
  const query = process.argv[2] ?? "Philodendron spiritus sancti";

  // Try to find a matching plant config for richer output
  const plantsRoot = path.join(process.cwd(), "content", "plants");
  let config: PriceTrackingConfig | null = null;
  let matchedSlug = "";

  for (const genus of fs.readdirSync(plantsRoot)) {
    const genusDir = path.join(plantsRoot, genus);
    if (!fs.statSync(genusDir).isDirectory()) continue;
    for (const file of fs.readdirSync(genusDir).filter(f => f.endsWith(".json"))) {
      const data = JSON.parse(fs.readFileSync(path.join(genusDir, file), "utf-8"));
      if (data.priceTracking?.query?.toLowerCase() === query.toLowerCase()) {
        config = data.priceTracking;
        matchedSlug = data.slug;
        break;
      }
    }
    if (config) break;
  }

  console.log("=".repeat(60));
  console.log("  SOLDCOMPS TEST");
  console.log("=".repeat(60));
  console.log(`\nQuery:  "${query}"`);
  if (matchedSlug) {
    console.log(`Plant:  ${matchedSlug}`);
  } else {
    console.log(`Plant:  (no matching plant config found — showing raw results only)`);
  }
  console.log();

  try {
    const raw = await fetchSoldCompsRaw({ query, maxResults: 100 });
    const normalised = raw.map(normaliseListing);

    console.log(`✓ Fetched ${raw.length} raw items\n`);

    if (config) {
      const { accepted, rejected } = filterPlantListings(normalised, config);

      console.log(`─── Accepted (${accepted.length}) ${"─".repeat(40)}`);
      accepted.forEach((item, i) => {
        console.log(`  [${i + 1}] £${item.totalPrice.toFixed(2)} — ${item.originalTitle}`);
      });

      console.log(`\n─── Rejected (${rejected.length}) ${"─".repeat(40)}`);
      const reasonGroups: Record<string, number> = {};
      rejected.forEach(({ reason }) => {
        const key = reason.split(":")[0].trim();
        reasonGroups[key] = (reasonGroups[key] ?? 0) + 1;
      });
      Object.entries(reasonGroups)
        .sort((a, b) => b[1] - a[1])
        .forEach(([reason, count]) => console.log(`  ${count}x  ${reason}`));

      if (rejected.length > 0) {
        console.log(`\n  Sample rejected titles:`);
        rejected.slice(0, 5).forEach(({ listing, reason }) => {
          console.log(`    "${listing.originalTitle}"`);
          console.log(`     → ${reason}`);
        });
      }
    } else {
      console.log(`─── First 10 raw titles ${"─".repeat(38)}`);
      normalised.slice(0, 10).forEach((item, i) => {
        console.log(`  [${i + 1}] £${item.totalPrice.toFixed(2)} ${item.currency} — ${item.originalTitle}`);
      });
    }

    console.log("\n✓ Done. No data saved.\n");
  } catch (err) {
    console.error("\n✗ Failed:");
    console.error(`   ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  }
}

main();
