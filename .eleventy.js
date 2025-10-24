const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  // Copy static assets directly to the output folder
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("pics");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Add a debug filter for templates
  eleventyConfig.addFilter("debug", (content) => {
    return `<pre>${JSON.stringify(content, null, 2)}</pre>`;
  });

  // Configure Markdown
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor);
  
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Add a filter to convert Markdown to HTML
  eleventyConfig.addFilter("markdown", (content) => {
    return markdownLibrary.render(content);
  });

  // Ignore content files - we don't want to generate pages for them
  eleventyConfig.ignores.add("src/content/**/*");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}; 