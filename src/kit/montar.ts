// Montagem e isolamento de erros: cada simulação roda por conta própria.
// Se uma quebrar, ao montar ou durante a animação, só ela é substituída por
// um aviso; o resto da página continua funcionando.

export function falhar(raiz: HTMLElement, erro: unknown) {
  console.error(`Simulação "${raiz.dataset.sim}" falhou:`, erro);
  const aviso = document.createElement('p');
  aviso.className = 'sim-erro';
  aviso.textContent = 'Não foi possível carregar esta simulação. Recarregue a página para tentar de novo.';
  raiz.replaceChildren(aviso);
}

/** Inicia a simulação `nome` em cada elemento [data-sim="nome"] da página. */
export function montar(nome: string, iniciar: (raiz: HTMLElement) => void) {
  for (const raiz of document.querySelectorAll<HTMLElement>(`[data-sim="${nome}"]`)) {
    try {
      iniciar(raiz);
    } catch (erro) {
      falhar(raiz, erro);
    }
  }
}

/** Busca um elemento dentro da simulação; falha com mensagem clara se ele não existir. */
export function buscar<T extends Element = HTMLElement>(raiz: ParentNode, seletor: string): T {
  const el = raiz.querySelector<T>(seletor);
  if (!el) throw new Error(`Elemento "${seletor}" não encontrado.`);
  return el;
}
