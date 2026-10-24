// Componentes leves, disponíveis em toda lição .mdx sem precisar de import.
//
// Componentes com CSS ou JavaScript pesado são importados no próprio .mdx, para
// que só as lições que os usam carreguem esse código:
//   import Formula from '…/components/licao/Formula.astro';      (e Tex: KaTeX)
//   import Mapa from '…/components/licao/mapa/Mapa.astro';       (e Regiao)
//   import CaixaNoGelo from '…/sims/fisica/caixa-no-gelo/CaixaNoGelo.astro';
import Classificar from './Classificar.astro';
import Foto from './Foto.astro';
import Galeria from './Galeria.astro';
import Ilustracao from './Ilustracao.astro';
import Lei from './Lei.astro';
import Numeros from './Numeros.astro';
import Pergunta from './Pergunta.astro';
import Quadro from './Quadro.astro';
import SaibaMais from './SaibaMais.astro';

export const componentesDaLicao = {
  Classificar,
  Foto,
  Galeria,
  Ilustracao,
  Lei,
  Numeros,
  Pergunta,
  Quadro,
  SaibaMais,
};
