// Gera o “Pix copia e cola” (BR Code, padrão EMV do Banco Central) de um Pix
// estático: sem intermediário, API de cobrança ou servidor. É só texto com a
// chave, o valor opcional e um CRC16 no fim, e o mesmo texto vira o QR Code.
// Mesmo algoritmo do LumeRead (lib/core/services/pix_payload.dart).

interface Opcoes {
  chave: string;
  nome: string;
  cidade: string;
  /** Valor em reais. Sem valor, quem doa digita a quantia no app do banco. */
  valor?: number;
  txid?: string;
}

const campo = (id: string, valor: string) => `${id}${String(valor.length).padStart(2, '0')}${valor}`;

/** Nome e cidade: sem acento, em maiúsculas e no tamanho máximo do padrão. */
function limpar(texto: string, maximo: number) {
  return texto
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .slice(0, maximo);
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), em 4 dígitos hexadecimais. */
export function crc16(dados: string) {
  let crc = 0xffff;
  for (let i = 0; i < dados.length; i++) {
    crc ^= dados.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function pixCopiaECola({ chave, nome, cidade, valor, txid = '***' }: Opcoes) {
  const conta = campo('00', 'br.gov.bcb.pix') + campo('01', chave);
  const semCrc =
    campo('00', '01') + // versão do payload
    campo('26', conta) +
    campo('52', '0000') + // categoria (não informada)
    campo('53', '986') + // moeda: real
    (valor && valor > 0 ? campo('54', valor.toFixed(2)) : '') +
    campo('58', 'BR') +
    campo('59', limpar(nome, 25)) +
    campo('60', limpar(cidade, 15)) +
    campo('62', campo('05', txid)) +
    '6304'; // o CRC é calculado sobre tudo até aqui, inclusive “6304”
  return semCrc + crc16(semCrc);
}
