// Fontes das lições: referência em ABNT (NBR 6023) e chamadas <Ref> no texto.
import type { CollectionEntry } from 'astro:content';

export type DadosFonte = CollectionEntry<'fontes'>['data'];

/** Referência em partes, para o título sair em negrito e o endereço como link. */
export interface Referencia {
  antes: string;
  titulo: string;
  depois: string;
  url?: string;
  acesso?: string;
}

/** Tira o ponto final, para não dobrar com o ponto que separa as partes (“10. ed.”). */
const semPonto = (s: string) => s.replace(/\.$/, '');

/** Até três autores separados por “;”. Acima disso, o primeiro seguido de “et al.” */
const autoria = (autores: string[]) => semPonto(autores.length > 3 ? `${autores[0]} et al` : autores.join('; '));

export function abnt(f: DadosFonte): Referencia {
  const quem = autoria(f.autores);
  const antes = f.capitulo ? `${quem}. ${semPonto(f.capitulo)}. In: ${quem}. ` : `${quem}. `;
  const imprenta = [[f.local, f.editora].filter(Boolean).join(': '), f.ano].filter(Boolean).join(', ');
  const partes = [f.nota, f.edicao, imprenta, f.trecho].filter((p): p is string => !!p).map(semPonto);
  const subtitulo = f.subtitulo ? `: ${semPonto(f.subtitulo)}` : '';
  const depois = `${subtitulo}.${partes.map((p) => ` ${p}.`).join('')}`;
  return { antes, titulo: semPonto(f.titulo), depois, url: f.url, acesso: f.acesso };
}

/** Referência inteira em texto corrido. */
export function abntTexto(f: DadosFonte) {
  const r = abnt(f);
  const online = r.url ? ` Disponível em: ${r.url}. Acesso em: ${r.acesso}.` : '';
  return `${r.antes}${r.titulo}${r.depois}${online}`;
}

/**
 * Ids citados com <Ref id="…" /> no corpo de uma lição, na ordem da primeira
 * chamada. Comentários do MDX ({/* … *\/}) são ignorados.
 */
export function citacoes(corpo: string) {
  const texto = corpo.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  return [...new Set([...texto.matchAll(/<Ref\s+id=["']([^"']+)["']/g)].map((m) => m[1]))];
}
