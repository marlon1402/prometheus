// Liga as cordas em ângulo aos controles: intensidade e ângulo de cada corda,
// soltar/pausar a caixa e reiniciar. A caixa para ao chegar à borda.
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar, geometria } from './render';
import { criar, passo, resultante, type Corda } from './simulacao';

export function iniciar(raiz: HTMLElement) {
  const entradas = [...raiz.querySelectorAll<HTMLInputElement>('[data-corda]')];
  const lerCordas = (): Corda[] =>
    [0, 1, 2].map((i) => ({
      F: Number(buscar<HTMLInputElement>(raiz, `[data-corda="${i}"][data-campo="F"]`).value),
      theta: Number(buscar<HTMLInputElement>(raiz, `[data-corda="${i}"][data-campo="theta"]`).value),
    }));
  const s = criar(lerCordas());
  const tela = criarTela(buscar(raiz, '[data-palco]'), { altura: 360 });
  const botaoSoltar = buscar<HTMLButtonElement>(raiz, '[data-acao="soltar"]');
  const resultado = buscar(raiz, '[data-resultado]');
  const leituraF = buscar(raiz, '[data-leitura="fr"]');
  const leituraT = buscar(raiz, '[data-leitura="theta"]');
  let rodando = false;

  const parar = (texto: string) => {
    rodando = false;
    botaoSoltar.textContent = texto;
  };

  ligarSliders(raiz);
  for (const entrada of entradas) {
    entrada.addEventListener('input', () => {
      s.cordas = lerCordas();
      const unidade = entrada.dataset.campo === 'F' ? ' N' : '°';
      buscar(raiz, `[data-saida="${entrada.dataset.corda}-${entrada.dataset.campo}"]`).textContent = `${entrada.value}${unidade}`;
    });
  }

  botaoSoltar.addEventListener('click', () => {
    if (resultado.textContent) return;
    rodando = !rodando;
    botaoSoltar.textContent = rodando ? 'Pausar' : 'Continuar';
  });

  buscar(raiz, '[data-acao="reiniciar"]').addEventListener('click', () => {
    Object.assign(s, criar(lerCordas()));
    resultado.textContent = '';
    parar('Soltar a caixa');
  });

  iniciarLoop(raiz, {
    passo: 1 / 120,
    atualizar: (dt) => {
      if (!rodando) return;
      passo(s, dt);
      const { limiteX, limiteY } = geometria(tela);
      if (Math.abs(s.x) > limiteX || Math.abs(s.y) > limiteY) {
        s.x = Math.max(-limiteX, Math.min(limiteX, s.x));
        s.y = Math.max(-limiteY, Math.min(limiteY, s.y));
        resultado.textContent = 'A caixa chegou à borda. Mude as cordas e reinicie.';
        parar('Soltar a caixa');
      }
    },
    desenhar: () => {
      desenhar(tela, s);
      const r = resultante(s.cordas);
      leituraF.textContent = `${fmt(r.F)} N`;
      leituraT.textContent = r.F >= 0.05 ? `${fmt(r.theta, 0)}°` : '—';
    },
  });
}
