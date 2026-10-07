import { describe, expect, it } from 'vitest';
import { puedeCancelar } from './cancelaciones.js';

// Miercoles 7 de octubre de 2026, 10:00. El momento actual entra por
// parametro: el test no depende del reloj de la maquina.
const AHORA = new Date(2026, 9, 7, 10, 0);

const turno = (fecha, estado = 'pendiente') => ({ fecha, estado });

describe('puedeCancelar', () => {
  it('permite cancelar un turno al que le faltan mas de 4 horas', () => {
    const resultado = puedeCancelar(turno('2026-10-07 18:00:00'), AHORA);

    expect(resultado).toEqual({ permitido: true, motivo: null });
  });

  it('permite cancelar cuando faltan exactamente 4 horas (borde)', () => {
    const resultado = puedeCancelar(turno('2026-10-07 14:00:00'), AHORA);

    expect(resultado.permitido).toBe(true);
  });

  it('rechaza cuando faltan menos de 4 horas, y el motivo dice el limite', () => {
    const resultado = puedeCancelar(turno('2026-10-07 13:59:00'), AHORA);

    expect(resultado.permitido).toBe(false);
    expect(resultado.motivo).toContain('4 horas');
  });

  it.each([
    ['empezo hace una hora', '2026-10-07 09:00:00'],
    ['empieza en este mismo minuto', '2026-10-07 10:00:00'],
  ])('rechaza un turno que %s', (_caso, fecha) => {
    const resultado = puedeCancelar(turno(fecha), AHORA);

    expect(resultado).toEqual({ permitido: false, motivo: 'El turno ya paso' });
  });

  it('rechaza un turno que ya estaba cancelado', () => {
    const resultado = puedeCancelar(turno('2026-10-07 18:00:00', 'cancelado'), AHORA);

    expect(resultado).toEqual({ permitido: false, motivo: 'El turno ya estaba cancelado' });
  });

  it('rechaza si el turno no existe', () => {
    const resultado = puedeCancelar(null, AHORA);

    expect(resultado).toEqual({ permitido: false, motivo: 'El turno no existe' });
  });
});
