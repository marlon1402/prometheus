import { defineConfig } from 'vitest/config';

// Testes da física das simulações e do kit (arquivos *.test.ts em src/).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
