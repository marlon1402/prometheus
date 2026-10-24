// Liga a simulação da caixa no gelo aos controles da página.
// Modo "forca": sliders de força e massa, botão iniciar/pausar.
// Modo "empurrao": só a massa e um empurrão de meio segundo (lição de inércia).
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { graficoTempo } from '../../../kit/grafico';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar } from './render';
import { aceleracao, criar, empurrar, passo } from './simulacao';

export function iniciar(raiz: HTMLElement) {
  const entradaF = raiz.querySelector<HTMLInputElement>('[data-entrada="F"]');
  const entradaM = buscar<HTMLInputElement>(raiz, '[data-entrada="m"]');
  const forcaInicial = () => (entradaF ? Number(entradaF.value) : 0);
  const s = criar(forcaInicial(), Number(entradaM.value));
  let rodando = false;

  const palco = criarTela(buscar(raiz, '[data-palco]'), { altura: 270 });
  const grafico = criarTela(buscar(raiz, '[data-grafico]'), { altura: 206 });
  const leitura = (nome: string) => buscar(raiz, `[data-leitura="${nome}"]`);
  const [leituraA, leituraV, leituraT] = ['a', 'v', 't'].map(leitura);

  ligarSliders(raiz);
  for (const entrada of [entradaF, entradaM]) {
    entrada?.addEventListener('input', () => {
      const valor = Number(entrada.value);
      if (entrada === entradaF) s.F = valor;
      else s.m = valor;
      buscar(raiz, `[data-saida="${entrada.dataset.entrada}"]`).textContent = `${valor} ${entrada === entradaF ? 'N' : 'kg'}`;
    });
  }

  const botaoIniciar = raiz.querySelector<HTMLButtonElement>('[data-acao="iniciar"]');
  botaoIniciar?.addEventListener('click', () => {
    rodando = !rodando;
    botaoIniciar.textContent = rodando ? 'Pausar' : 'Continuar';
  });

  raiz.querySelector('[data-acao="empurrar"]')?.addEventListener('click', () => {
    empurrar(s);
    rodando = true;
  });

  buscar(raiz, '[data-acao="reiniciar"]').addEventListener('click', () => {
    Object.assign(s, criar(forcaInicial(), s.m));
    rodando = false;
    if (botaoIniciar) botaoIniciar.textContent = 'Iniciar';
  });

  iniciarLoop(raiz, {
    passo: 1 / 120,
    atualizar: (dt) => {
      if (rodando) passo(s, dt);
    },
    desenhar: () => {
      desenhar(palco, s);
      graficoTempo(grafico, s.historico, s.t);
      leituraA.textContent = `${fmt(aceleracao(s))} m/s²`;
      leituraV.textContent = `${fmt(s.v)} m/s`;
      leituraT.textContent = `${fmt(s.t)} s`;
    },
  });
}
