// Arranque de la aplicacion. Aca no hay reglas de negocio: se arman las
// piezas (pool -> repositorio -> servicio) y cada endpoint pide, delega y
// responde. Las reglas viven en src/ y son las que tienen tests.

import express from 'express';
import cors from 'cors';
import pool from './db.js';
import { crearRepositorio } from './repositorio.js';
import { crearServicioDeTurnos } from './src/turnos.js';
import { validarConsultaDeDisponibilidad, validarReserva } from './src/validaciones.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Inyeccion de dependencias: el servicio recibe el repositorio real.
const repo = crearRepositorio(pool);
const turnos = crearServicioDeTurnos({ repo });

app.use(cors());
app.use(express.json());

function manejarError(res, err, mensajeGenerico) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: mensajeGenerico });
}

// Lo usa el healthcheck de docker-compose.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Datos del negocio. Es lo que permite que el mismo frontend sirva para otro rubro.
app.get('/api/negocio', async (req, res) => {
  try {
    const negocio = await repo.obtenerNegocio();
    if (!negocio) {
      return res.status(404).json({ error: 'No hay un negocio configurado' });
    }
    res.json(negocio);
  } catch (err) {
    manejarError(res, err, 'Error al consultar el negocio');
  }
});

// Catalogo de servicios. Acepta ?categoria= para el filtro de la pantalla.
app.get('/api/servicios', async (req, res) => {
  try {
    res.json(await repo.listarServicios(req.query.categoria));
  } catch (err) {
    manejarError(res, err, 'Error al consultar el catalogo');
  }
});

// Profesionales habilitados para un servicio (paso 1 de la reserva).
app.get('/api/servicios/:id/profesionales', async (req, res) => {
  try {
    res.json(await repo.listarProfesionales(req.params.id));
  } catch (err) {
    manejarError(res, err, 'Error al consultar los profesionales');
  }
});

// Horarios libres para un servicio, un profesional y una fecha.
app.get('/api/disponibilidad', async (req, res) => {
  const error = validarConsultaDeDisponibilidad(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  const { servicioId, profesionalId, fecha } = req.query;
  try {
    res.json(await turnos.calcularDisponibilidad(servicioId, profesionalId, fecha));
  } catch (err) {
    manejarError(res, err, 'Error al calcular la disponibilidad');
  }
});

// Listado de turnos.
app.get('/api/turnos', async (req, res) => {
  try {
    res.json(await repo.listarTurnos());
  } catch (err) {
    manejarError(res, err, 'Error al consultar los turnos');
  }
});

// Reserva de turno.
app.post('/api/turnos', async (req, res) => {
  const error = validarReserva(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    res.status(201).json(await turnos.reservar(req.body));
  } catch (err) {
    manejarError(res, err, 'Error al guardar el turno');
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en el puerto ${PORT}`);
});
