#!/usr/bin/env node

const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("Error: OPENROUTER_API_KEY environment variable is not set.");
  process.exit(1);
}

const slug = process.argv[2];
if (!slug) {
  console.error("Error: Please provide a plant slug as the first argument.");
  console.error("Usage: node scripts/generate-plant-image.js <slug>");
  process.exit(1);
}

// Load the plant dataset to get the scientific name
const datasetPath = path.resolve(
  __dirname,
  "..",
  "content",
  "plants",
  "philodendron",
  `${slug}.json`
);

let scientificName;
try {
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
  scientificName = dataset.scientificName || dataset.name;
} catch (err) {
  console.error(`Error: Could not load dataset for slug "${slug}".`, err.message);
  process.exit(1);
}

// Aspect ratio mapping: use prompt injection for 3:4 vertical composition
const aspectRatioPrompt = "3:4 aspect ratio, vertical composition.";

// Construct the prompt using the aesthetic formula with scientific name
const prompt = `${scientificName}, isolated high-fidelity studio botanical illustration plate. Crisp macro photography. Single mature plant growing vertically on a clean moss pole, planted inside a clear minimalist glass cylinder pot filled with premium aroid bark mix. Completely clean, solid off-white parchment paper background (#F2F1EC). Soft flat professional studio lighting, hyper-detailed vein textures, zero shadows, high contrast, scientific atlas style, shot on 35mm lens, f/8 aperture for deep focus, 8k resolution. ${aspectRatioPrompt}`;

const requestBody = JSON.stringify({
  model: "black-forest-labs/flux-1-schnell",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    },
  ],
  modalities: ["image"],
  // Request the image URL format in response
  response_format: {
    type: "json_object",
  },
});

const options = {
  hostname: "openrouter.ai",
  path: "/api/v1/chat/completions",
  method: "POST",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  },
};

console.log(`Generating image for "${scientificName}" (slug: ${slug})...`);

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const response = JSON.parse(data);

      // Try to extract image URL from the response
      // OpenRouter image generation may return images in various formats:
      // 1. As a markdown image link in the content: ![image](url)
      // 2. As a JSON object with an image URL
      // 3. Via the choices[0].message.content as a direct URL

      const content = response.choices?.[0]?.message?.content;

      if (!content) {
        // Check for image field in response structure
        const imageUrl =
          response.choices?.[0]?.message?.image ||
          response.data?.[0]?.url ||
          response.output?.[0]?.image_url;

        if (imageUrl) {
          downloadImage(imageUrl, slug);
          return;
        }

        console.error("Error: No content in API response.");
        console.error("Response:", JSON.stringify(response, null, 2));
        process.exit(1);
      }

      // Case 1: content is a string — try to extract markdown image URL
      if (typeof content === "string") {
        const urlMatch = content.match(/!\[.*?\]\((.*?)\)/);
        const imageUrl = urlMatch ? urlMatch[1] : content.trim();

        if (imageUrl && imageUrl.startsWith("http")) {
          downloadImage(imageUrl, slug);
          return;
        }
      }

      // Case 2: content is already a URL string
      if (typeof content === "string" && content.startsWith("http")) {
        downloadImage(content, slug);
        return;
      }

      // Case 3: content might be a JSON object with an image_url field
      if (typeof content === "object") {
        const imageUrl =
          content.image_url ||
          content.url ||
          content.image ||
          content.data?.url;

        if (imageUrl) {
          downloadImage(imageUrl, slug);
          return;
        }
      }

      console.error("Error: Could not extract image URL from response.");
      console.error("Content:", content);
      console.error("Response:", JSON.stringify(response, null, 2));
      process.exit(1);
    } catch (err) {
      console.error("Error parsing API response:", err.message);
      console.error("Raw response:", data);
      process.exit(1);
    }
  });
});

req.on("error", (err) => {
  console.error("Error making API request:", err.message);
  process.exit(1);
});

req.write(requestBody);
req.end();

/**
 * Download the image from a URL and save it to public/images/plants/<slug>.jpg
 */
function downloadImage(imageUrl, slug) {
  console.log(`Downloading image from: ${imageUrl}`);

  // Ensure the output directory exists
  const outputDir = path.resolve(__dirname, "..", "public", "images", "plants");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${slug}.jpg`);

  https.get(imageUrl, (imageRes) => {
    // Handle redirects
    if (imageRes.statusCode >= 300 && imageRes.statusCode < 400 && imageRes.headers.location) {
      downloadImage(imageRes.headers.location, slug);
      return;
    }

    const fileStream = fs.createWriteStream(outputPath);
    imageRes.pipe(fileStream);

    fileStream.on("finish", () => {
      fileStream.close();
      console.log(`Image saved to: ${outputPath}`);
    });
  }).on("error", (err) => {
    console.error("Error downloading image:", err.message);
    process.exit(1);
  });
}