import fs from "fs";
import path from "path";

const targetDir = path.join(process.cwd(), "Finished Plates");

function main() {
  const files = fs.readdirSync(targetDir);
  const rawImages = files.filter(f => f.startsWith("ChatGPT Image"));
  const namedImages = files.filter(f => !f.startsWith("ChatGPT Image") && f.endsWith(".png"));

  console.log(`Found ${rawImages.length} raw ChatGPT images and ${namedImages.length} named images.`);

  const namedSizes = new Map<number, string[]>();
  for (const f of namedImages) {
    const stat = fs.statSync(path.join(targetDir, f));
    const list = namedSizes.get(stat.size) || [];
    list.push(f);
    namedSizes.set(stat.size, list);
  }

  let matchedCount = 0;
  for (const raw of rawImages) {
    const stat = fs.statSync(path.join(targetDir, raw));
    const size = stat.size;
    const matches = namedSizes.get(size);
    if (matches) {
      console.log(`Match: "${raw}" (${size} bytes) -> ${matches.join(", ")}`);
      matchedCount++;
    } else {
      console.log(`No match: "${raw}" (${size} bytes)`);
    }
  }

  console.log(`\nMatched ${matchedCount} out of ${rawImages.length} raw images.`);
}

main();
