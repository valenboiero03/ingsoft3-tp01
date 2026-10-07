import { describe, expect, it } from 'vitest';
import { validarConsultaDeDisponibilidad, validarReserva } from './validaciones.js';

const reservaValida = {
  servicioId: 1,
  profesionalId: 2,
  fecha: '2026-10-06',
  hora: '10:00',
  nombreCliente: 'Ana Perez',
  telefonoCliente: '3511234567',
};

describe('validarReserva', () => {
  it('acepta una reserva con todos los datos obligatorios', () => {
    expect(validarReserva(reservaValida)).toBeNull();
  });

  it('el email y la nota son opcionales', () => {
    const { emailCliente, nota, ...sinOpcionales } = { ...reservaValida, emailCliente: '', nota: '' };

    expect(validarReserva(sinOpcionales)).toBeNull();
  });

  // Caso de error parametrizado: cada dato obligatorio, de a uno.
  it.each([
    'servicioId',
    'profesionalId',
    'fecha',
    'hora',
    'nombreCliente',
    'telefonoCliente',
  ])('rechaza la reserva si falta %s', (campo) => {
    const incompleta = { ...reservaValida, [campo]: '' };

    expect(validarReserva(incompleta)).toBe('Faltan datos obligatorios');
  });

  it.each([
    ['fecha con barras', { fecha: '06/10/2026' }],
    ['fecha sin ceros', { fecha: '2026-10-6' }],
    ['hora sin cero adelante', { hora: '9:00' }],
    ['hora con segundos', { hora: '09:00:00' }],
  ])('rechaza %s', (_caso, cambio) => {
    const malFormada = { ...reservaValida, ...cambio };

    expect(validarReserva(malFormada)).toBe('Formato de fecha u hora invalido');
  });

  it('rechaza un pedido sin cuerpo en vez de romperse', () => {
    expect(validarReserva(undefined)).toBe('Faltan datos obligatorios');
  });
});

describe('validarConsultaDeDisponibilidad', () => {
  const consulta = { servicioId: '1', profesionalId: '2', fecha: '2026-10-06' };

  it('acepta una consulta completa', () => {
    expect(validarConsultaDeDisponibilidad(consulta)).toBeNull();
  });

  it('rechaza la consulta si falta un parametro', () => {
    const { profesionalId, ...sinProfesional } = consulta;

    expect(validarConsultaDeDisponibilidad(sinProfesional)).toMatch(/^Faltan/);
  });

  it('explica el formato esperado cuando la fecha viene mal', () => {
    const error = validarConsultaDeDisponibilidad({ ...consulta, fecha: 'manana' });

    expect(error).toContain('YYYY-MM-DD');
  });
});
