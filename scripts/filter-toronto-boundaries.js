const fs = require("fs");
const path = require("path");

const sourcePath = process.argv[2];
const outputPath = path.resolve(__dirname, "../assets/toronto/neighbourhoods.geojson");

if (!sourcePath) {
  console.error("Usage: node scripts/filter-toronto-boundaries.js SOURCE_GEOJSON");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const wanted = new Set([
  "Roncesvalles",
  "High Park-Swansea",
  "Rosedale-Moore Park",
  "Playter Estates-Danforth",
  "North Riverdale",
  "Danforth",
  "Blake-Jones",
  "South Riverdale",
  "The Beaches",
]);

const output = {
  type: "FeatureCollection",
  source: "City of Toronto Open Data, Neighbourhoods (158)",
  features: source.features
    .filter((feature) => wanted.has(feature.properties.AREA_NAME))
    .map((feature) => ({
      type: "Feature",
      properties: {
        code: feature.properties.AREA_SHORT_CODE,
        name: feature.properties.AREA_NAME,
      },
      geometry: feature.geometry,
    })),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`);
console.log(`Wrote ${output.features.length} boundaries to ${outputPath}`);
