const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const SOURCE_DIR = path.join(__dirname, '../pics/pics_from_jose');
const TARGET_WIDTH = 1920; // Max width for web
const QUALITY = 75; // JPEG quality (1-100)

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function compressImage(inputPath, outputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get input file size
    const inputStats = fs.statSync(inputPath);
    const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);

    // Compress image with EXIF orientation correction
    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(TARGET_WIDTH, null, {
        withoutEnlargement: true, // Don't upscale smaller images
        fit: 'inside'
      })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outputPath);

    // Get output file size
    const outputStats = fs.statSync(outputPath);
    const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✓ ${path.basename(inputPath)}: ${inputSizeMB}MB → ${outputSizeMB}MB (${reduction}% reduction)`);

    return { success: true, inputSize: inputStats.size, outputSize: outputStats.size };
  } catch (error) {
    console.error(`✗ Failed to compress ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processDirectory(dirPath, basePath = SOURCE_DIR) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip hidden files/folders
    if (entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      const subResults = await processDirectory(fullPath, basePath);
      results.push(...subResults);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();

      if (IMAGE_EXTENSIONS.includes(ext)) {
        // Preserve folder structure: replace input file with compressed version
        const outputPath = fullPath;

        // Create temporary output path
        const tempPath = fullPath + '.tmp';

        const result = await compressImage(fullPath, tempPath);

        if (result.success) {
          // Replace original with compressed version
          fs.renameSync(tempPath, outputPath);
          results.push(result);
        } else {
          // Clean up temp file if it exists
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
        }
      }
    }
  }

  return results;
}

async function main() {
  console.log('🖼️  Starting image compression...\n');
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Target width: ${TARGET_WIDTH}px`);
  console.log(`Quality: ${QUALITY}%\n`);

  const startTime = Date.now();
  const results = await processDirectory(SOURCE_DIR);

  // Calculate statistics
  const successful = results.filter(r => r.success);
  const totalInputSize = successful.reduce((sum, r) => sum + r.inputSize, 0);
  const totalOutputSize = successful.reduce((sum, r) => sum + r.outputSize, 0);
  const totalReduction = ((1 - totalOutputSize / totalInputSize) * 100).toFixed(1);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n✅ Compression complete!\n');
  console.log(`Processed: ${successful.length} images`);
  console.log(`Total size: ${(totalInputSize / 1024 / 1024).toFixed(0)}MB → ${(totalOutputSize / 1024 / 1024).toFixed(0)}MB`);
  console.log(`Overall reduction: ${totalReduction}%`);
  console.log(`Time: ${duration}s`);
}

main().catch(console.error);
