#!/usr/bin/env node

const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const APIFY_API_KEY = process.env.APIFY_API_KEY;

if (!APIFY_API_KEY) {
  console.error("Error: APIFY_API_KEY environment variable is not set.");
  process.exit(1);
}

/**
 * Recursively find all JSON files inside a directory.
 */
function findJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Make a POST request to the Apify synchronous API and return parsed JSON.
 */
function runApifySync(keywords) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      keywords: [keywords],
      ebaySite: "ebay.co.uk",
      sortOrder: "endedRecently",
      daysToScrape: 30,
      count: 25,
    });

    const urlPath = `/v2/acts/caffein.dev~ebay-sold-listings/run-sync-get-dataset-items?token=${APIFY_API_KEY}`;

    const options = {
      hostname: "api.apify.com",
      path: urlPath,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Failed to parse Apify response: ${err.message}. Raw: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`Apify request failed: ${err.message}`));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Sanitize price data: filter GBP, sort, trim outliers, compute median.
 * Returns { median, totalItems, sanitizedCount } or null if no valid data.
 */
function sanitizePrices(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // Step 1: Filter out non-GBP transactions
  const gbpItems = items.filter(
    (item) => item.soldCurrency === "GBP" && item.soldPrice != null
  );

  if (gbpItems.length === 0) {
    return null;
  }

  // Step 2: Extract numerical values from soldPrice and sort ascending
  const prices = gbpItems
    .map((item) => {
      const price = parseFloat(item.soldPrice);
      return isNaN(price) ? null : price;
    })
    .filter((p) => p !== null)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return null;
  }

  // Step 3: If 5 or more listings, trim lowest 20% and highest 20%
  let sanitizedPrices;

  if (prices.length >= 5) {
    const trimCount = Math.ceil(prices.length * 0.2);
    sanitizedPrices = prices.slice(trimCount, prices.length - trimCount);
  } else {
    sanitizedPrices = prices;
  }

  if (sanitizedPrices.length === 0) {
    return null;
  }

  // Step 4: Calculate median
  const sorted = sanitizedPrices.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  return {
    median,
    totalItems: prices.length,
    sanitizedCount: sanitized.length,
  };
}

/**
 * Calculate percentage change between two values.
 */
function percentChange(oldVal, newVal) {
  if (oldVal === 0) return 0;
  return ((newVal - oldVal) / oldVal) * 100;
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get a date N months ago as a YYYY-MM-DD string (approximate).
 */
function getMonthsAgoDate(monthsAgo) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Update the plant JSON file with new price history and market metrics.
 */
function updatePlantFile(filePath, result) {
  const dataset = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Ensure marketMetrics and priceHistory exist
  if (!dataset.marketMetrics) {
    dataset.marketMetrics = {};
  }
  if (!dataset.priceHistory) {
    dataset.priceHistory = [];
  }

  const today = getTodayString();

  // Append new snapshot
  dataset.priceHistory.push({
    date: today,
    medianPriceGBP: Math.round(result.median * 100) / 100,
    dataPointsAnalyzed: result.totalItems,
  });

  // Cap history at 52 items — remove oldest if over
  if (dataset.priceHistory.length > 52) {
    dataset.priceHistory = dataset.priceHistory.slice(
      dataset.priceHistory.length - 52
    );
  }

  // Update current median
  dataset.marketMetrics.currentMedianPriceGBP =
    Math.round(result.median * 100) / 100;

  // Calculate three-month change: compare current median to ~3 months ago
  const threeMonthsAgo = getMonthsAgoDate(3);
  const threeMonthEntry = dataset.priceHistory.find(
    (entry) => entry.date >= threeMonthsAgo
  );

  if (threeMonthEntry && threeMonthEntry.medianPriceGBP > 0) {
    const change = percentChange(
      threeMonthEntry.medianPriceGBP,
      dataset.marketMetrics.currentMedianPriceGBP
    );
    dataset.marketMetrics.threeMonthChangePercent =
      Math.round(change * 10) / 10;
  }

  // Determine market status dynamically
  if (dataset.marketMetrics.threeMonthChangePercent < -10) {
    dataset.marketMetrics.marketStatus = "Volatile";
  } else if (dataset.marketMetrics.threeMonthChangePercent > 10) {
    dataset.marketMetrics.marketStatus = "Rising";
  } else if (dataset.marketMetrics.threeMonthChangePercent < -3) {
    dataset.marketMetrics.marketStatus = "Declining";
  } else {
    dataset.marketMetrics.marketStatus = "Stable";
  }

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2) + "\n", "utf-8");
  console.log(`Updated: ${filePath}`);
}

/**
 * Main entry point.
 */
async function main() {
  const contentDir = path.resolve(__dirname, "..", "content", "plants");

  if (!fs.existsSync(contentDir)) {
    console.error("Error: content/plants directory not found.");
    process.exit(1);
  }

  const jsonFiles = findJsonFiles(contentDir);

  if (jsonFiles.length === 0) {
    console.error("Error: No JSON files found in content/plants/.");
    process.exit(1);
  }

  console.log(`Found ${jsonFiles.length} plant data file(s) to process.`);

  for (const filePath of jsonFiles) {
    const dataset = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const scientificName = dataset.scientificName || dataset.name;

    if (!scientificName) {
      console.warn(`Warning: No name found in ${filePath}, skipping.`);
      continue;
    }

    console.log(`\nFetching prices for "${scientificName}"...`);

    try {
      const responseData = await runApifySync(scientificName);

      // Apify run-sync-get-dataset-items returns the dataset items directly as an array
      const items = Array.isArray(responseData) ? responseData : [];

      if (items.length === 0) {
        console.warn(`No data returned for "${scientificName}", skipping.`);
        continue;
      }

      const result = sanitizePrices(items);

      if (!result) {
        console.warn(`No valid GBP pricing data for "${scientificName}", skipping.`);
        continue;
      }

      console.log(
        `  Total items: ${result.totalItems}, Sanitized: ${result.sanitizedCount}, Median: £${result.median.toFixed(2)}`
      );

      updatePlantFile(filePath, result);
    } catch (err) {
      console.error(`Error processing "${scientificName}": ${err.message}`);
      // Continue with next file instead of exiting
    }
  }

  console.log("\nPrice sync complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});