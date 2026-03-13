import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lucawetherall.github.io',
  base: '/almaconsort/',
  output: 'static',
  integrations: [sitemap()],
});
