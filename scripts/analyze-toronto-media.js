const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const sourceDir = process.argv[2];
const outputDir = process.argv[3];

if (!sourceDir || !outputDir) {
  console.error("Usage: node scripts/analyze-toronto-media.js SOURCE_DIR OUTPUT_DIR");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const imageFiles = fs.readdirSync(sourceDir)
  .filter((name) => /\.(jpe?g|png|webp|heic)$/i.test(name))
  .sort();

function hammingDistance(left, right) {
  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) distance += 1;
  }
  return distance;
}

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);
}

async function analyzeImage(name) {
  const filePath = path.join(sourceDir, name);
  const input = fs.readFileSync(filePath);
  const metadata = await sharp(input).metadata();
  const { data, info } = await sharp(input)
    .autoOrient()
    .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const laplacians = [];
  let luminanceSum = 0;
  for (const value of data) luminanceSum += value;

  for (let y = 1; y < info.height - 1; y += 1) {
    for (let x = 1; x < info.width - 1; x += 1) {
      const index = y * info.width + x;
      laplacians.push(
        (4 * data[index])
        - data[index - 1]
        - data[index + 1]
        - data[index - info.width]
        - data[index + info.width],
      );
    }
  }

  const laplacianMean = laplacians.reduce((sum, value) => sum + value, 0) / laplacians.length;
  const sharpness = laplacians.reduce(
    (sum, value) => sum + ((value - laplacianMean) ** 2),
    0,
  ) / laplacians.length;

  const { data: hashData } = await sharp(input)
    .autoOrient()
    .resize(17, 16, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let perceptualHash = "";
  for (let y = 0; y < 16; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const index = y * 17 + x;
      perceptualHash += hashData[index] > hashData[index + 1] ? "1" : "0";
    }
  }

  return {
    name,
    bytes: input.length,
    width: metadata.width,
    height: metadata.height,
    sharpness: Number(sharpness.toFixed(2)),
    meanLuminance: Number((luminanceSum / data.length).toFixed(2)),
    sha256: crypto.createHash("sha256").update(input).digest("hex"),
    perceptualHash,
  };
}

async function makeContactSheet(images, pageIndex) {
  const columns = 4;
  const rows = 4;
  const cellWidth = 360;
  const cellHeight = 285;
  const imageHeight = 230;
  const composites = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const left = (index % columns) * cellWidth;
    const top = Math.floor(index / columns) * cellHeight;
    const thumbnail = await sharp(path.join(sourceDir, image.name))
      .autoOrient()
      .resize(cellWidth, imageHeight, { fit: "contain", background: "#161a1d" })
      .jpeg({ quality: 82 })
      .toBuffer();
    const label = Buffer.from(`
      <svg width="${cellWidth}" height="${cellHeight - imageHeight}">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <text x="10" y="20" font-family="Arial, sans-serif" font-size="15" fill="#111111">${escapeXml(image.name)}</text>
        <text x="10" y="42" font-family="Arial, sans-serif" font-size="14" fill="#555555">sharp ${image.sharpness.toFixed(1)} · light ${image.meanLuminance.toFixed(0)}</text>
      </svg>
    `);
    composites.push({ input: thumbnail, left, top });
    composites.push({ input: label, left, top: top + imageHeight });
  }

  await sharp({
    create: {
      width: columns * cellWidth,
      height: rows * cellHeight,
      channels: 3,
      background: "#d8dde1",
    },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(path.join(outputDir, `contact-${String(pageIndex + 1).padStart(2, "0")}.jpg`));
}

(async () => {
  const images = [];
  for (const name of imageFiles) images.push(await analyzeImage(name));

  const exactDuplicates = [];
  const nearDuplicates = [];
  for (let left = 0; left < images.length; left += 1) {
    for (let right = left + 1; right < images.length; right += 1) {
      if (images[left].sha256 === images[right].sha256) {
        exactDuplicates.push([images[left].name, images[right].name]);
        continue;
      }
      const distance = hammingDistance(images[left].perceptualHash, images[right].perceptualHash);
      if (distance <= 28) {
        nearDuplicates.push({
          left: images[left].name,
          right: images[right].name,
          distance,
          leftSharpness: images[left].sharpness,
          rightSharpness: images[right].sharpness,
        });
      }
    }
  }

  const report = { images, exactDuplicates, nearDuplicates };
  fs.writeFileSync(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);

  for (let index = 0; index < images.length; index += 16) {
    await makeContactSheet(images.slice(index, index + 16), index / 16);
  }

  console.log(`Analyzed ${images.length} images.`);
  console.log(`Exact duplicate pairs: ${exactDuplicates.length}`);
  console.log(`Near-duplicate candidates: ${nearDuplicates.length}`);
})();
