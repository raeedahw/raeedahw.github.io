import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

const dev = process.argv.includes('dev');

export default {
  preprocess: [vitePreprocess()],
  kit: {
    adapter: adapter(),
    paths: {
      base: dev ? '' : '/home',
      relative: false
    },
    prerender: { entries: ['*'] }
  }
};