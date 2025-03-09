const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it')({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  listIndent: 2
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
      
      // Special processing for updates section
      if (section === 'updates') {
        // Parse the content to find update entries
        const lines = content.split('\n');
        let html = `<h1>Project Updates</h1>`;
        let currentEntry = '';
        let currentDate = '';
        let inEntry = false;
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          
          // Check for date headers (## Date)
          if (line.startsWith('## ')) {
            // If we were already in an entry, close it
            if (inEntry) {
              const entryHtml = markdownIt.render(currentEntry);
              html += `<div class="update-entry">
                <div class="update-date">${currentDate}</div>
                ${entryHtml}
              </div>`;
            }
            
            // Start a new entry
            currentDate = line.replace('## ', '');
            currentEntry = '';
            inEntry = true;
          } 
          // Add content to the current entry
          else if (inEntry && line.trim() !== '') {
            currentEntry += line + '\n';
          }
          else if (inEntry) {
            // Preserve empty lines for paragraph breaks
            currentEntry += '\n';
          }
        }
        
        // Close the last entry if there is one
        if (inEntry) {
          const entryHtml = markdownIt.render(currentEntry);
          html += `<div class="update-entry">
            <div class="update-date">${currentDate}</div>
            ${entryHtml}
          </div>`;
        }
        
        result[section] = html;
      } else {
        // Normal processing for other sections
        // Ensure we preserve the content exactly as it is
        result[section] = markdownIt.render(content);
      }
    }
  });
  
  return result;
}; 