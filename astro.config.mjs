// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages sem domínio próprio: o site fica em /prometheus.
  // Ao usar prometheus.com.br, trocar site para 'https://prometheus.com.br' e remover base.
  site: 'https://marlon1402.github.io',
  base: '/prometheus',
});
