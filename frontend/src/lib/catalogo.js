// Logica del catalogo, separada de la pantalla para poder testearla sin DOM.

export const TODOS = 'Todos'

// Las categorias que aparecen como filtros: "Todos" primero y despues cada
// categoria una sola vez, en el orden en que llegan del backend.
export function categoriasDe(servicios) {
  if (!servicios) return []
  return [TODOS, ...new Set(servicios.map((s) => s.categoria))]
}

// Los servicios que se muestran segun el filtro elegido.
export function filtrarPorCategoria(servicios, categoria) {
  if (categoria === TODOS) return servicios
  return servicios.filter((s) => s.categoria === categoria)
}
