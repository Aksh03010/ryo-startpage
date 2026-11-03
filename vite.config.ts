import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/ryo-startpage/',
  plugins: [preact()],
});
