const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

module.exports = function() {
  const casasDir = path.join(__dirname, '../content/casas');
  const casas = [];
  
  // Read all markdown files in the casas directory
  const files = fs.readdirSync(casasDir);
  
  files.forEach(file => {
    if (path.extname(file) === '.md') {
      const filePath = path.join(casasDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: markdownContent } = matter(content);
      
      casas.push({
        ...data,
        content: markdownContent,
        slug: path.basename(file, '.md')
      });
    }
  });
  
  // Sort by order
  casas.sort((a, b) => a.order - b.order);
  
  return casas;
};
