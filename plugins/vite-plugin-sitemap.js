import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export default function sitemapPlugin(options = {}) {
  const defaultOptions = {
    baseUrl: 'https://trackmyincome.vercel.app',
    outDir: 'dist',
    pages: [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/pricing', changefreq: 'monthly', priority: 0.8 },
      { url: '/faq', changefreq: 'weekly', priority: 0.7 },
      { url: '/about', changefreq: 'monthly', priority: 0.6 },
      { url: '/login', changefreq: 'monthly', priority: 0.5 },
      { url: '/signup', changefreq: 'monthly', priority: 0.5 },
    ],
    ...options,
  };

  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    closeBundle() {
      const { baseUrl, outDir, pages } = defaultOptions;
      const buildPath = join(process.cwd(), outDir);
      const sitemapPath = join(buildPath, 'sitemap.xml');

      // Create sitemap content
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

      // Ensure build directory exists
      if (!existsSync(buildPath)) {
        mkdirSync(buildPath, { recursive: true });
      }

      // Write sitemap file
      writeFileSync(sitemapPath, sitemap);
      console.log(`\x1b[32m✓\x1b[0m Sitemap generated at ${sitemapPath}`);

      // Generate robots.txt
      const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow private areas
Disallow: /dashboard
Disallow: /admin
Disallow: /api

# Allow all essential JS and CSS files
Allow: /*.js$
Allow: /*.css$
Allow: /assets/*

# Crawl-delay: 10

# Block common development and staging environments
Disallow: /staging/
Disallow: /dev/
Disallow: /test/`;

      const robotsPath = join(buildPath, 'robots.txt');
      writeFileSync(robotsPath, robotsTxt);
      console.log(`\x1b[32m✓\x1b[0m robots.txt generated at ${robotsPath}`);
    },
  };
}
