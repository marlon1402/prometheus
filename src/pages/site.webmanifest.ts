// Manifesto do site (ícones na tela inicial do celular), gerado no build para
// acompanhar o caminho base do site (hoje /prometheus no GitHub Pages).
import type { APIRoute } from 'astro';
import { url } from '../lib/url';
import { SITE } from '../site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: SITE.nome,
        short_name: SITE.nome,
        description: SITE.descricao,
        lang: 'pt-BR',
        start_url: url('/'),
        scope: url('/'),
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: url('icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: url('icon-512.png'), sizes: '512x512', type: 'image/png' },
          { src: url('icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
