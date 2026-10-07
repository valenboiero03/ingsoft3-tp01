import { describe, expect, it } from 'vitest'
import { TODOS, categoriasDe, filtrarPorCategoria } from './catalogo.js'

const servicios = [
  { id: 1, nombre: 'Balayage', categoria: 'Color' },
  { id: 2, nombre: 'Corte masculino', categoria: 'Corte' },
  { id: 3, nombre: 'Coloración completa', categoria: 'Color' },
]

describe('categoriasDe', () => {
  it('pone "Todos" primero y cada categoria una sola vez', () => {
    expect(categoriasDe(servicios)).toEqual([TODOS, 'Color', 'Corte'])
  })

  it('devuelve una lista vacia mientras el catalogo no cargo', () => {
    expect(categoriasDe(null)).toEqual([])
  })
})

describe('filtrarPorCategoria', () => {
  it('con "Todos" devuelve el catalogo completo', () => {
    expect(filtrarPorCategoria(servicios, TODOS)).toHaveLength(3)
  })

  it('con una categoria devuelve solo los servicios de esa categoria', () => {
    const visibles = filtrarPorCategoria(servicios, 'Color')

    expect(visibles.map((s) => s.nombre)).toEqual(['Balayage', 'Coloración completa'])
  })

  it('con una categoria que no existe devuelve una lista vacia', () => {
    expect(filtrarPorCategoria(servicios, 'Barberia')).toEqual([])
  })
})
