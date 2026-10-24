// Liga o cabo de guerra aos controles: força de cada time, puxar/pausar e reiniciar.
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar } from './render';
import { aceleracao, criar, descrever, passo, resultante, vencedor } from './simulacao';

export function iniciar(raiz: HTMLElement) {
  const entradaE = buscar<HTMLInputElement>(raiz, '[data-entrada="esq"]');
  const entradaD = buscar<HTMLInputElement>(raiz, '[data-entrada="dir"]');
  const botaoPuxar = buscar<HTMLButtonElement>(raiz, '[data-acao="puxar"]');
  const s = criar(Number(entradaE.value), Number(entradaD.value));
  const tela = criarTela(buscar(raiz, '[data-palco]'), { altura: 300 });
  const leituraR = buscar(raiz, '[data-leitura="fr"]');
  const leituraA = buscar(raiz, '[data-leitura="a"]');
  let rodando = false;

  const parar = (texto: string) => {
    rodando = false;
    botaoPuxar.textContent = texto;
  };

  ligarSliders(raiz);
  for (const entrada of [entradaE, entradaD]) {
    entrada.addEventListener('input', () => {
      s.esq = Number(entradaE.value);
      s.dir = Number(entradaD.value);
      buscar(raiz, `[data-saida="${entrada.dataset.entrada}"]`).textContent = `${fmt(Number(entrada.value), 0)} N`;
    });
  }

  botaoPuxar.addEventListener('click', () => {
    if (vencedor(s)) return;
    rodando = !rodando;
    botaoPuxar.textContent = rodando ? 'Pausar' : 'Continuar';
  });

  buscar(raiz, '[data-acao="reiniciar"]').addEventListener('click', () => {
    Object.assign(s, criar(s.esq, s.dir));
    parar('Puxar');
  });

  iniciarLoop(raiz, {
    passo: 1 / 120,
    atualizar: (dt) => {
      if (!rodando) return;
      passo(s, dt);
      if (vencedor(s)) parar('Puxar');
    },
    desenhar: () => {
      desenhar(tela, s);
      leituraR.textContent = descrever(resultante(s));
      leituraA.textContent = `${fmt(Math.abs(aceleracao(s)), 2)} m/s²`;
    },
  });
}
