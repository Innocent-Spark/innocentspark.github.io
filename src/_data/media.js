const fs = require('fs');
const path = require('path');

module.exports = function() {
  const picsDir = path.join(__dirname, '../../pics');
  
  // Read the directory
  const files = fs.readdirSync(picsDir);
  
  // Separate images and videos
  const images = [];
  const videos = [];
  
  files.forEach(file => {
    const extension = path.extname(file).toLowerCase();
    const filePath = `/pics/${file}`;
    
    // Skip hidden files
    if (file.startsWith('.')) return;
    
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
  
  // Sort images and videos by filename
  images.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
  videos.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
  
  return {
    images,
    videos
  };
}; 