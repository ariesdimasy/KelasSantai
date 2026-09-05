// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// output: 'server' — kita butuh SSR karena:
//  1. Session/JWT dibaca dari cookie httpOnly di server (middleware).
//  2. Protected route (/home, /profile, /checkout, /dashboard) harus dicek
//     sebelum HTML dikirim, bukan setelah halaman tampil.
//  3. Astro API routes (src/pages/api/**) dipakai sebagai BFF ke fiber-api.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    // fiber-api sudah memakai :3000, jadi frontend di :4321 (default Astro)
    port: 4321,
  },
});
