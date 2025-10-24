const fs = require('fs');
const path = require('path');

module.exports = function() {
  const picsDir = path.join(__dirname, '../../pics');

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
            // Add building specifications based on house name
            let buildingSpecs = {};
            
            switch(houseFolder) {
              case 'Casa1':
                buildingSpecs = {
                  footprint: 24.27,
                  grossBuiltArea: 48.54,
                  grossBuiltAreaWithExtra: 63.10,
                  estimatedCost: 126200,
                  constructionPhases: {
                    survey: 9000,
                    architecturalSurvey: 3000,
                    preApplication: 4000,
                    conceptDesign: 1000
                  }
                };
                break;
              case 'Casa2':
                buildingSpecs = {
                  footprint: 23.41,
                  grossBuiltArea: 46.82,
                  grossBuiltAreaWithExtra: 60.87,
                  estimatedCost: 121740,
                  constructionPhases: {
                    survey: 9000,
                    architecturalSurvey: 3000,
                    preApplication: 4000,
                    conceptDesign: 1000
                  }
                };
                break;
              case 'Casa3':
                buildingSpecs = {
                  footprint: 29.73,
                  grossBuiltArea: 59.46,
                  grossBuiltAreaWithExtra: 77.30,
                  estimatedCost: 154600,
                  constructionPhases: {
                    survey: 9000,
                    architecturalSurvey: 3000,
                    preApplication: 4000,
                    conceptDesign: 1000
                  }
                };
                break;
              case 'Casa4':
                buildingSpecs = {
                  footprint: 77.52,
                  grossBuiltArea1Floor: 77.52,
                  grossBuiltArea1FloorWithExtra: 100.78,
                  grossBuiltArea2Floors: 155.04,
                  grossBuiltArea2FloorsWithExtra: 201.56,
                  estimatedCosts: {
                    oneFloor: 155040,
                    oneFloorWithExtra: 201560,
                    twoFloors: 301080,
                    twoFloorsWithExtra: 403120
                  },
                  constructionPhases: {
                    survey: 9000,
                    architecturalSurvey: 3000,
                    preApplication: 4000,
                    conceptDesign: 1000
                  }
                };
                break;
              case 'Casa5':
                buildingSpecs = {
                  footprint: 73.27,
                  grossBuiltArea1Floor: 73.27,
                  grossBuiltArea1FloorWithExtra: 95.25,
                  grossBuiltArea2Floors: 146.54,
                  grossBuiltArea2FloorsWithExtra: 190.50,
                  estimatedCosts: {
                    oneFloor: 146540,
                    oneFloorWithExtra: 190500,
                    twoFloors: 293080,
                    twoFloorsWithExtra: 381000
                  },
                  constructionPhases: {
                    survey: 9000,
                    architecturalSurvey: 3000,
                    preApplication: 4000,
                    conceptDesign: 1000
                  }
                };
                break;
              case 'Casa6':
                buildingSpecs = {
                  footprint: 19.08,
                  grossBuiltArea: 38.16,
                  grossBuiltAreaWithExtra: 49.61,
                  estimatedCosts: {
                    standard: 76320,
                    withExtra: 99220
                  },
                  constructionPhases: {
                    survey: 6000,
                    architecturalSurvey: 3000,
                    preApplication: 3000,
                    conceptDesign: 1000
                  }
                };
                break;
              case 'Casa7':
                buildingSpecs = {
                  footprint: 40.19,
                  grossBuiltArea: 40.19,
                  estimatedCost: 80380,
                  constructionPhases: {
                    survey: 6000,
                    architecturalSurvey: 3000,
                    preApplication: 3000,
                    conceptDesign: 1000
                  }
                };
                break;
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