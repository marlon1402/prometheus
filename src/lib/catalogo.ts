// Consultas ao catálogo de conteúdo. Páginas e componentes usam estas funções
// em vez de chamar getCollection diretamente, para que a ordem, os rascunhos
// e a validação sejam tratados num lugar só.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { url } from './url';

export type Disciplina = CollectionEntry<'disciplinas'>;
export type Modulo = CollectionEntry<'modulos'>;
/** Qualquer lição do catálogo, inclusive as “em breve”, que ainda não têm texto. */
export type EntradaLicao = CollectionEntry<'licoes'>;
type DadosLicao = EntradaLicao['data'];
/** Lição com texto e página própria: descrição, nível e duração estão sempre presentes. */
export type Licao = EntradaLicao & {
  data: DadosLicao & Required<Pick<DadosLicao, 'descricao' | 'nivel' | 'duracao'>>;
};

/** Id da disciplina: primeira pasta do id do módulo ou da lição. */
export const disciplinaId = (id: string) => id.split('/')[0];

/** Id do módulo de uma lição: as duas primeiras pastas. */
export const moduloId = (licao: EntradaLicao) => licao.id.split('/').slice(0, 2).join('/');

/** Rótulo de cada nível, como aparece nas listas. */
export const NIVEIS: Record<Licao['data']['nivel'], string> = {
  fundamental: 'Fundamental',
  'fundamental-medio': 'Fundamental ao médio',
  medio: 'Médio',
};

/** Endereço da página de um módulo ou de uma lição. */
export const rota = (entrada: Modulo | Licao) => url(`${entrada.id}/`);

const porOrdem = (a: { data: { ordem: number } }, b: { data: { ordem: number } }) => a.data.ordem - b.data.ordem;

const visivel = (licao: EntradaLicao) => import.meta.env.DEV || !licao.data.rascunho;

/** Diferencia as lições com texto e página das “em breve”. */
export const temPagina = (licao: EntradaLicao): licao is Licao => !licao.data.embreve;

const porModuloEOrdem = (a: EntradaLicao, b: EntradaLicao) => moduloId(a).localeCompare(moduloId(b)) || porOrdem(a, b);

let validacao: Promise<void> | undefined;

/**
 * Confere o que o esquema não consegue ver: pastas sem disciplina ou módulo
 * correspondente e ordens repetidas. Roda uma vez por build; no ambiente de
 * desenvolvimento, roda a cada consulta, porque o conteúdo muda enquanto o
 * servidor está aberto e um erro já corrigido não pode ficar guardado.
 */
function validar() {
  if (import.meta.env.DEV) validacao = undefined;
  validacao ??= (async () => {
    const [ds, ms, ls] = await Promise.all([
      getCollection('disciplinas'),
      getCollection('modulos'),
      getCollection('licoes'),
    ]);
    const erros: string[] = [];
    const idsDisciplinas = new Set(ds.map((d) => d.id));
    const idsModulos = new Set(ms.map((m) => m.id));

    for (const m of ms) {
      if (!idsDisciplinas.has(disciplinaId(m.id))) {
        erros.push(`O módulo “${m.id}” está na pasta de uma disciplina que não existe em disciplinas.yaml.`);
      }
    }
    for (const l of ls) {
      if (!idsModulos.has(moduloId(l))) {
        erros.push(`A lição “${l.id}” está numa pasta sem index.mdx de módulo.`);
      }
    }

    // O Astro só registra referências quebradas no log, sem parar o build.
    const idsLicoes = new Set(ls.map((l) => l.id));
    for (const m of ms) {
      for (const { id } of m.data.prerequisitos) {
        if (!idsModulos.has(id)) erros.push(`O módulo “${m.id}” tem como pré-requisito “${id}”, que não existe.`);
      }
    }
    for (const l of ls) {
      for (const { id } of l.data.prerequisitos) {
        if (!idsLicoes.has(id)) erros.push(`A lição “${l.id}” tem como pré-requisito “${id}”, que não existe.`);
      }
    }

    const repetidas = (grupos: Map<string, { id: string; data: { ordem: number } }[]>, tipo: string) => {
      for (const [grupo, itens] of grupos) {
        const vistos = new Map<number, string>();
        for (const item of itens) {
          const outro = vistos.get(item.data.ordem);
          if (outro) erros.push(`${tipo} “${outro}” e “${item.id}” têm a mesma ordem (${item.data.ordem}) em “${grupo}”.`);
          vistos.set(item.data.ordem, item.id);
        }
      }
    };
    repetidas(Map.groupBy(ms, (m) => disciplinaId(m.id)), 'Os módulos');
    repetidas(Map.groupBy(ls, moduloId), 'As lições');

    if (erros.length) {
      throw new Error(`Catálogo de conteúdo inválido:\n- ${erros.join('\n- ')}`);
    }
  })();
  return validacao;
}

export async function disciplinas(): Promise<Disciplina[]> {
  await validar();
  return (await getCollection('disciplinas')).sort(porOrdem);
}

export async function disciplinaDe(entrada: Modulo | Licao): Promise<Disciplina> {
  await validar();
  return (await getEntry('disciplinas', disciplinaId(entrada.id)))!;
}

/** Módulos de uma disciplina, em ordem. Sem argumento, todos os módulos. */
export async function modulos(disciplina?: string): Promise<Modulo[]> {
  await validar();
  const lista = await getCollection('modulos', (m) => !disciplina || disciplinaId(m.id) === disciplina);
  return lista.sort(porOrdem);
}

export async function moduloDe(licao: EntradaLicao): Promise<Modulo> {
  await validar();
  return (await getEntry('modulos', moduloId(licao)))!;
}

/** Lições visíveis e com página de um módulo, em ordem. Sem argumento, todas as lições. */
export async function licoes(modulo?: string): Promise<Licao[]> {
  return (await roteiro(modulo)).filter(temPagina);
}

/** Sequência completa de um módulo, em ordem: as lições com página e as “em breve”. */
export async function roteiro(modulo?: string): Promise<EntradaLicao[]> {
  await validar();
  const lista = await getCollection('licoes', (l) => visivel(l) && (!modulo || moduloId(l) === modulo));
  return lista.sort(porModuloEOrdem);
}

/** Um módulo está publicado quando tem ao menos uma lição visível. */
export async function publicado(modulo: Modulo): Promise<boolean> {
  return (await licoes(modulo.id)).length > 0;
}

/** Uma disciplina fica “Em breve” enquanto nenhum módulo dela está publicado. */
export async function emBreve(disciplina: Disciplina): Promise<boolean> {
  const lista = await modulos(disciplina.id);
  const estados = await Promise.all(lista.map(publicado));
  return !estados.includes(true);
}

/** Pré-requisitos de um módulo, com a disciplina (para a cor) e se já dá para acessar. */
export async function prerequisitos(modulo: Modulo) {
  return Promise.all(
    modulo.data.prerequisitos.map(async (ref) => {
      const m = (await getEntry(ref))!;
      return { modulo: m, disciplina: await disciplinaDe(m), publicado: await publicado(m) };
    }),
  );
}

/**
 * Posição da lição no módulo e as vizinhas, para “Lição 4 de 11” e anterior/próxima.
 * A posição conta as lições “em breve”; as vizinhas são sempre lições com página.
 */
export async function navegacao(licao: Licao) {
  const sequencia = await roteiro(moduloId(licao));
  const lista = sequencia.filter(temPagina);
  const i = lista.findIndex((l) => l.id === licao.id);
  return {
    posicao: sequencia.findIndex((l) => l.id === licao.id) + 1,
    total: sequencia.length,
    anterior: lista[i - 1] as Licao | undefined,
    proxima: lista[i + 1] as Licao | undefined,
  };
}
