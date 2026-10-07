import { describe, expect, it } from 'vitest'
import { duracion, hora, horarioNegocio, moneda } from './formato.js'

describe('duracion', () => {
  // Parametrizado: incluye los bordes de 59 y 60 minutos.
  it.each([
    [30, '30 min'],
    [59, '59 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [180, '3 h'],
  ])('%i minutos se muestra como "%s"', (minutos, texto) => {
    expect(duracion(minutos)).toBe(texto)
  })
})

describe('hora', () => {
  it('saca los segundos y el cero de adelante', () => {
    expect(hora('09:00:00')).toBe('9:00')
  })
})

describe('moneda', () => {
  it('muestra pesos sin decimales y con separador de miles', () => {
    // El espacio entre el signo y el numero depende de la version de ICU.
    expect(moneda(18000).replace(/\s/g, '')).toBe('$18.000')
  })
})

describe('horarioNegocio', () => {
  const negocio = { hora_apertura: '09:00:00', hora_cierre: '19:30:00' }

  it('muestra un rango cuando los dias abiertos son seguidos', () => {
    const texto = horarioNegocio({ ...negocio, dias_cerrados: [0, 1] })

    expect(texto).toBe('Mar a Sáb · 9:00 – 19:30')
  })

  it('lista los dias uno por uno cuando no son seguidos', () => {
    const texto = horarioNegocio({ ...negocio, dias_cerrados: [0, 3] })

    expect(texto).toBe('Lun · Mar · Jue · Vie · Sáb · 9:00 – 19:30')
  })

  it('muestra un solo dia sin armar un rango', () => {
    const texto = horarioNegocio({ ...negocio, dias_cerrados: [0, 1, 2, 3, 4, 5] })

    expect(texto).toBe('Sáb · 9:00 – 19:30')
  })

  it('el domingo cuenta como ultimo dia de la semana, no como primero', () => {
    const texto = horarioNegocio({ ...negocio, dias_cerrados: [1, 2, 3, 4] })

    expect(texto).toBe('Vie a Dom · 9:00 – 19:30')
  })

  it('si no abre ningun dia dice Cerrado', () => {
    const texto = horarioNegocio({ ...negocio, dias_cerrados: [0, 1, 2, 3, 4, 5, 6] })

    expect(texto).toBe('Cerrado')
  })
})
