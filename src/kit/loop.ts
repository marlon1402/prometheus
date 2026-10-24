// Loop de animação compartilhado.
// - Pausa quando a simulação sai da tela ou a aba fica oculta.
// - Passo fixo opcional para a física (ver passo.ts).
// - Redesenha ao mudar de tamanho ou de tema, mesmo pausado.
// - Um erro em qualquer quadro para só esta simulação (ver montar.ts).
import { aoMudarTema } from './cores';
import { falhar } from './montar';
import { avancar, limitarDt } from './passo';

export const movimentoReduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Opcoes {
  /** Avança o estado. Recebe `passo` (se definido) ou o intervalo do quadro, em segundos. */
  atualizar?: (dt: number) => void;
  desenhar: () => void;
  /** Tamanho do passo fixo da física, em segundos (por exemplo, 1 / 120). */
  passo?: number;
}

export function iniciarLoop(raiz: HTMLElement, { atualizar, desenhar, passo }: Opcoes) {
  let visivel = false;
  let quadroId = 0;
  let ultimo = 0;
  let sobra = 0;
  let parado = false;

  const protegido = (fn: () => void) => {
    if (parado) return;
    try {
      fn();
    } catch (erro) {
      parado = true;
      cancelAnimationFrame(quadroId);
      falhar(raiz, erro);
    }
  };

  const quadro = (t: number) => {
    const dt = limitarDt((t - ultimo) / 1000);
    ultimo = t;
    protegido(() => {
      if (atualizar) {
        if (passo) sobra = avancar(sobra, dt, passo, atualizar);
        else atualizar(dt);
      }
      desenhar();
    });
    if (!parado) quadroId = requestAnimationFrame(quadro);
  };

  const sincronizar = () => {
    const rodar = visivel && !document.hidden && !parado;
    if (rodar && !quadroId) {
      ultimo = performance.now();
      quadroId = requestAnimationFrame(quadro);
    }
    if (!rodar && quadroId) {
      cancelAnimationFrame(quadroId);
      quadroId = 0;
    }
  };

  const redesenhar = () => requestAnimationFrame(() => protegido(desenhar));

  new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    sincronizar();
  }).observe(raiz);
  new ResizeObserver(redesenhar).observe(raiz);
  document.addEventListener('visibilitychange', sincronizar);
  aoMudarTema(redesenhar);
  protegido(desenhar);
}
