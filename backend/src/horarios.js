// Reglas de la agenda. Son funciones puras: reciben valores y devuelven
// valores, sin tocar la base ni el reloj. Por eso se testean sin dobles.

// La agenda se maneja en bloques de 30 minutos: los turnos arrancan 9:00,
// 9:30, 10:00, etc. Si mas adelante un rubro necesita otro paso, esto pasa a
// ser una columna de la tabla negocio.
const PASO_MINUTOS = 30;

// '09:30:00' o '09:30' -> 570
function aMinutos(hora) {
  const [h, m] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

// 570 -> '09:30'
function aHora(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// '2026-09-08' -> 0 domingo, 1 lunes ... 6 sabado
function diaDeLaSemana(fecha) {
  return new Date(`${fecha}T00:00:00`).getDay();
}

// Date -> 'YYYY-MM-DD', segun la zona horaria del proceso.
function fechaLocal(momento) {
  const mes = String(momento.getMonth() + 1).padStart(2, '0');
  const dia = String(momento.getDate()).padStart(2, '0');
  return `${momento.getFullYear()}-${mes}-${dia}`;
}

// Date -> minutos transcurridos desde las 00:00 de ese dia.
function minutosDelDia(momento) {
  return momento.getHours() * 60 + momento.getMinutes();
}

// Dos intervalos [inicio, fin) se pisan si cada uno arranca antes de que
// termine el otro. Un turno que arranca justo cuando termina otro NO se pisa.
function sePisan(a, b) {
  return a.inicio < b.fin && b.inicio < a.fin;
}

// Horarios en los que entra un servicio de `duracion` minutos.
// Un candidato entra si: termina a mas tardar al cierre, no arranca antes de
// `minimo` (para no ofrecer horas que ya pasaron) y no se pisa con ningun
// turno ocupado. Todo en minutos desde las 00:00.
function calcularSlots({ apertura, cierre, duracion, ocupados, minimo = 0, paso = PASO_MINUTOS }) {
  const slots = [];
  for (let inicio = apertura; inicio + duracion <= cierre; inicio += paso) {
    if (inicio < minimo) continue;
    const candidato = { inicio, fin: inicio + duracion };
    if (!ocupados.some((turno) => sePisan(candidato, turno))) {
      slots.push(aHora(inicio));
    }
  }
  return slots;
}

export {
  PASO_MINUTOS,
  aMinutos,
  aHora,
  diaDeLaSemana,
  fechaLocal,
  minutosDelDia,
  sePisan,
  calcularSlots,
};
