# Miyuru Amarasiri Portfolio

This project is a Webpack-powered starter for the broader Miyuru Amarasiri web platform. It ships with sensible defaults, HTML5 Boilerplate styling, and development tooling ready for expansion.

## Features

- Webpack 5 build pipeline with separate development and production configs
- Babel transpilation targeting modern browsers and maintained Node versions
- Hot Module Replacement during development
- Automatic HTML template generation with favicon support
- Static asset copying for favicons, manifests, and vendor scripts
- ESLint with recommended defaults to keep the codebase consistent

## Getting Started

```pwsh
npm install
npm start
```

The development server opens at http://localhost:3000/ with hot reload enabled.

## Building for Production

```pwsh
npm run build
```

The optimized output appears in the `dist/` directory. To clean build artifacts run:

```pwsh
npm run clean
```

## Serving over HTTP/2

Lighthouse recommends delivering the built assets over HTTP/2. You can achieve that with either a managed host or your own server stack:

- **Managed static hosts** – Platforms such as Vercel, Netlify, GitHub Pages, and Cloudflare Pages enable HTTP/2 automatically once you point a custom domain at them. Upload the contents of `dist/` or connect the repository for continuous deployments.
- **Self-managed Nginx/Apache** – Terminate TLS with a modern certificate (e.g., via Let's Encrypt) and enable HTTP/2 in the virtual host configuration (`listen 443 ssl http2;` for Nginx or `Protocols h2 http/1.1` for Apache 2.4.17+). Serve the files in `dist/` as static assets and ensure gzip/brotli compression remains enabled.
- **CDN in front** – If you already rely on a CDN, enable HTTP/2 for the edge endpoints (CloudFront, Azure Front Door, etc.) and cache the static bundle there. Most providers expose a toggle in the distribution settings.

After switching providers or updating your config, re-run `npm run build` and redeploy the `dist/` output. Then verify the upgrade with `npx lighthouse https://your-domain.example` or Chrome DevTools' Lighthouse panel.

## Project Structure

- `js/app.js` – JavaScript entry point for application logic
- `css/style.css` – Base styles derived from HTML5 Boilerplate
- `webpack.common.js` – Shared Webpack configuration
- `webpack.config.dev.js` – Development-specific Webpack configuration
- `webpack.config.prod.js` – Production-specific Webpack configuration

## Next Steps

- Add unit and integration tests (e.g., Jest with Testing Library)
- Introduce a state management solution as the project grows
- Consider extracting CSS to files in production via MiniCssExtractPlugin once multiple stylesheets exist.
