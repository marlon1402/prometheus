// Liga os patinadores aos controles: massas, empurrar, reiniciar e qual
// patinador observar. Os patinadores param ao chegar à borda da cena.
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar, ESCALA, type Observado } from './render';
import { criar, empurrar, passo } from './simulacao';

export function iniciar(raiz: HTMLElement) {
  const entradaA = buscar<HTMLInputElement>(raiz, '[data-entrada="ma"]');
  const entradaB = buscar<HTMLInputElement>(raiz, '[data-entrada="mb"]');
  const botaoEmpurrar = buscar<HTMLButtonElement>(raiz, '[data-acao="empurrar"]');
  const botoesObservar = [...raiz.querySelectorAll<HTMLButtonElement>('[data-observar]')];
  const leituraA = buscar(raiz, '[data-leitura="va"]');
  const leituraB = buscar(raiz, '[data-leitura="vb"]');
  const tela = criarTela(buscar(raiz, '[data-palco]'), { altura: 300 });
  let s = criar(Number(entradaA.value), Number(entradaB.value));
  let observado: Observado = 'ambos';

  const reiniciar = () => {
    s = criar(Number(entradaA.value), Number(entradaB.value));
    botaoEmpurrar.disabled = false;
  };

  ligarSliders(raiz);
  for (const entrada of [entradaA, entradaB]) {
    entrada.addEventListener('input', () => {
      buscar(raiz, `[data-saida="${entrada.dataset.entrada}"]`).textContent = `${entrada.value} kg`;
      reiniciar();
    });
  }

  botaoEmpurrar.addEventListener('click', () => {
    empurrar(s);
    botaoEmpurrar.disabled = true;
  });
  buscar(raiz, '[data-acao="reiniciar"]').addEventListener('click', reiniciar);

  for (const botao of botoesObservar) {
    botao.addEventListener('click', () => {
      observado = botao.dataset.observar as Observado;
      for (const b of botoesObservar) b.setAttribute('aria-pressed', String(b === botao));
    });
  }

  iniciarLoop(raiz, {
    passo: 1 / 240,
    atualizar: (dt) => {
      const borda = tela.w / 2 / ESCALA - 0.4;
      if (Math.max(-s.xa, s.xb) >= borda) return;
      passo(s, dt);
    },
    desenhar: () => {
      desenhar(tela, s, observado);
      leituraA.textContent = `${fmt(Math.abs(s.va), 2)} m/s`;
      leituraB.textContent = `${fmt(Math.abs(s.vb), 2)} m/s`;
    },
  });
}
