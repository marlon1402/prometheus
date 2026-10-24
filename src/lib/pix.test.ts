import { describe, expect, it } from 'vitest';
import { crc16, pixCopiaECola } from './pix';

const chave = '123e4567-e12b-12d1-a456-426655440000';

describe('Pix copia e cola', () => {
  it('CRC16-CCITT: vetor padrão e exemplo do manual do BR Code', () => {
    expect(crc16('123456789')).toBe('29B1');
    // Exemplo publicado no manual do BR Code (Banco Central), CRC 1D3D.
    const exemplo =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000' +
      '5204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
    expect(crc16(exemplo)).toBe('1D3D');
  });

  it('monta os campos EMV com valor', () => {
    const codigo = pixCopiaECola({ chave, nome: 'PROMETHEUS', cidade: 'LIMEIRA-SP', valor: 10 });
    expect(codigo).toMatch(
      new RegExp(
        '^000201' + `26580014br.gov.bcb.pix0136${chave}` + '52040000' + '5303986' + '540510.00' + '5802BR' +
          '5910PROMETHEUS' + '6010LIMEIRA-SP' + '62070503\\*\\*\\*' + '6304',
      ),
    );
    expect(codigo.slice(-4)).toBe(crc16(codigo.slice(0, -4)));
  });

  it('sem valor, omite o campo 54 (valor livre)', () => {
    const codigo = pixCopiaECola({ chave, nome: 'PROMETHEUS', cidade: 'LIMEIRA-SP' });
    expect(codigo).toContain('5303986' + '5802BR');
  });

  it('nome e cidade sem acento, em maiúsculas e no tamanho máximo', () => {
    const codigo = pixCopiaECola({
      chave,
      nome: 'Associação de Leitores do Brasil Inteiro',
      cidade: 'São João da Boa Vista',
    });
    expect(codigo).toContain('5925ASSOCIACAO DE LEITORES D');
    expect(codigo).toContain('6015SAO JOAO DA BOA');
  });
});
