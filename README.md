# Innocent Spark Website

This is the website for Innocent Spark UG, built with [11ty (Eleventy)](https://www.11ty.dev/).

## Pages

- Home page: Information about Innocent Spark UG
- Portugal Project: Information about the Portuguese Riverside Co-Living Project

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

## Deployment

This site is automatically deployed to GitHub Pages using GitHub Actions. When you push changes to the `main` branch, the following happens:

1. GitHub Actions runs the workflow defined in `.github/workflows/build-deploy.yml`
2. The site is built using 11ty
3. The built site is deployed to GitHub Pages

You can see the status of the deployment in the "Actions" tab of the GitHub repository.

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
  - `*.njk`: Page templates
- `pics/`: Images and videos
- `script.js`: JavaScript for the site
- `style.css`: Global styles
- `.eleventy.js`: Eleventy configuration
- `.github/workflows/`: GitHub Actions workflow files
