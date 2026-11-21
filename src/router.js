// Enrutado por hash: funciona en GitHub Pages sin configurar el servidor.
export const parse = () => {
  const [view = 'enfoque', sub = ''] = location.hash.replace(/^#\/?/, '').split('/');
  return { view: view || 'enfoque', sub };
};
export const go = (view, sub = '') => { location.hash = `#/${view}${sub ? '/' + sub : ''}`; };
