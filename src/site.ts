// Dados gerais do site, usados no cabeçalho, no rodapé e nas metatags.
export const SITE = {
  nome: 'Prometheus',
  descricao: 'Entenda como o mundo funciona. Ciência explicada com simulações interativas.',
  github: 'https://github.com/marlon1402/prometheus',
} as const;

// Recebedor das doações por Pix estático (os mesmos dados do LumeRead).
export const DOACAO = {
  /** Chave aleatória (EVP) cadastrada no banco. */
  chave: 'dd71e984-b7a9-4450-99af-d6d3da82e9a1',
  nome: 'Marlon Samuel',
  cidade: 'LIMEIRA-SP',
  /** Valores sugeridos, em reais. Há também a opção de valor livre. */
  valores: [5, 10, 20],
} as const;
