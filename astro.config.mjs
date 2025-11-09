import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://docs.astro.build
export default defineConfig({
  output: 'server', // ensure endpoints/functions work on Vercel
  adapter: vercel(),
  integrations: [import('@astrojs/sitemap').then(m=>m.default())],
  site: 'https://www.nothelferkurs-zuerich.ch',
  integrations: [],
});
