# Como contribuir

Obrigado pelo interesse em ajudar o Prometheus! Correções de conteúdo são especialmente bem-vindas, principalmente de professores.

## Encontrou um erro?

O jeito mais simples é [abrir uma issue](https://github.com/marlon1402/prometheus/issues) dizendo em qual página está o problema, o que está errado e, se possível, a fonte da informação correta.

## Enviando uma correção

Todas as mudanças entram por pull request e são revisadas antes de serem publicadas.

1. Faça um fork do repositório e crie uma branch a partir da `main`.
2. Instale as dependências e rode o site:
   ```bash
   npm install
   npm run dev
   ```
   O site abre em http://localhost:4321/prometheus/.
3. Faça a mudança e confira:
   ```bash
   npm test        # testes da física das simulações
   npm run check   # checagem de tipos
   npm run build   # build de produção
   ```
4. Abra o pull request para a `main` preenchendo o modelo. A verificação automática roda sozinha, e a revisão é feita pelo responsável pelo projeto.

## Onde fica cada coisa

- `src/content/`: as lições, em MDX, por disciplina e módulo. O cabeçalho de cada arquivo é validado no build.
- `src/sims/`: as simulações, com a física (`simulacao.ts`, com testes) separada do desenho (`render.ts`).
- `src/components/licao/`: os componentes usados nas lições (quadros, perguntas, galeria, mapa e outros).

## Licença das contribuições

Ao contribuir, você concorda que os textos ficam sob a licença [CC BY-SA 4.0](LICENSE-CONTENT) e o código sob a licença [MIT](LICENSE), as mesmas do projeto.
