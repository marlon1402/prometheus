// Liga o objeto pendurado aos controles. Os pontos de fixação no teto podem
// ser arrastados (metade esquerda do palco move o fio 1, a direita, o fio 2);
// os sliders de ângulo fazem o mesmo pelo teclado.
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar, geometria } from './render';
import { arrebentados, criar, LIMITE_FIO, limitarAngulo, tracoes } from './simulacao';

export function iniciar(raiz: HTMLElement) {
  const canvas = buscar<HTMLCanvasElement>(raiz, '[data-palco]');
  const entrada1 = buscar<HTMLInputElement>(raiz, '[data-entrada="a1"]');
  const entrada2 = buscar<HTMLInputElement>(raiz, '[data-entrada="a2"]');
  const s = criar(Number(entrada1.value), Number(entrada2.value));
  const tela = criarTela(canvas, { altura: 340 });
  const leitura1 = buscar(raiz, '[data-leitura="t1"]');
  const leitura2 = buscar(raiz, '[data-leitura="t2"]');
  const resultado = buscar(raiz, '[data-resultado]');

  const mostrar = () => {
    entrada1.value = String(s.a1);
    entrada2.value = String(s.a2);
    buscar(raiz, '[data-saida="a1"]').textContent = `${s.a1}°`;
    buscar(raiz, '[data-saida="a2"]').textContent = `${s.a2}°`;
    const { t1, t2 } = tracoes(s);
    leitura1.textContent = `${fmt(t1)} N`;
    leitura2.textContent = `${fmt(t2)} N`;
    const quebrados = arrebentados(s);
    resultado.textContent = quebrados.length
      ? `${quebrados.length === 2 ? 'Os dois fios arrebentariam' : `O fio ${quebrados[0]} arrebentaria`}: a tração passou de ${LIMITE_FIO} N.`
      : '';
  };

  ligarSliders(raiz);
  for (const entrada of [entrada1, entrada2]) {
    entrada.addEventListener('input', () => {
      s.a1 = Number(entrada1.value);
      s.a2 = Number(entrada2.value);
      mostrar();
    });
  }

  // Arraste de um ponto de fixação ao longo do teto
  let fio: 1 | 2 | null = null;
  const seguir = (e: PointerEvent) => {
    const caixa = canvas.getBoundingClientRect();
    const { cx, altura, livre } = geometria(tela, s);
    const px = e.clientX - caixa.left;
    fio ??= px < cx ? 1 : 2;
    const dx = Math.min(livre, Math.max(1, fio === 1 ? cx - px : px - cx));
    const angulo = limitarAngulo((Math.atan2(altura, dx) * 180) / Math.PI);
    if (fio === 1) s.a1 = angulo;
    else s.a2 = angulo;
    mostrar();
    // O trilho dos sliders acompanha o arraste.
    for (const entrada of [entrada1, entrada2]) entrada.dispatchEvent(new Event('input'));
  };
  canvas.addEventListener('pointerdown', (e) => {
    fio = null;
    canvas.setPointerCapture(e.pointerId);
    seguir(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (fio) seguir(e);
  });
  for (const fim of ['pointerup', 'pointercancel'] as const) {
    canvas.addEventListener(fim, () => (fio = null));
  }

  mostrar();
  iniciarLoop(raiz, { desenhar: () => desenhar(tela, s) });
}
