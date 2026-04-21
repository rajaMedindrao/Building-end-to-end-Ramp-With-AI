import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SITE_URL = (process.env.SITE_URL || 'https://ramp.example').replace(/\/$/, '')

function absoluteSocialImages() {
  return {
    name: 'absolute-social-images',
    transformIndexHtml(html) {
      return html.replace(
        /(<meta\s+(?:property|name)="(?:og:image|twitter:image)"\s+content=")(\/[^"]*)(")/g,
        (_m, pre, path, post) => `${pre}${SITE_URL}${path}${post}`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), absoluteSocialImages()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  appType: 'spa',
})
