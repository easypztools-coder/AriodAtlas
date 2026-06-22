import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDbPool } from "@/lib/db";

export async function GET() {
  const plantsRoot = path.join(process.cwd(), "content", "plants");

  let species = 0;
  let generaCount = 0;

  if (fs.existsSync(plantsRoot)) {
    const generaDirs = fs
      .readdirSync(plantsRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const genusDir of generaDirs) {
      const files = fs
        .readdirSync(path.join(plantsRoot, genusDir.name))
        .filter((f) => f.endsWith(".json"));
      if (files.length > 0) {
        generaCount++;
        species += files.length;
      }
    }
  }

  // Retail price observation count from DB; fall back to eBay filesystem
  // snapshots if no DB is configured (local dev without a database).
  let retailPricesTracked = 0;
  const hasDb = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

  if (hasDb) {
    try {
      const db = getDbPool();
      const res = await db.query(
        "SELECT COUNT(*)::int AS count FROM retail_price_observations"
      );
      retailPricesTracked = res.rows[0]?.count ?? 0;
    } catch {
      // DB unavailable — leave at 0
    }
  } else {
    // Filesystem fallback: sum acceptedCount from eBay price snapshots
    const snapshotsRoot = path.join(process.cwd(), "content", "price-snapshots");
    if (fs.existsSync(snapshotsRoot)) {
      for (const slugDir of fs.readdirSync(snapshotsRoot, { withFileTypes: true }).filter((d) => d.isDirectory())) {
        const latestPath = path.join(snapshotsRoot, slugDir.name, "latest.json");
        if (fs.existsSync(latestPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(latestPath, "utf-8"));
            retailPricesTracked += data.acceptedCount ?? 0;
          } catch {
            // malformed snapshot — skip
          }
        }
      }
    }
  }

  return NextResponse.json({
    species,
    genera: generaCount,
    soldCompsAnalysed: retailPricesTracked,
  });
}
