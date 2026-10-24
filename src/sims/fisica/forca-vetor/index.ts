// Liga a força arrastável ao canvas e aos controles. A ponta da seta pode ser
// arrastada com o mouse ou o dedo; os sliders fazem o mesmo pelo teclado.
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar, geometria } from './render';
import { apontar, componentes, criar } from './simulacao';

export function iniciar(raiz: HTMLElement) {
  const canvas = buscar<HTMLCanvasElement>(raiz, '[data-palco]');
  const entradaF = buscar<HTMLInputElement>(raiz, '[data-entrada="F"]');
  const entradaT = buscar<HTMLInputElement>(raiz, '[data-entrada="theta"]');
  const botaoRet = buscar<HTMLButtonElement>(raiz, '[data-acao="retangulo"]');
  const s = criar(Number(entradaF.value), Number(entradaT.value));
  const tela = criarTela(canvas, { altura: 330 });
  let retangulo = false;

  const leitura = (nome: string) => buscar(raiz, `[data-leitura="${nome}"]`);
  const [leituraFx, leituraFy] = ['fx', 'fy'].map(leitura);

  /** Leva o estado para os sliders e as leituras. */
  const mostrar = () => {
    entradaF.value = String(s.F);
    entradaT.value = String(s.theta);
    buscar(raiz, '[data-saida="F"]').textContent = `${s.F} N`;
    buscar(raiz, '[data-saida="theta"]').textContent = `${s.theta}°`;
    const { fx, fy } = componentes(s);
    leituraFx.textContent = `${fmt(fx)} N`;
    leituraFy.textContent = `${fmt(fy)} N`;
  };

  ligarSliders(raiz);
  for (const entrada of [entradaF, entradaT]) {
    entrada.addEventListener('input', () => {
      s.F = Number(entradaF.value);
      s.theta = Number(entradaT.value);
      mostrar();
    });
  }

  botaoRet.addEventListener('click', () => {
    retangulo = !retangulo;
    botaoRet.setAttribute('aria-pressed', String(retangulo));
  });

  // Arraste: qualquer ponto do palco leva a ponta da seta até ali.
  let arrastando = false;
  const seguir = (e: PointerEvent) => {
    const caixa = canvas.getBoundingClientRect();
    const { ox, oy, pxPorN } = geometria(tela);
    apontar(s, e.clientX - caixa.left - ox, e.clientY - caixa.top - oy, pxPorN);
    mostrar();
    // O trilho dos sliders acompanha o arraste.
    for (const entrada of [entradaF, entradaT]) entrada.dispatchEvent(new Event('input'));
  };
  canvas.addEventListener('pointerdown', (e) => {
    arrastando = true;
    canvas.setPointerCapture(e.pointerId);
    seguir(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (arrastando) seguir(e);
  });
  for (const fim of ['pointerup', 'pointercancel'] as const) {
    canvas.addEventListener(fim, () => (arrastando = false));
  }

  mostrar();
  iniciarLoop(raiz, { desenhar: () => desenhar(tela, s, retangulo) });
}
