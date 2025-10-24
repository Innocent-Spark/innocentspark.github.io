const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

module.exports = function () {
  const picsDir = path.join(__dirname, '../../pics');

  // Load casa specifications from markdown files
  const casasDir = path.join(__dirname, '../content/casas');
  const casaSpecs = {};

  if (fs.existsSync(casasDir)) {
    const casaFiles = fs.readdirSync(casasDir);
    casaFiles.forEach(file => {
      if (path.extname(file) === '.md') {
        const filePath = path.join(casasDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(content);
        casaSpecs[data.name] = data;
      }
    });
  }

  // Read the directory
  const files = fs.readdirSync(picsDir);

  // Separate images and videos (root level)
  const images = [];
  const videos = [];
  const houses = [];

  files.forEach(file => {
    const fullPath = path.join(picsDir, file);
    const extension = path.extname(file).toLowerCase();
    const filePath = `/pics/${file}`;

    // Skip hidden files
    if (file.startsWith('.')) return;

    // Check if it's a directory (house folder)
    if (fs.statSync(fullPath).isDirectory()) {
      // Special handling for pics_from_jose directory
      if (file === 'pics_from_jose') {
        const houseDir = fullPath;
        const houseFolders = fs.readdirSync(houseDir);

        houseFolders.forEach(houseFolder => {
          const housePath = path.join(houseDir, houseFolder);

          // Skip hidden folders and non-directories
          if (houseFolder.startsWith('.') || !fs.statSync(housePath).isDirectory()) return;

          const houseImages = [];
          const houseFiles = fs.readdirSync(housePath);

          houseFiles.forEach(imageFile => {
            const imgExtension = path.extname(imageFile).toLowerCase();

            // Skip hidden files
            if (imageFile.startsWith('.')) return;

            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(imgExtension)) {
              houseImages.push({
                path: `/pics/pics_from_jose/${houseFolder}/${imageFile}`,
                alt: `${houseFolder} - ${path.basename(imageFile, imgExtension)}`,
                filename: imageFile
              });
            }
          });

          // Sort house images by filename
          houseImages.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

          if (houseImages.length > 0) {
            // Get building specifications from loaded casa data
            const specs = casaSpecs[houseFolder];
            let buildingSpecs = {};

            if (specs) {
              buildingSpecs = {
                footprint: specs.footprint,
                grossBuiltArea: specs.grossBuiltArea,
                grossBuiltAreaWithExtra: specs.grossBuiltAreaWithExtra,
                grossBuiltArea1Floor: specs.grossBuiltArea1Floor,
                grossBuiltArea1FloorWithExtra: specs.grossBuiltArea1FloorWithExtra,
                grossBuiltArea2Floors: specs.grossBuiltArea2Floors,
                grossBuiltArea2FloorsWithExtra: specs.grossBuiltArea2FloorsWithExtra,
                isFormerMill: specs.isFormerMill
              };

              // Remove undefined values
              Object.keys(buildingSpecs).forEach(key => {
                if (buildingSpecs[key] === undefined) {
                  delete buildingSpecs[key];
                }
              });
            }

            houses.push({
              name: houseFolder,
              slug: houseFolder.toLowerCase(),
              images: houseImages,
              count: houseImages.length,
              buildingSpecs: buildingSpecs
            });
          }
        });
      }
      return;
    }

    // Process root-level files
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
      images.push({
        path: filePath,
        alt: `Image ${path.basename(file, extension)}`,
        filename: file
      });
    } else if (['.mp4', '.webm', '.ogg'].includes(extension)) {
      videos.push({
        path: filePath,
        filename: file
      });
    }
  });

  // Sort root images and videos by filename
  images.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
  videos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));

  // Sort houses by name
  houses.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  return {
    images,
    videos,
    houses
  };
}; 