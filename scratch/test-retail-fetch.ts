import fs from "fs";
import path from "path";
import { getDbPool } from "../src/lib/db";
import { runRetailerAdapter } from "../src/lib/retail/runRetailerAdapter";
import { matchProduct } from "../src/lib/retail/matcher";

// Load env
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envConfig.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...values] = trimmed.split("=");
      const value = values.join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key.trim()] = value;
    }
  }
}

async function testFetch() {
  console.log("Testing Soilboy Shopify JSON adapter...");
  const db = getDbPool();

  const testRetailer = {
    slug: "grow-tropicals",
    name: "Grow Tropicals",
    url: "https://growtropicals.com",
    method: "shopify_json" as const,
  };

  try {
    const products = await runRetailerAdapter(testRetailer);
    console.log(`Fetched ${products.length} products from Soilboy.`);

    if (products.length === 0) {
      console.log("No products returned. Testing Conservatory Archives instead...");
      const fallbackRetailer = {
        slug: "conservatory-archives",
        name: "Conservatory Archives",
        url: "https://conservatoryarchives.co.uk",
        method: "shopify_json" as const,
      };
      const fallbackProds = await runRetailerAdapter(fallbackRetailer);
      console.log(`Fetched ${fallbackProds.length} products from Conservatory Archives.`);
      products.push(...fallbackProds);
    }

    // Load enabled plants
    const plantsRoot = path.join(process.cwd(), "content", "plants");
    const enabledPlants: any[] = [];
    const genera = fs.readdirSync(plantsRoot).filter((f) => {
      return fs.statSync(path.join(plantsRoot, f)).isDirectory();
    });

    for (const genus of genera) {
      const genusDir = path.join(plantsRoot, genus);
      const files = fs.readdirSync(genusDir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        const data = JSON.parse(fs.readFileSync(path.join(genusDir, file), "utf-8"));
        if (data.priceTracking && data.priceTracking.enabled) {
          enabledPlants.push(data);
        }
      }
    }

    console.log(`Loaded ${enabledPlants.length} price-tracking enabled plants.`);
    const allPlantsList = enabledPlants.map((p) => ({
      slug: p.slug,
      genus: p.genus,
      species: p.species,
      cultivar: p.name.match(/'([^']+)'/)?.[1] || undefined,
    }));

    let matchCount = 0;
    for (const prod of products) {
      for (const plant of enabledPlants) {
        const match = matchProduct(prod.title, plant, allPlantsList);
        if (match.confidence >= 0.65) {
          console.log(`Match Found!
            Product: "${prod.title}" (£${prod.priceGbp})
            Plant:   "${plant.name}" (${plant.slug})
            Conf:    ${match.confidence.toFixed(2)}
            Reason:  ${match.reason}
            Type:    ${match.itemType}
          `);
          matchCount++;
        }
      }
    }

    console.log(`Total high/medium confidence matches found: ${matchCount}`);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await db.end();
  }
}

testFetch();
