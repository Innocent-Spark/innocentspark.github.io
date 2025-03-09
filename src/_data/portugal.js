const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it')({
  html: true,
  breaks: true,
  linkify: true
});

module.exports = function() {
  const contentDir = path.join(__dirname, '../content/portugal');
  const metaPath = path.join(contentDir, 'meta.json');
  
  // Load metadata
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  
  // Load all markdown files
  const result = { meta };
  
  meta.sections.forEach(section => {
    const filePath = path.join(contentDir, `${section}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      result[section] = markdownIt.render(content);
    }
  });
  
  return result;
}; 