import { describe, expect, it } from 'vitest';
import { aHora, aMinutos, calcularSlots, diaDeLaSemana, sePisan } from './horarios.js';

describe('conversion de horas', () => {
  // Parametrizado: el mismo comportamiento con varios datos.
  it.each([
    ['00:00', 0],
    ['09:00', 540],
    ['09:30:00', 570], // Postgres devuelve TIME con segundos
    ['19:30', 1170],
  ])('aMinutos(%s) da %i', (hora, minutos) => {
    expect(aMinutos(hora)).toBe(minutos);
  });

  it('aHora completa con ceros a la izquierda', () => {
    expect(aHora(545)).toBe('09:05');
  });
});

describe('diaDeLaSemana', () => {
  it('un martes da 2, sin correrse por la zona horaria', () => {
    expect(diaDeLaSemana('2026-10-06')).toBe(2);
  });
});

describe('sePisan', () => {
  it('dos turnos que comparten minutos se pisan', () => {
    const corte = { inicio: 600, fin: 650 };
    const color = { inicio: 630, fin: 765 };

    expect(sePisan(corte, color)).toBe(true);
  });

  it('un turno que arranca justo cuando termina otro NO se pisa (borde)', () => {
    const primero = { inicio: 600, fin: 630 };
    const segundo = { inicio: 630, fin: 660 };

    expect(sePisan(primero, segundo)).toBe(false);
  });
});

describe('calcularSlots', () => {
  // Agenda chica para que los resultados se lean enteros: 9:00 a 11:00.
  const agenda = { apertura: 540, cierre: 660, ocupados: [] };

  it('ofrece un horario cada 30 minutos mientras el servicio termine antes del cierre', () => {
    const slots = calcularSlots({ ...agenda, duracion: 30 });

    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30']);
  });

  it('un servicio que termina justo al cierre entra (borde)', () => {
    const slots = calcularSlots({ ...agenda, duracion: 60 });

    expect(slots.at(-1)).toBe('10:00'); // 10:00 + 60 min = 11:00, el cierre
  });

  it('un servicio mas largo que la jornada no tiene ningun horario', () => {
    const slots = calcularSlots({ ...agenda, duracion: 121 });

    expect(slots).toEqual([]);
  });

  it('saca los horarios que se pisan con un turno ya tomado', () => {
    const ocupados = [{ inicio: 570, fin: 600 }]; // 9:30 a 10:00

    const slots = calcularSlots({ ...agenda, duracion: 30, ocupados });

    expect(slots).toEqual(['09:00', '10:00', '10:30']);
  });

  it('un servicio largo no entra si su final cae adentro de un turno tomado', () => {
    const ocupados = [{ inicio: 600, fin: 630 }]; // 10:00 a 10:30

    const slots = calcularSlots({ ...agenda, duracion: 60, ocupados });

    // 9:00 termina 10:00 (entra); 9:30 y 10:00 se pisan con el turno.
    expect(slots).toEqual(['09:00']);
  });

  it('no ofrece horarios anteriores al minimo, pero si el del minuto exacto (borde)', () => {
    const slots = calcularSlots({ ...agenda, duracion: 30, minimo: 600 });

    expect(slots).toEqual(['10:00', '10:30']);
  });
});
