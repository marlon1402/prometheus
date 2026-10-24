// Catálogo de conteúdo: disciplina → módulo → lição.
//
// src/content/
// ├── disciplinas.yaml             uma entrada por disciplina
// └── <disciplina>/<modulo>/
//     ├── index.mdx                página de abertura do módulo
//     └── <licao>.mdx              uma lição por arquivo
//
// A disciplina de um módulo e o módulo de uma lição vêm da pasta, não do cabeçalho.
// Cabeçalhos inválidos ou pré-requisitos que não existem fazem o build falhar.
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const BASE = './src/content';

const disciplinas = defineCollection({
  loader: file(`${BASE}/disciplinas.yaml`),
  schema: z.object({
    nome: z.string(),
    /** Frase curta usada na Home e em Conteúdos. */
    resumo: z.string(),
    ordem: z.number().int(),
    /** Prefixo dos tokens de cor em tokens.css (por exemplo, fis → --fis e --fis-ink). */
    cor: z.enum(['fis', 'geo', 'mat', 'qui', 'bio']),
  }),
});

const modulos = defineCollection({
  loader: glob({
    base: BASE,
    pattern: '*/*/index.mdx',
    // fisica/leis-de-newton/index.mdx → fisica/leis-de-newton
    generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ''),
  }),
  schema: z.object({
    titulo: z.string(),
    descricao: z.string(),
    ordem: z.number().int(),
    /** Pergunta que abre o módulo, por exemplo “Por que a Lua não cai?”. */
    gancho: z.string().optional(),
    /** Módulos que convém estudar antes, inclusive de outras disciplinas. */
    prerequisitos: z.array(reference('modulos')).default([]),
  }),
});

const licoes = defineCollection({
  loader: glob({
    base: BASE,
    pattern: ['*/*/*.mdx', '!*/*/index.mdx'],
    // fisica/leis-de-newton/inercia.mdx → fisica/leis-de-newton/inercia
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: z
    .object({
      titulo: z.string(),
      /** Obrigatória, exceto em lições “em breve”. */
      descricao: z.string().optional(),
      /** Posição dentro do módulo, a partir de 1. */
      ordem: z.number().int().positive(),
      /** Obrigatório, exceto em lições “em breve”. */
      nivel: z.enum(['fundamental', 'fundamental-medio', 'medio']).optional(),
      /** Tempo estimado de leitura e experimentação, em minutos. Obrigatório, exceto em lições “em breve”. */
      duracao: z.number().int().positive().optional(),
      /** Habilidades da BNCC, como EF09CI01 ou EM13CNT204. */
      bncc: z
        .array(z.string().regex(/^(EF\d{2}[A-Z]{2}\d{2}|EM13[A-Z]{3}\d{3})$/, 'Código da BNCC inválido'))
        .default([]),
      /** Lições de outros módulos que convém ler antes. */
      prerequisitos: z.array(reference('licoes')).default([]),
      /** Rascunhos aparecem só no ambiente de desenvolvimento. */
      rascunho: z.boolean().default(false),
      /**
       * Lição planejada, ainda sem texto: aparece na lista do módulo como
       * “Em breve”, sem página. Só precisa de título e ordem.
       */
      embreve: z.boolean().default(false),
    })
    .superRefine((licao, ctx) => {
      if (licao.embreve) return;
      for (const campo of ['descricao', 'nivel', 'duracao'] as const) {
        if (licao[campo] === undefined) {
          ctx.addIssue({ code: 'custom', path: [campo], message: 'Obrigatório, exceto em lições com embreve: true.' });
        }
      }
    }),
});

export const collections = { disciplinas, modulos, licoes };
