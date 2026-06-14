import fs from "fs";
import path from "path";
import { PriceSnapshot, PriceListing } from "./types";

/**
 * ─── PRICE DATABASE ──────────────────────────────────────────────────────
 *
 * Storage layer for price snapshots.
 *
 * Reads from the repo's content/price-snapshots/{slug}/latest.json.
 * This file is created by the GitHub Actions workflow after fetching
 * from the admin endpoint, then committed back to the repo.
 *
 * Structure:
 *   content/price-snapshots/{slug}/latest.json
 *   content/price-snapshots/{slug}/{timestamp}.json (optional, by workflow)
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

const BASE_DIR = path.join(process.cwd(), "content", "price-snapshots");

/**
 * Load the latest snapshot for a given plant slug.
 * Returns null if no snapshot exists.
 */
export async function loadLatestSnapshot(
  slug: string
): Promise<{ snapshot: PriceSnapshot; listings: PriceListing[] } | null> {
  try {
    const latestPath = path.join(BASE_DIR, slug, "latest.json");
    if (!fs.existsSync(latestPath)) return null;

    const raw = fs.readFileSync(latestPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * List all snapshot timestamps for a given plant slug.
 */
export async function listSnapshots(slug: string): Promise<string[]> {
  try {
    const slugDir = path.join(BASE_DIR, slug);
    if (!fs.existsSync(slugDir)) return [];

    return fs
      .readdirSync(slugDir)
      .filter((f) => f.endsWith(".json") && f !== "latest.json")
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}