import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      // json-summary deja coverage-summary.json, que es lo que lee el pipeline
      // para armar la tabla del Summary.
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      // Que entra en la cuenta: toda la logica de negocio (src/). Un archivo
      // nuevo en esa carpeta entra solo, tenga tests o no. Quedan afuera el
      // arranque (index.js) y lo que habla con Postgres (db.js, repositorio.js).
      include: ['src/**'],
      // El umbral: si la cobertura de lineas o de ramas queda abajo de 90,
      // vitest sale con error y el build se rompe. El porque del numero esta
      // en decisiones.md (TP5).
      thresholds: { lines: 90, branches: 90 },
    },
  },
});
