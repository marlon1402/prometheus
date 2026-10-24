// Liga o dinamômetro aos botões de objeto.
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar } from './render';
import { criar, passo, pendurar, peso } from './simulacao';

const rotuloMassa = (m: number) => (m < 1 ? `${Math.round(m * 1000)} g` : `${fmt(m, 0)} kg`);

export function iniciar(raiz: HTMLElement) {
  const botoes = [...raiz.querySelectorAll<HTMLButtonElement>('[data-massa]')];
  const inicial = botoes.find((b) => b.getAttribute('aria-pressed') === 'true') ?? botoes[0];
  const s = criar(Number(inicial.dataset.massa));
  const tela = criarTela(buscar(raiz, '[data-palco]'), { altura: 450 });
  const leituraM = buscar(raiz, '[data-leitura="m"]');
  const leituraF = buscar(raiz, '[data-leitura="f"]');

  for (const botao of botoes) {
    botao.addEventListener('click', () => {
      pendurar(s, Number(botao.dataset.massa));
      for (const b of botoes) b.setAttribute('aria-pressed', String(b === botao));
      leituraM.textContent = rotuloMassa(s.m);
      leituraF.textContent = `${fmt(peso(s.m))} N`;
    });
  }

  iniciarLoop(raiz, { passo: 1 / 240, atualizar: (dt) => passo(s, dt), desenhar: () => desenhar(tela, s) });
}
