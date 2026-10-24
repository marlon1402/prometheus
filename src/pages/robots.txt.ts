// robots.txt gerado no build, apontando para o sitemap.
// Observação: os buscadores só leem o robots.txt na raiz do domínio, então ele
// passa a valer de fato quando o site estiver em prometheus.com.br.
import type { APIRoute } from 'astro';
import { url } from '../lib/url';

export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(url('sitemap-index.xml'), site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
