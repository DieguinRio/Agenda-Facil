import { defineConfig } from 'vite'

export default defineConfig({
  // Se for hospedar em subpasta no GitHub Pages (ex: /Agenda-Facil/),
  // troque '/' pelo nome do repositório: base: '/Agenda-Facil/'
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
