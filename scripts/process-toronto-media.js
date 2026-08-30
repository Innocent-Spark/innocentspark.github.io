const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const sourceDir = process.argv[2];
const projectRoot = path.resolve(__dirname, "..");
const mediaDir = path.join(projectRoot, "assets", "toronto", "media");
const dataPath = path.join(projectRoot, "src", "_data", "toronto-media.json");

if (!sourceDir) {
  console.error("Usage: node scripts/process-toronto-media.js SOURCE_DIR");
  process.exit(1);
}

const groups = {
  roncesvalles: {
    images: [
      "IMG_20260827_201033.jpg",
      "IMG_20260827_201050.jpg",
      "IMG_20260827_201117.jpg",
      "IMG_20260827_201121.jpg",
      "IMG_20260827_201126.jpg",
      "IMG_20260827_201130.jpg",
    ],
    videos: [
      "VID_20260827_200555.mp4",
      "VID_20260827_200614.mp4",
      "VID_20260827_200816.mp4",
      "VID_20260827_200923.mp4",
      "VID_20260827_202038.mp4",
      "VID_20260827_202210.mp4",
    ],
  },
  highPark: {
    images: [
      "IMG_20260827_201356.jpg",
      "IMG_20260827_201405.jpg",
      "IMG_20260827_201418.jpg",
      "IMG_20260827_201420.jpg",
      "IMG_20260827_201425.jpg",
      "IMG_20260827_201557.jpg",
    ],
    videos: [
      "VID_20260827_201252.mp4",
      "VID_20260827_201613.mp4",
    ],
  },
  rosedale: {
    images: [
      "IMG_20260828_092239.jpg",
      "IMG_20260828_092249.jpg",
      "IMG_20260828_092717.jpg",
      "IMG_20260828_092728.jpg",
      "IMG_20260828_093127.jpg",
      "IMG_20260828_093130.jpg",
      "IMG_20260828_093212.jpg",
      "IMG_20260828_093212_1.jpg",
      "IMG_20260828_093225.jpg",
      "IMG_20260828_093229.jpg",
      "IMG_20260828_093237.jpg",
      "IMG_20260828_093703.jpg",
      "IMG_20260828_093706.jpg",
      "IMG_20260828_093732.jpg",
      "IMG_20260828_093741.jpg",
      "IMG_20260828_093743.jpg",
      "IMG_20260828_093803.jpg",
    ],
    videos: ["VID_20260828_093442.mp4"],
  },
  danforth: {
    images: [],
    videos: [
      "VID_20260828_095234.mp4",
      "VID_20260828_095444.mp4",
      "VID_20260828_095846.mp4",
      "VID_20260828_100001.mp4",
    ],
  },
  leslieville: {
    images: [],
    videos: [
      "VID_20260828_100223.mp4",
      "VID_20260828_100626.mp4",
    ],
  },
  beaches: {
    images: [
      "IMG_20260828_102141.jpg",
      "IMG_20260828_102734.jpg",
      "IMG_20260828_103024.jpg",
    ],
    videos: [
      "VID_20260828_101607.mp4",
      "VID_20260828_101844.mp4",
      "VID_20260828_101936.mp4",
    ],
  },
};

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options }).trim();
}

function imageLocation(filePath) {
  const latitude = Number(run("mdls", ["-raw", "-name", "kMDItemLatitude", filePath]));
  const longitude = Number(run("mdls", ["-raw", "-name", "kMDItemLongitude", filePath]));
  return { latitude, longitude };
}

function videoMetadata(filePath) {
  const metadata = JSON.parse(run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration:format_tags=location,creation_time",
    "-of", "json",
    filePath,
  ])).format;
  const match = metadata.tags.location.match(/^([+-]\d+\.\d+)([+-]\d+\.\d+)\/$/);
  return {
    duration: Number(metadata.duration),
    latitude: Number(match[1]),
    longitude: Number(match[2]),
  };
}

async function processImage(groupKey, name) {
  const source = path.join(sourceDir, name);
  const outputName = name.replace(/\.[^.]+$/, ".webp").toLowerCase();
  const outputRelative = `/assets/toronto/media/${groupKey}/${outputName}`;
  const output = path.join(mediaDir, groupKey, outputName);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  await sharp(source)
    .autoOrient()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5, smartSubsample: true })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  return {
    type: "image",
    src: outputRelative,
    width: metadata.width,
    height: metadata.height,
    ...imageLocation(source),
  };
}

async function processVideo(groupKey, name) {
  const source = path.join(sourceDir, name);
  const outputName = name.toLowerCase();
  const posterName = name.replace(/\.[^.]+$/, "-poster.webp").toLowerCase();
  const outputRelative = `/assets/toronto/media/${groupKey}/${outputName}`;
  const posterRelative = `/assets/toronto/media/${groupKey}/${posterName}`;
  const output = path.join(mediaDir, groupKey, outputName);
  const poster = path.join(mediaDir, groupKey, posterName);
  const tempPoster = path.join(os.tmpdir(), `${path.basename(name, path.extname(name))}-${process.pid}.jpg`);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  const metadata = videoMetadata(source);
  console.log(`Encoding ${name} (${metadata.duration.toFixed(0)}s)`);
  run("ffmpeg", [
    "-y", "-v", "error", "-i", source,
    "-map_metadata", "-1",
    "-vf", "scale='if(gt(iw,ih),min(960,iw),-2)':'if(gt(iw,ih),-2,min(960,ih))'",
    "-c:v", "libx264", "-preset", "medium", "-crf", "28",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "80k",
    "-movflags", "+faststart",
    output,
  ]);
  run("ffmpeg", [
    "-y", "-v", "error", "-ss", String(metadata.duration / 2),
    "-i", output, "-frames:v", "1", "-q:v", "2", tempPoster,
  ]);
  await sharp(tempPoster)
    .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(poster);
  fs.unlinkSync(tempPoster);

  return {
    type: "video",
    src: outputRelative,
    poster: posterRelative,
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
