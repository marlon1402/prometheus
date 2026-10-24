// O site pode estar publicado num subcaminho (hoje, /prometheus no GitHub Pages).
// Todo link interno e todo arquivo de public/ deve passar por url().
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(caminho = '/'): string {
  return `${base}/${caminho.replace(/^\//, '')}`;
}
