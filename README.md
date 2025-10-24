# Innocent Spark Website

This is the website for Innocent Spark UG, built with [11ty (Eleventy)](https://www.11ty.dev/).

## Pages

- Home page: Information about Innocent Spark UG
- Portugal Project: Information about the Portuguese Riverside Co-Living Project

## Features

- **Content Management with Markdown**: Content is stored in Markdown files, completely separate from the presentation templates.
- **Project Updates Blog**: The Portugal page includes a blog-like updates section for sharing project progress.
- **Dynamic Gallery**: The Portugal page automatically displays all images and videos from the `pics` folder, making it easy to add new media without editing HTML.
- **Responsive Design**: The site is fully responsive and works well on mobile devices.
- **Static Site Generation**: Built with 11ty for fast loading and easy hosting.

## Development

### Prerequisites

- Node.js (v14 or later)
- npm

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development Server

To start the development server:

```bash
npm run dev
```

This will start a local server at http://localhost:8080.

### Build

To build the site for production:

```bash
npm run build
```

The built site will be in the `_site` directory.

## Content Management

### Editing Content

The content for the Portugal page is stored in Markdown files in the `src/content/portugal` directory:

1. Each section has its own Markdown file (e.g., `intro.md`, `land.md`)
2. The `meta.json` file contains metadata and defines the order of sections
3. To edit content, simply modify the corresponding Markdown file
4. To add a new section:
   - Create a new Markdown file in the `src/content/portugal` directory
   - Add the section name to the `sections` array in `meta.json`

### Adding Project Updates

To add a new update to the Portugal project:

1. Edit the `src/content/portugal/updates.md` file
2. Add a new update using the following format:

```markdown
## Month Day, Year

Your update text goes here. 
You can use multiple paragraphs.

And Markdown formatting.
```

3. The newest updates should be placed at the top of the file
4. Each update must start with a level 2 heading (`##`) containing the date

### Adding Media

To add new images or videos to the Portugal page gallery:

1. Simply place the files in the `pics` folder
2. The site will automatically include them in the gallery
3. Images are sorted numerically by filename

Supported formats:
- Images: jpg, jpeg, png, gif, webp
- Videos: mp4, webm, ogg

## Deployment

This site is automatically deployed to GitHub Pages using GitHub Actions. When you push changes to the `main` branch, the following happens:

1. GitHub Actions runs the workflow defined in `.github/workflows/build-deploy.yml`
2. The site is built using 11ty
3. The built site is deployed to GitHub Pages

You can see the status of the deployment in the "Actions" tab of the GitHub repository.

### GitHub Actions Configuration

The workflow uses the following GitHub Actions:
- `actions/checkout@v4` - Checks out the repository
- `actions/setup-node@v4` - Sets up Node.js 20
- `actions/upload-pages-artifact@v3` - Uploads the built site
- `actions/deploy-pages@v4` - Deploys to GitHub Pages

### GitHub Pages Configuration

To enable GitHub Pages deployment with GitHub Actions:

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source", select "GitHub Actions"
4. The site will be deployed automatically when you push to the main branch

## Project Structure

- `src/`: Source files
  - `_includes/`: Reusable components
  - `_layouts/`: Page layouts
  - `_data/`: Data files for templates
  - `content/`: Markdown content files
  - `*.njk`: Page templates
- `pics/`: Images and videos
- `script.js`: JavaScript for the site
- `style.css`: Global styles
- `.eleventy.js`: Eleventy configuration
- `.github/workflows/`: GitHub Actions workflow files
