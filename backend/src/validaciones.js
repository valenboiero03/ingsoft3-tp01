// Validacion de lo que llega por HTTP. Devuelven null si esta todo bien, o el
// mensaje de error que se le contesta al cliente con un 400.

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^\d{2}:\d{2}$/;

function validarConsultaDeDisponibilidad({ servicioId, profesionalId, fecha } = {}) {
  if (!servicioId || !profesionalId || !fecha) {
    return 'Faltan servicioId, profesionalId o fecha';
  }
  if (!FORMATO_FECHA.test(fecha)) {
    return 'La fecha debe tener formato YYYY-MM-DD';
  }
  return null;
}

function validarReserva(datos = {}) {
  const { servicioId, profesionalId, fecha, hora, nombreCliente, telefonoCliente } = datos;

  if (!servicioId || !profesionalId || !fecha || !hora || !nombreCliente || !telefonoCliente) {
    return 'Faltan datos obligatorios';
  }
  if (!FORMATO_FECHA.test(fecha) || !FORMATO_HORA.test(hora)) {
    return 'Formato de fecha u hora invalido';
  }
  return null;
}

export { validarConsultaDeDisponibilidad, validarReserva };
