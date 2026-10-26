import { describe, expect, it } from 'vitest';
import { abntTexto, citacoes } from './fontes';

describe('Referência ABNT', () => {
  it('livro com subtítulo, edição e volume, sem ponto dobrado', () => {
    const texto = abntTexto({
      autores: ['HALLIDAY, David', 'RESNICK, Robert', 'WALKER, Jearl'],
      titulo: 'Fundamentos de física',
      subtitulo: 'mecânica',
      edicao: '10. ed.',
      local: 'Rio de Janeiro',
      editora: 'LTC',
      ano: 2016,
      trecho: 'v. 1',
    });
    expect(texto).toBe(
      'HALLIDAY, David; RESNICK, Robert; WALKER, Jearl. Fundamentos de física: mecânica. 10. ed. Rio de Janeiro: LTC, 2016. v. 1.',
    );
  });

  it('capítulo online, com “In:”, endereço e data de acesso', () => {
    const texto = abntTexto({
      autores: ['FEYNMAN, Richard P.'],
      capitulo: 'Vectors',
      titulo: 'The Feynman Lectures on Physics',
      local: 'Pasadena',
      editora: 'Caltech',
      trecho: 'v. 1, cap. 11',
      url: 'https://www.feynmanlectures.caltech.edu/I_11.html',
      acesso: '26 out. 2026',
    });
    expect(texto).toBe(
      'FEYNMAN, Richard P. Vectors. In: FEYNMAN, Richard P. The Feynman Lectures on Physics. Pasadena: Caltech. v. 1, cap. 11. ' +
        'Disponível em: https://www.feynmanlectures.caltech.edu/I_11.html. Acesso em: 26 out. 2026.',
    );
  });

  it('mais de três autores vira “et al.”', () => {
    const texto = abntTexto({ autores: ['A, a', 'B, b', 'C, c', 'D, d'], titulo: 'Obra' });
    expect(texto).toBe('A, a et al. Obra.');
  });
});

describe('Chamadas no texto', () => {
  it('na ordem da primeira chamada, sem repetir e ignorando comentários', () => {
    const corpo = [
      'Texto.<Ref id="bipm-si" /> Mais texto.<Ref id=\'feynman-12\'/>',
      '{/* <Ref id="esquecida" /> */}',
      'De novo.<Ref id="bipm-si" />',
    ].join('\n');
    expect(citacoes(corpo)).toEqual(['bipm-si', 'feynman-12']);
  });
});
