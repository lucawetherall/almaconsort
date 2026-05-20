import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lucawetherall.github.io',
  base: '/almaconsort/',
  output: 'static',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        const url = item.url;
        if (url.endsWith('/almaconsort/') || url.endsWith('/almaconsort')) {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (url.includes('/events/') || url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        } else if (
          url.includes('/recording/') ||
          url.includes('/work-with-us/') ||
          url.includes('/support')
        ) {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        } else if (
          url.includes('/about/') ||
          url.includes('/scholars/') ||
          url.includes('/contact/')
        ) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
  ],
});
