// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages sem domínio próprio: o site fica em /prometheus.
  // Ao usar prometheus.com.br, trocar site para 'https://prometheus.com.br' e remover base.
  site: 'https://marlon1402.github.io',
  base: '/prometheus',
  integrations: [
    mdx(),
    // Rascunhos não entram no build de produção, então também ficam fora do sitemap.
    sitemap({ filter: (pagina) => !pagina.endsWith('/404/') }),
  ],
});
