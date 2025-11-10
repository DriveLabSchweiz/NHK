import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://docs.astro.build
export default defineConfig({
  output: 'server', // ensure endpoints/functions work on Vercel
  adapter: vercel({
    imageService: true,
    functionPerRoute: false
  }),
  site: 'https://www.nothelferkurs-zuerich.ch',
  integrations: [],
});
