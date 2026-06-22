import fs from "fs";
import path from "path";
import { PriceSnapshot, PriceListing } from "./types";

const BASE_DIR = path.join(process.cwd(), "content", "price-snapshots");

/** Individual listing data saved alongside the snapshot for bucketing by month */
interface SavedListing {
  soldPrice: number;
  totalPrice: number;
  soldDate: string | null;
  listingType: string;
  currency: string;
  title?: string;
  url?: string;
}

/** Shape of the saved latest.json */
interface SavedData {
  snapshot: PriceSnapshot;
  stats?: Record<string, unknown>;
  acceptedListings?: SavedListing[];
  acceptedCount?: number;
  rejectedCount?: number;
}

/**
 * Load the latest snapshot for a given plant slug.
 * Returns null if no snapshot exists.
 */
export function loadLatestSnapshot(
  slug: string
): { snapshot: PriceSnapshot; listings: PriceListing[] } | null {
  let data: SavedData | null = null;

  try {
    const latestPath = path.join(BASE_DIR, slug, "latest.json");
    if (fs.existsSync(latestPath)) {
      data = JSON.parse(fs.readFileSync(latestPath, "utf-8"));
    }
  } catch {
    // malformed snapshot
  }

  if (!data || !data.snapshot) return null;

  // Map listings to the expected PriceListing shape
  const listings: PriceListing[] = (data.acceptedListings ?? []).map(
    (l) => ({
      plantSlug: slug,
      title: l.title ?? "",
      normalizedTitle: "",
      listingType: l.listingType as import("./types").ListingType,
      lotSize: 1,
      soldPrice: l.soldPrice,
      shippingPrice: 0,
      totalPrice: l.totalPrice,
      unitPrice: l.totalPrice,
      currency: l.currency,
      soldDate: l.soldDate,
      seller: "",
      condition: "",
      url: l.url ?? "",
      accepted: true,
      rejectionReason: null,
      isOutlier: false,
    })
  );

  return { snapshot: data.snapshot, listings };
}

/**
 * List all snapshot timestamps for a given plant slug.
 */
export function listSnapshots(slug: string): string[] {
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