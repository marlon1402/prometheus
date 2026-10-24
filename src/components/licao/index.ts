// Componentes disponíveis em toda lição .mdx sem precisar de import.
// Ilustrações e simulações específicas são importadas no próprio .mdx.
import Classificar from './Classificar.astro';
import Formula from './Formula.astro';
import Foto from './Foto.astro';
import Galeria from './Galeria.astro';
import Ilustracao from './Ilustracao.astro';
import Mapa from './mapa/Mapa.astro';
import Regiao from './mapa/Regiao.astro';
import Numeros from './Numeros.astro';
import Pergunta from './Pergunta.astro';
import Quadro from './Quadro.astro';
import SaibaMais from './SaibaMais.astro';
import Tex from './Tex.astro';

export const componentesDaLicao = {
  Classificar,
  Formula,
  Foto,
  Galeria,
  Ilustracao,
  Mapa,
  Numeros,
  Pergunta,
  Regiao,
  Quadro,
  SaibaMais,
  Tex,
};
