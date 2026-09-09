const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const sourceDir = process.argv[2];
const projectRoot = path.resolve(__dirname, "..");
const mediaDir = path.join(projectRoot, "assets", "sf", "media");
const dataPath = path.join(projectRoot, "src", "_data", "sf-media.json");

if (!sourceDir) {
  console.error("Usage: node scripts/process-sf-media.js SOURCE_DIR");
  process.exit(1);
}

// Hand-curated from contact sheets. Repeated views, soft frames, transit interiors,
// screenshots, and the unrelated ferry outing are intentionally omitted.
const groups = {
  outerSunset: {
    images: [
      "IMG_20260830_133258.jpg", "IMG_20260830_133314.jpg", "IMG_20260830_133321.jpg",
      "IMG_20260830_134024.jpg", "IMG_20260830_134048.jpg", "IMG_20260830_134120.jpg",
      "IMG_20260830_134707.jpg", "IMG_20260830_134715.jpg", "IMG_20260830_134747.jpg",
    ],
    videos: [
      "VID_20260830_134222.mp4", "VID_20260830_134942.mp4",
      "VID_20260830_135247.mp4", "VID_20260830_135413.mp4",
    ],
  },
  innerSunset: {
    images: [
      "IMG_20260830_140646.jpg", "IMG_20260830_141043.jpg", "IMG_20260830_141326.jpg",
      "IMG_20260830_141336.jpg", "IMG_20260830_141355.jpg", "IMG_20260830_141403.jpg",
      "IMG_20260830_141418.jpg", "IMG_20260830_141753.jpg", "IMG_20260830_141905.jpg",
    ],
    videos: [
      "VID_20260830_140651.mp4", "VID_20260830_141148.mp4", "VID_20260830_141626.mp4",
    ],
  },
  bernalHeights: {
    images: [
      "IMG_20260906_113210.jpg", "IMG_20260906_115620.jpg", "IMG_20260906_115632.jpg",
      "IMG_20260906_115639.jpg", "IMG_20260906_115841.jpg", "IMG_20260906_120045.jpg",
      "IMG_20260906_120116.jpg", "IMG_20260906_120434.jpg", "IMG_20260906_120657.jpg",
    ],
    videos: [],
  },
  noeValley: {
    images: [
      "IMG_20260906_121715.jpg", "IMG_20260906_122015.jpg", "IMG_20260906_122300.jpg",
      "IMG_20260906_122754.jpg", "IMG_20260906_124344.jpg", "IMG_20260906_125739.jpg",
      "IMG_20260906_125824.jpg", "IMG_20260906_130043.jpg", "IMG_20260906_130946.jpg",
      "IMG_20260906_131608.jpg",
    ],
    videos: ["VID_20260906_132318.mp4", "VID_20260906_132514.mp4"],
  },
  castroMission: {
    images: [
      "IMG_20260906_133001.jpg", "IMG_20260906_133501.jpg",
      "IMG_20260906_133514.jpg", "IMG_20260906_141719.jpg",
    ],
    videos: [
      "VID_20260830_142040.mp4", "VID_20260830_142613.mp4", "VID_20260830_143237.mp4",
    ],
  },
  berkeley: {
    images: [],
    videos: [
      "VID_20260906_151119.mp4", "VID_20260906_151445.mp4", "VID_20260906_151625.mp4",
      "VID_20260906_151834.mp4", "VID_20260906_151945.mp4", "VID_20260906_152050.mp4",
      "VID_20260906_152410.mp4",
    ],
  },
  northOakland: {
    images: [
      "IMG_20260906_153049.jpg", "IMG_20260906_153107.jpg", "IMG_20260906_153110.jpg",
      "IMG_20260906_153124.jpg", "IMG_20260906_153140.jpg", "IMG_20260906_153144.jpg",
      "IMG_20260906_153150.jpg", "IMG_20260906_153518.jpg", "IMG_20260906_153652.jpg",
    ],
    videos: ["VID_20260906_150237.mp4"],
  },
};

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function videoMetadata(filePath) {
  const format = JSON.parse(run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration:format_tags=location,creation_time",
    "-of", "json", filePath,
  ])).format;
  const location = format.tags && format.tags.location;
  const match = location && location.match(/^([+-]\d+\.\d+)([+-]\d+\.\d+)\/$/);
  return {
    duration: Number(format.duration),
    latitude: match ? Number(match[1]) : null,
    longitude: match ? Number(match[2]) : null,
  };
}

async function processImage(groupKey, name) {
  const source = path.join(sourceDir, name);
  const outputName = name.replace(/\.[^.]+$/, ".webp").toLowerCase();
  const output = path.join(mediaDir, groupKey, outputName);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  await sharp(source)
    .autoOrient()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5, smartSubsample: true })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  return {
    type: "image",
    src: `/assets/sf/media/${groupKey}/${outputName}`,
    width: metadata.width,
    height: metadata.height,
  };
}

async function processVideo(groupKey, name) {
  const source = path.join(sourceDir, name);
  const outputName = name.toLowerCase();
  const posterName = name.replace(/\.[^.]+$/, "-poster.webp").toLowerCase();
  const output = path.join(mediaDir, groupKey, outputName);
  const poster = path.join(mediaDir, groupKey, posterName);
  const tempPoster = path.join(os.tmpdir(), `${path.parse(name).name}-${process.pid}.jpg`);
  const metadata = videoMetadata(source);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  console.log(`Encoding ${name} (${metadata.duration.toFixed(0)}s)`);
  run("ffmpeg", [
    "-y", "-v", "error", "-i", source, "-map_metadata", "-1",
    "-vf", "scale='if(gt(iw,ih),min(960,iw),-2)':'if(gt(iw,ih),-2,min(960,ih))'",
    "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "80k", "-movflags", "+faststart", output,
  ]);
  run("ffmpeg", [
    "-y", "-v", "error", "-ss", String(metadata.duration / 2), "-i", output,
    "-frames:v", "1", "-q:v", "2", tempPoster,
  ]);
  await sharp(tempPoster)
    .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(poster);
  fs.unlinkSync(tempPoster);

  return {
    type: "video",
    src: `/assets/sf/media/${groupKey}/${outputName}`,
    poster: `/assets/sf/media/${groupKey}/${posterName}`,
    duration: Math.round(metadata.duration),
    latitude: metadata.latitude,
    longitude: metadata.longitude,
  };
}

(async () => {
  const result = {};
  for (const [groupKey, group] of Object.entries(groups)) {
    result[groupKey] = [];
    for (const name of group.images) result[groupKey].push(await processImage(groupKey, name));
    for (const name of group.videos) result[groupKey].push(await processVideo(groupKey, name));
  }
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Wrote ${dataPath}`);
})();
