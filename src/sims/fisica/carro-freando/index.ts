// Liga o carro freando aos controles: velocidade, cinto, frear, bater e reiniciar.
// A freada roda em câmera lenta (metade da velocidade) e a batida, que dura
// centésimos de segundo, bem mais lenta.
import { ligarSliders } from '../../../kit/controles';
import { fmt } from '../../../kit/formato';
import { iniciarLoop } from '../../../kit/loop';
import { buscar } from '../../../kit/montar';
import { criarTela } from '../../../kit/tela';
import { desenhar, seloCameraLenta } from './render';
import { acabou, bater, criar, emContato, frear, kmh, ms, passo, type Estado } from './simulacao';

/** Quanto o tempo da simulação anda a cada segundo real. */
function ritmo(s: Estado) {
  if (emContato(s)) return 0.08;
  if (s.fase === 'freando' && !acabou(s)) return 0.5;
  return 1;
}

export function iniciar(raiz: HTMLElement) {
  const entradaV = buscar<HTMLInputElement>(raiz, '[data-entrada="v"]');
  const botaoCinto = buscar<HTMLButtonElement>(raiz, '[data-acao="cinto"]');
  const botoesAcao = [...raiz.querySelectorAll<HTMLButtonElement>('[data-acao="frear"], [data-acao="bater"]')];
  const resultado = buscar(raiz, '[data-resultado]');
  const leituraCarro = buscar(raiz, '[data-leitura="carro"]');
  const leituraBoneco = buscar(raiz, '[data-leitura="boneco"]');
  const tela = criarTela(buscar(raiz, '[data-palco]'), { altura: 300 });
  const comCinto = () => botaoCinto.getAttribute('aria-pressed') === 'true';
  let s = criar(ms(Number(entradaV.value)), comCinto());

  const reiniciar = () => {
    s = criar(ms(Number(entradaV.value)), comCinto());
    resultado.textContent = '';
    for (const b of botoesAcao) b.disabled = false;
  };

  ligarSliders(raiz);
  entradaV.addEventListener('input', () => {
    buscar(raiz, '[data-saida="v"]').textContent = `${entradaV.value} km/h`;
    reiniciar();
  });
  botaoCinto.addEventListener('click', () => {
    botaoCinto.setAttribute('aria-pressed', String(!comCinto()));
    reiniciar();
  });
  for (const botao of botoesAcao) {
    botao.addEventListener('click', () => {
      if (botao.dataset.acao === 'frear') frear(s);
      else bater(s);
      for (const b of botoesAcao) b.disabled = true;
    });
  }
  buscar(raiz, '[data-acao="reiniciar"]').addEventListener('click', reiniciar);

  const concluir = () => {
    const v = fmt(kmh(s.v0), 0);
    resultado.textContent =
      s.impacto !== null
        ? `Sem cinto, o boneco seguiu em frente e bateu no painel a ${fmt(kmh(s.impacto), 0)} km/h.`
        : `Com cinto, o boneco parou junto com o carro, que vinha a ${v} km/h.`;
  };

  iniciarLoop(raiz, {
    atualizar: (dt) => {
      if (acabou(s)) return;
      const tempo = dt * ritmo(s);
      // Passos curtos: a batida dura poucos centésimos de segundo.
      const n = Math.ceil(tempo / (1 / 2000));
      for (let i = 0; i < n; i++) passo(s, tempo / n);
      if (acabou(s)) concluir();
    },
    desenhar: () => {
      desenhar(tela, s);
      if (ritmo(s) < 1) seloCameraLenta(tela);
      leituraCarro.textContent = `${fmt(kmh(s.v), 0)} km/h`;
      leituraBoneco.textContent = `${fmt(kmh(s.vBoneco), 0)} km/h`;
    },
  });
}
