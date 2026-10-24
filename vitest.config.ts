import { defineConfig } from 'vitest/config';

// Testes da física das simulações, do kit e das bibliotecas (arquivos *.test.ts em src/).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
