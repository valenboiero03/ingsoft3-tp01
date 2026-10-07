// Regla de cancelacion: un turno se puede cancelar hasta 4 horas antes de su
// horario. Es lo que promete la pantalla del catalogo ("Podes cancelar o
// reprogramar hasta 4 horas antes del turno").
//
// Funcion pura: recibe el turno y el momento actual, y devuelve si se puede
// cancelar y, si no, el motivo que se le muestra al cliente.

const HORAS_DE_ANTICIPACION = 4;
const MS_POR_HORA = 60 * 60 * 1000;

function rechazo(motivo) {
  return { permitido: false, motivo };
}

function puedeCancelar(turno, ahora) {
  if (!turno) {
    return rechazo('El turno no existe');
  }
  if (turno.estado === 'cancelado') {
    return rechazo('El turno ya estaba cancelado');
  }

  // La base guarda '2026-10-07 10:00:00', en hora local del negocio.
  const inicio = new Date(turno.fecha.replace(' ', 'T'));
  const horasQueFaltan = (inicio - ahora) / MS_POR_HORA;

  if (horasQueFaltan <= 0) {
    return rechazo('El turno ya paso');
  }
  if (horasQueFaltan < HORAS_DE_ANTICIPACION) {
    return rechazo(`Solo se puede cancelar hasta ${HORAS_DE_ANTICIPACION} horas antes del turno`);
  }
  return { permitido: true, motivo: null };
}

export { HORAS_DE_ANTICIPACION, puedeCancelar };
