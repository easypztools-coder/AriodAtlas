/**
 * AroidAtlas Plant Image Prompt Generator
 *
 * Generates scientifically accurate botanical plate prompts
 * for rare tropical plants, reusable for any species.
 */

export interface SpeciesData {
  name: string;
  family: string;
  genus: string;
  species: string;
  cultivar?: string;

  morphology: {
    leaf_shape: string;
    leaf_ratio: string;
    texture: string;
    petiole: string;
    growth_habit: string;
    mature_size: string;
  };

  critical_traits: string[];
  negative_traits: string[];

  habitat: string;
  origin: string;
}

function buildMasterStyleTemplate(data: SpeciesData): string {
  const isCultivar = !!data.cultivar;
  const classification = isCultivar
    ? "CULTIVATION"
    : data.origin.toUpperCase().includes("BRAZIL")
    ? "BRAZIL"
    : "THE WILD";
  const slugHash = data.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const derivedPlateNum = (slugHash % 9000) + 1000;

  return `
AROIDATLAS BOTANICAL PLATE — ${data.name}

Create a premium, museum-quality botanical plate of ${data.name} suitable for a luxury digital encyclopedia of rare tropical plants. The layout must match a classic 19th-century scientific natural history illustration.

STYLE REQUIREMENTS

- Scientific botanical illustration
- Natural history museum quality
- Photorealistic rendering
- Botanical accuracy prioritized over aesthetics
- Cream archival paper background with subtle paper fiber texture
- Elegant editorial layout with a thin black double-ruled border framing the entire page
- Premium field-guide aesthetic with balanced composition and clean alignment
- Soft, diffused studio lighting casting subtle natural shadows
- No fantasy elements or modern artistic liberties

LAYOUT & STRUCTURE

1. Title Section (Top):
   - Two lines of centered text at the very top:
     "AROIDATLAS BOTANICAL PLATE —" in small caps, elegant modern sans-serif.
     "${data.name}" in a large, elegant, bold serif font (italicized).
   - A delicate horizontal separator line (a thin black line with a central diamond/dot accent) immediately below the title.

2. Left Information Panel (Bordered Column):
   - Framed by a thin, elegant double-lined rectangular box with decorative ornate corners.
   - Contains the following sections separated by thin horizontal line dividers with a central diamond accent:
     - **SCIENTIFIC NAME**: in small-caps bold sans-serif, with "${data.name}" (in serif italics) below it.
     - **FAMILY**: in small-caps bold sans-serif, with "${data.family}" below it.
     - **GENUS**: in small-caps bold sans-serif, with "${data.genus}" (in italics) below it.
     - **${isCultivar ? "SPECIES / CULTIVAR" : "SPECIES"}**: in small-caps bold sans-serif, with "${isCultivar ? data.cultivar + " cultivar" : data.species}" below it.
     - **ORIGIN**: in small-caps bold sans-serif, with a detailed description below: "${data.origin}"
     - **Botanical Line Art**: At the very bottom of this left box, a small, subtle black-and-white vintage line engraving of a generic plant or leaf structure.

3. Central Specimen:
   - A large, highly detailed, photorealistic botanical illustration of a mature ${data.name} plant, occupying 60% of the composition.
   - Show foliage at various stages of maturity, depicting correct leaf margins, color variation, and variegation.
   - Correctly drawn sturdy petioles and central stem showing aerial roots.

4. Right Information Panel (Morphology Callouts):
   - A vertical column of 4 circular callouts with thin black borders, each showing a high-detail close-up morphology drawing.
   - Each circle must be labeled with small, elegant lowercase text above it:
     - "leaf detail": showing variegation and texture details.
     - "petiole detail": showing cross-section/texture/color of the leaf stalk.
     - "aerial roots": showing roots growing from the node.
     - "inflorescence": showing spadix and spathe.

5. Lower Panel (Horizontal Box):
   - A wide, thin-bordered horizontal box at the bottom, divided into 3 equal-width columns by thin vertical lines:
     - **HABITAT**:
       - Title: "HABITAT" in small-caps bold sans-serif.
       - Description: "${data.habitat}"
       - A small, detailed black-and-white vintage landscape engraving of a tropical rainforest floor/understory at the bottom of the column.
     - **NATIVE RANGE**:
       - Title: "NATIVE RANGE" in small-caps bold sans-serif.
       - A simple, minimalist black-and-white outline map of the world in the center, with a small highlighted region or indicator dot showing the native origins.
       - Description text below: "${isCultivar ? "No confirmed wild native range. A cultivated selection of hybrid origin." : "Endemic to the specified native range."}"
     - **MORPHOLOGY SUMMARY**:
       - Title: "MORPHOLOGY SUMMARY" in small-caps bold sans-serif.
       - Description: A detailed summary paragraph of the species morphology, including growth habit, leaf shape, margins, coloration, mature size, and identifying botanical markers.

6. Footer (Bottom-most margin):
   - printed in a tiny, clean sans-serif typeface outside and below the lower panel:
     - Left: "PLATE No. ${derivedPlateNum}"
     - Center: "AROIDS OF ${classification}"
     - Right: "ILLUSTRATED FOR AROIDATLAS"
     - Far Lower Right Corner: A discreet watermark consisting of the text "AROIDATLAS" in a clean, modern sans-serif typeface.
`.trim();
}

function buildMorphologySection(data: SpeciesData): string {
  return `
BOTANICAL ACCURACY REQUIREMENTS

Critical identifying traits for ${data.name}:

${data.critical_traits.map((t) => `- ${t}`).join("\n")}

Morphology:

Leaf Shape:
${data.morphology.leaf_shape}

Leaf Ratio:
${data.morphology.leaf_ratio}

Texture:
${data.morphology.texture}

Petiole:
${data.morphology.petiole}

Growth Habit:
${data.morphology.growth_habit}

Mature Size:
${data.morphology.mature_size}

Origin:
${data.origin}

Habitat:
${data.habitat}

The specimen of ${data.name} should immediately be recognizable to an experienced collector.

Failure to accurately reproduce species-defining morphology should be considered incorrect.
`.trim();
}

function buildNegativeConstraints(data: SpeciesData): string {
  if (!data.negative_traits || data.negative_traits.length === 0) {
    return "Do not generate:\n\n(none)";
  }

  return `Do not generate:

${data.negative_traits.map((t) => `- ${t}`).join("\n")}`;
}

/**
 * Generates a complete image-generation prompt for a given plant species.
 *
 * @param speciesData - The structured data describing the plant species.
 * @returns A single, combined prompt string ready for an image generator.
 */
export function generatePlantImagePrompt(speciesData: SpeciesData): string {
  const sections: string[] = [
    buildMasterStyleTemplate(speciesData),
    "--------------------------------",
    "SPECIES MORPHOLOGY",
    "--------------------------------",
    buildMorphologySection(speciesData),
    "--------------------------------",
    "NEGATIVE CONSTRAINTS",
    "--------------------------------",
    buildNegativeConstraints(speciesData),
    "--------------------------------",
    "FINAL REQUIREMENT",
    "--------------------------------",
    "Botanical accuracy is the highest priority.",
    "The illustration style may be stylized.",
    "The morphology must remain faithful to real specimens.",
    "",
    "REFERENCE IMAGE (if provided)",
    "If a reference image of the actual plant is attached, use it as a strict visual guide for morphology, proportions, and colouration. The generated plate must match the reference specimen closely.",
  ];

  return sections.join("\n\n");
}