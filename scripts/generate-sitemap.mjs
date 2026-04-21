#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC_DIR = resolve(ROOT, 'public')

const SITE_URL = (process.env.SITE_URL || 'https://ramp.example').replace(/\/$/, '')

const routesUrl = pathToFileURL(resolve(ROOT, 'src/routes.js')).href
const { NAV_LINKS, FOOTER_COLS, TOP_PAGES } = await import(routesUrl)

const paths = new Set(['/'])
for (const [, p] of NAV_LINKS) paths.add(p)
for (const p of Object.keys(TOP_PAGES)) paths.add(p)
for (const col of FOOTER_COLS) for (const [, p] of col.items) paths.add(p)

const today = new Date().toISOString().slice(0, 10)

const priorityFor = (p) => {
  if (p === '/') return '1.0'
  if (p === '/pricing' || p === '/get-started') return '0.9'
  if (NAV_LINKS.some(([, np]) => np === p)) return '0.8'
  return '0.6'
}

const urls = [...paths]
  .sort()
  .map((p) => {
    const loc = `${SITE_URL}${p === '/' ? '' : p}`
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priorityFor(p)}</priority>
  </url>`
  })
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const robots = `# robots.txt for ${SITE_URL}
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

await mkdir(PUBLIC_DIR, { recursive: true })
await writeFile(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8')
await writeFile(resolve(PUBLIC_DIR, 'robots.txt'), robots, 'utf8')

console.log(`Wrote ${paths.size} URLs to public/sitemap.xml and public/robots.txt`)
console.log(`SITE_URL=${SITE_URL}`)
