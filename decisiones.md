## Git no pudo resolver el conflicto solo ya que no no tiene la capacidad de decidir por nosotros cual es el cambio que verdaderamente queremos aplicar o si queremos combinar los dos cambios, sino que eso lo tenemos que decidir nosotros.
## Lo que tendria que haber pasado para que nunca apareciera es que , no cambien la misma linea de main dos ramas o que la version b haya actuado sobre los cambios de la version a con sus cambios ya realizados ya que al hacer cada uno alguna operacion sobre la misma linea se estarian pisando como fue este el caso.

## Lo que me costo fue justamente la parte de la version a y la version b, ya que al realizarse con copilot y realizar las cosas tan rapidas en el video a veces no entendia que habia accionado, despues de verlo un par de veces pude resolver ese problema.
## Acerca de la IA no estuve usando ya que segui el video precisamente para entender el tema de la mejor manera posible.

## TP2 — Contenedores

### Qué app elegí y por qué

Armé un turnero con catálogo básico de servicios (pensado para negocios chicos tipo peluquerías, veterinarias, academias) como proyecto nuevo, separado en dos servicios reales: backend en Node/Express con PostgreSQL, y frontend en React/Vite servido por nginx.

Lo evalué contra los 4 puntos que pide la cátedra:
- **Build local sin magia**: sí, todo corre con `docker compose up -d --build` y `cp .env.example .env` — no depende de ninguna cuenta externa (nada de OAuth, pagos ni servicios de terceros).
- **Tests**: todavía no tiene, queda pendiente para el TP5.
- **Entender el código**: elegí armar la app de cero en vez de reciclar un proyecto anterior (evalué uno tipo e-commerce que ya tenía, pero era un monolito Next.js sin backend y frontend separados — no cumplía el requisito de dos servicios reales, así que arranqué de nuevo).
- **Tamaño**: CRUD chico a propósito — catálogo de servicios + reserva de turnos, sin pagos, sin login social, sin IA. Todo eso queda para después de la materia.

### Decisiones de contenerización

- **Backend**: multi-stage con `node:22-alpine` en las dos etapas. La primera instala todo (`npm ci`), la segunda copia el resultado y corre `npm prune --omit=dev` para sacar las dependencias de desarrollo (nodemon). Como las dos etapas comparten la misma imagen base, la reducción de tamaño es chica (~4MB) — el ahorro grande de Node no viene de cambiar de imagen, viene de podar lo que no se usa en producción.
- **Frontend**: multi-stage con `node:22-alpine` para compilar (`npm run build`) y `nginx:alpine` para servir los estáticos ya compilados. Acá la reducción es grande (~80%, de 467MB a 93.7MB) porque sí cambia la imagen base completa — nginx ni siquiera tiene Node instalado.
- **Qué persiste y qué no**: la base de datos usa un volumen (`db_data`) para que los turnos sobrevivan a un `docker compose down`. Los contenedores en sí no persisten nada — se pueden borrar y recrear sin perder datos, siempre que el volumen quede intacto.
- **`depends_on` + `healthcheck`**: el backend no arranca hasta que Postgres esté realmente aceptando conexiones (no solo "el contenedor existe"), para no arrancar en carrera contra una base que todavía no está lista.
- **`nginx.conf`**: el proxy hacia el backend usa una variable (`set $backend_api`) en vez del nombre del servicio escrito directo, para que nginx no intente resolver el nombre al arrancar (fallaría si el frontend levanta antes que el backend) sino recién cuando llega un pedido real.

### Problemas que encontré y cómo los resolví

- Git Bash (MinTTY) no soporta menús interactivos: tanto `npm create vite@latest` como `docker login` se realizaban de forma vanilla/default. Lo resolvi evitando la interactividad: `--template react` como argumento directo, y `--password-stdin` para el login.
- El `Dockerfile` del backend se guardó vacío la primera vez (nunca llegué a crearlo) — lo detecté con `ls -la` antes de asumir que el problema era otra cosa.
- El tag `v1.0.0` del TP1 apuntaba a un commit anterior a que existieran `decisiones.md` y `evidencias.md` — lo recreé apuntando al commit correcto antes de arrancar este TP.

### Sobre el uso de IA

Usé Claude en este TP: para diseñar el modelo de datos, escribir el código del backend y frontend, para algunos comandos de Docker fuera de lso basicos como docker compose up , y para comandos como nginx y tambien para debuggear cada error que fui encontrando en el camino. No copié nada a ciegas: cada pieza la probé yo mismo antes de darla por buena (corriendo los contenedores, pegándole a los endpoints con `curl`, verificando en la base de datos directamente que los datos persistían, comparando tamaños de imagen reales). Cada Dockerfile tiene dos etapas, por qué el `healthcheck` es necesario y no alcanza con `depends_on` solo, y por qué el proxy de nginx usa una variable en vez del nombre del servicio escrito directo.


## TP3 - Planificacion y trazabilidad

### Duracion del sprint

Elegi un sprint de 10 dias (aproximadamente 1.5 semanas) en vez de un numero redondo de semanas. El campo Iteration de GitHub Projects solo permite numeros enteros cuando se usa la unidad "weeks", asi que para lograr algo entre una semana y dos semanas cambie la unidad a "days". Esta duracion se ajusta mejor al ritmo con el que voy entregando los TPs de la materia que una semana justa (demasiado corta para completar una historia con dos tareas) o dos semanas completas (demasiado laxo, perderia la presion de terminar rapido).

### Limite de trabajo en progreso

Configure el limite de la columna "In Progress" en 2. La regla de partida es cantidad de personas mas uno: como trabajo solo en este proyecto, eso da 1 + 1 = 2. El "mas uno" funciona como valvula para cuando algo queda esperando (por ejemplo, un PR esperando que corran los checks) y necesito poder avanzar en otra cosa sin quedarme bloqueado, sin llegar a tener cinco tareas a medio hacer en simultaneo.

### Diagnostico de la historia mal escrita

Cree a proposito el issue #18, "Como desarrollador quiero crear la tabla usuarios para guardar los datos", para reconocer el anti-patron de la historia-tarea disfrazada. Tiene la forma de una historia de usuario pero el contenido es una tarea tecnica: "crear una tabla" no es algo que un usuario final quiera, es un paso interno de implementacion, y el "para guardar los datos" no es un beneficio real sino casi la misma frase repetida sin explicar que gana alguien con esto.

Como la reescribiria: la bajaria a tarea, colgada de una historia con valor de usuario real, por ejemplo "Como usuario quiero que mis datos se guarden de forma persistente para no perderlos si la app se reinicia o se actualiza", y "crear la tabla usuarios" pasaria a ser una de las tareas tecnicas de esa historia.

### Problemas que encontre y como los resolvi

- No tenia GitHub CLI instalado en esta maquina. Lo instale con `winget install --id GitHub.cli` y reinicie la terminal para que tomara el PATH nuevo.
- El token de `gh` no tenia el scope `project`, asi que los comandos de `gh project` hubieran fallado. Lo actualice con `gh auth refresh -s project` antes de crear el proyecto.
- Al crear las tres labels (`epic`, `story`, `task`) me salte una sin darme cuenta (`task`). Lo detecte comparando la salida de `gh label list` contra lo que esperaba tener, y corri el comando que faltaba.

### Sobre el uso de IA

Use Claude durante todo este TP: para entender la consigna y la guia paso a paso, para que me explicara conceptos que no tenia claros (por ejemplo la diferencia entre sub-issues y task-lists), para que me armara los comandos de `gh` y PowerShell en cada paso, y para redactar el diagnostico de la historia mal escrita y este mismo archivo. No copie nada a ciegas: corri cada comando yo mismo en mi propia terminal, revise la salida de cada uno antes de seguir al siguiente paso, y verifique visualmente en GitHub (capturas del board, del proyecto publico, del issue #14 cerrado y movido a Done, y del pull request #17 mergeado) que cada cosa quedara como se esperaba antes de avanzar.

## TP4 - Nota
Cambio de relleno para demostrar el boton "Update branch" con dos PRs abiertos en simultaneo.

## TP4 - Pipelines de CI

### Estructura del pipeline
Un workflow (`.github/workflows/ci.yml`) disparado por `pull_request` y `push` a `main`, con dos jobs en paralelo: `build-backend` y `build-frontend`. Cada uno usa el Dockerfile correspondiente del TP2 (`./backend`, `./frontend`) via `docker/build-push-action`, con `push: false` (todavia no se publica en ningun registry, solo se valida que compile).

### Cache de capas
`docker/setup-buildx-action` + `cache-from`/`cache-to: type=gha`, con `scope` distinto por job (`backend` / `frontend`) para que no se pisen entre si. Se confirmo funcionando en la corrida del PR #23 (job `build-frontend`, 31% de las capas reutilizadas) — el cache se guarda en cada push a `main` y lo aprovecha el proximo PR desde su primera corrida.

### Gate obligatorio
Se extendio la proteccion de rama del TP1: `Require status checks to pass before merging` con `build-backend` y `build-frontend` como checks requeridos, mas `Require branches to be up to date before merging` (equivalente a `strict: true`). Se mantuvieron las reglas del TP1 (0 approvals, `Do not allow bypassing the above settings`).

### Demostracion del gate
PR #23: se agrego una dependencia inexistente a `backend/package.json`, lo que hizo fallar el paso `npm ci` del Dockerfile. El check `build-backend` quedo en rojo y el boton de merge se bloqueo (`build-frontend` no se vio afectado, corre independiente). Se abrio un segundo PR (#24) en paralelo para demostrar el boton "Update branch" sobre el PR bloqueado. Se corrigio la dependencia, el pipeline paso a verde, y se mergeo con squash.

### Problemas encontrados
- Docker Desktop no estaba corriendo en el primer intento de build local (mismo problema que en TP2).
- Backend Node/Express no tiene build step, por lo que un error de codigo no alcanza para romper `docker build` — hubo que romper una dependencia en `package.json` en vez de el codigo en si.
- Varias veces el commit se hizo en la rama equivocada (`main` en vez de la feature branch) por olvidar el `git checkout -b` antes de editar — resuelto verificando `git status`/`git branch` antes de cada commit.

### Uso de IA
Se uso Claude para interpretar la consigna del TP4, generar el `ci.yml`, planificar la secuencia de PRs, y depurar problemas de git (ramas desincronizadas, conflictos de merge) durante la ejecucion.

## TP5 - Calidad automatizada: tests, coverage y el umbral que frena un merge

> Los enlaces marcados `PENDIENTE` se completan a medida que corren las corridas y los Pull Requests de la demostracion.

### Que logica elegi testear y por que esa

El bug que mas duele en un turnero es dar un turno que no se puede cumplir: dos clientes en el mismo horario con el mismo profesional, un servicio que termina despues del cierre, o un turno en un dia que el negocio no abre. Por eso la suite esta puesta sobre el calculo de disponibilidad y la reserva, no sobre los endpoints de listado (que solo leen y devuelven).

Reglas cubiertas en el backend (43 tests en 3 archivos, `backend/src/*.test.js`):

| Regla | Donde vive | Borde que se prueba |
|---|---|---|
| Un servicio solo entra si termina a mas tardar al cierre | `calcularSlots` | termina justo al cierre: entra |
| Dos turnos del mismo profesional no se pisan | `sePisan` / `calcularSlots` | arranca justo cuando termina el otro: no se pisa |
| Si la fecha es hoy no se ofrecen horas que ya pasaron | `calcularSlots` + servicio | el minuto exacto: entra |
| No se reserva en fechas pasadas ni en dias cerrados | `calcularDisponibilidad` | hoy no es "pasado" |
| La reserva se revalida en el servidor antes de guardar | `reservar` | horario tomado: 409 y no se guarda |
| Si otro cliente gana el horario entre la validacion y el insert, es un 409 y no un 500 | `reservar` | error 23505 de Postgres |
| Datos obligatorios y formato de fecha y hora | `validarReserva` | cada campo faltante, de a uno |

En el frontend (23 tests en 3 archivos, `frontend/src/lib/*.test.js`): el formato de duracion y de horario del negocio, el filtro del catalogo por categoria, y el cliente de la API (rutas que arma y como traduce los errores del backend).

Las tres tecnicas estan de los dos lados:

| Tecnica | Backend | Frontend |
|---|---|---|
| Parametrizado (`it.each`) | `aMinutos`, campos faltantes de la reserva, formatos invalidos | `duracion` con los bordes 59 / 60 |
| Caso de error | reserva sobre horario tomado, servicio inexistente, pedido sin cuerpo | respuesta 409 del backend, respuesta de error que no es JSON |
| Mock | repositorio y reloj (`backend/src/turnos.test.js`) | `fetch` (`frontend/src/lib/cliente.test.js`) |

Para comprobar que los tests verifican y no solo ejecutan, se invirtieron a mano 13 reglas de a una (`<=` por `<`, `&&` por `||`, `===` por `!==`, sacar un campo obligatorio) y en los 13 casos algun test se puso en rojo. No se uso Stryker: fue manual, regla por regla.

### Refactor para poder mockear: que cambie y por que antes no se podia

Antes, toda la logica estaba en `backend/index.js`: `calcularDisponibilidad` hacia `pool.query(...)` directo contra un `pool` importado arriba del archivo, y pedia la hora con `new Date()` adentro. No habia forma de llamarla desde un test sin una base Postgres levantada, y el resultado dependia de la hora del dia en que corriera. No era dificil de testear, era imposible.

Lo que cambie:

- `backend/src/horarios.js`: las reglas de la agenda como funciones puras (reciben valores, devuelven valores). Se testean sin ningun doble.
- `backend/src/validaciones.js`: la validacion de lo que llega por HTTP, que antes estaba en los `if` de cada endpoint.
- `backend/src/turnos.js`: `crearServicioDeTurnos({ repo, ahora })`. El servicio ya no fabrica sus dependencias, las recibe: `repo` es quien habla con la base y `ahora` es el reloj.
- `backend/repositorio.js`: todo el SQL, en un solo lugar.
- `backend/index.js`: quedo como arranque. Arma `pool -> repositorio -> servicio` y cada endpoint pide, delega y responde.

En el test con mock el repositorio es un objeto de `vi.fn()`. Actua como stub cuando solo contesta datos (los turnos del dia) y como mock cuando el assert mira la interaccion: `expect(repo.guardarTurno).not.toHaveBeenCalled()` comprueba que si el horario esta tomado no se llega a guardar nada, y `toHaveBeenCalledTimes(1)` que una reserva valida se guarda una sola vez.

En el frontend el problema era el mismo con otra cara: `api.js` llamaba a `fetch` adentro. Ahora `frontend/src/lib/cliente.js` exporta `crearCliente(traer)` y `api.js` le pasa el `fetch` real; en el test entra un `vi.fn()`.

Dos cosas que hubo que cuidar porque los tests no las reclaman:

- La app real tiene que seguir andando. Se levanto el backend refactorizado contra un Postgres con `init.sql` y se probo con `curl` cada endpoint: catalogo, profesionales, disponibilidad (dia abierto y dia cerrado), reserva (201), la misma reserva otra vez (409) y pedido incompleto (400).
- El backend paso de CommonJS (`require`) a modulos ES (`import`, `"type": "module"` en `package.json`). El motivo esta en "Problemas encontrados".

### Stack: que herramienta use para cada cosa

Mi app no es .NET: el backend es Node/Express y el frontend React/Vite. Use vitest 5 en los dos lados, asi hay una sola herramienta para aprender y defender.

| Lo que habia que lograr | Backend (Node) | Frontend (Vite) |
|---|---|---|
| Donde viven los tests | al lado del codigo, `src/*.test.js` | al lado del codigo, `src/lib/*.test.js` |
| Parametrizado | `it.each` | `it.each` |
| Que la dependencia entre desde afuera | parametro de `crearServicioDeTurnos` | parametro de `crearCliente` |
| Fabricar el doble | `vi.fn()` | `vi.fn()` |
| Medir la cobertura | `vitest run --coverage` (`@vitest/coverage-v8`) | igual |
| Umbral que rompe el build | `coverage.thresholds` en `backend/vitest.config.mjs` | `coverage.thresholds` en `frontend/vite.config.js` |
| Que entra en la cuenta | `coverage.include: ['src/**']` | `coverage.include: ['src/lib/**']` |
| Reporte legible | reporter `html` + `json-summary` | igual |
| Herramientas de test en la etapa de tests del Dockerfile | `npm ci` sin `--omit=dev` en la etapa `build`; la etapa final hace `npm prune --omit=dev` | `npm ci` sin `--omit=dev`; nginx solo copia `dist` |

### Como corre en el pipeline

No hay jobs nuevos ni checks nuevos. A cada Dockerfile se le agrego una etapa `test` en el medio (`FROM build AS test`, con `ENTRYPOINT ["npm", "run", "test:ci"]`), y a cada job del TP4 cuatro pasos despues de construir la imagen: construir la etapa `test` (`target: test`, `load: true`), correrla con `docker run` montando una carpeta del runner, armar la tabla en el Summary de la corrida a partir de `coverage-summary.json`, y publicar el reporte HTML como artefacto (`coverage-backend`, `coverage-frontend`).

Una sola receta: el pipeline no sabe como se testea la app, se lo pide al Dockerfile. El script `test:ci` de cada `package.json` es el mismo comando que corre adentro del contenedor.

- Corrida con el resumen de cobertura y el reporte descargable: `PENDIENTE: .../actions/runs/<id>`

### Mi umbral: 90 % de lineas y 90 % de ramas, en backend y en frontend

Medicion de hoy:

| | Lineas | Ramas |
|---|---|---|
| Backend (`backend/src/**`) | 98,57 % (69 de 70) | 98,07 % (51 de 52) |
| Frontend (`frontend/src/lib/**`) | 100 % (35 de 35) | 100 % (19 de 19) |

Puse 90 y no 98 o 100 porque el umbral tiene que frenarme cuando entra codigo sin tests, no cuando agrego una linea defensiva: con lo que mido hoy, 90 deja entrar unas 6 lineas nuevas sin tests en el backend y 3 en el frontend, y cualquier funcion nueva con varios caminos y sin tests lo cruza. Lo puse sobre las dos metricas porque la de lineas sola es la menos honesta: un `if` ejecutado por un solo camino da 100 % de linea y 50 % de rama.

Para subirlo a 95 no haria falta escribir tests nuevos hoy, pero el margen quedaria en 2 lineas nuevas en el backend y el gate empezaria a frenar cambios chicos y legitimos. Lo que si mejoraria la calidad no es subir el numero sino medir lo que hoy queda afuera: el SQL del repositorio, con tests de integracion contra una base real.

El umbral se evalua sobre el total de lo medido, no por archivo.

### Que deje afuera de la cuenta y por que

Backend (entra `backend/src/**`; queda afuera todo lo demas):

- `index.js`: es el arranque y las rutas. Despues del refactor no le quedan reglas: cada endpoint valida con una funcion de `src/`, delega y responde. Si esta mal, la app no levanta o el endpoint da 500 y se ve enseguida.
- `db.js`: crea el pool de conexiones. Configuracion, sin comportamiento propio.
- `repositorio.js`: es SQL contra Postgres. Un unit test con la base mockeada solo probaria que llame a `pool.query`, no que la consulta este bien. Lo honesto es decir que **aca si queda logica sin verificar**: por ejemplo, el filtro `estado <> 'cancelado'` (un turno cancelado libera el horario) vive en el SQL y ningun test de esta suite lo cubre. Eso se verifica con pruebas de integracion o end-to-end (TP7), no con cobertura unitaria.

Frontend (entra `frontend/src/lib/**`):

- `pages/` y `components/`: componentes de React. Testearlos pide jsdom y Testing Library; la UI se verifica end-to-end en el TP7. La logica que tenian adentro (el filtro del catalogo) se saco a `lib/catalogo.js` justamente para que entre en la cuenta.
- `main.jsx`: el arranque de React y las rutas.
- `api.js`: son tres lineas que le pasan el `fetch` real al cliente. El equivalente del registro de dependencias del backend.

Use `include` por carpeta y no una lista de archivos: cualquier archivo nuevo que se cree en `src/` (backend) o `src/lib/` (frontend) entra en la cuenta solo, tenga tests o no. Se comprobo agregando un archivo sin tests: la cobertura bajo y el build se rompio.

### Por que un coverage alto no garantiza calidad, con mi ejemplo

Mi frontend mide 100 % y eso no prueba que la pantalla funcione. Tres razones concretas de mi repo:

1. El 100 % es sobre `src/lib/`. Los componentes, que es lo que el usuario ve, no estan medidos.
2. `cliente.test.js` cubre todo `cliente.js`, pero el doble de `fetch` contesta lo que yo le dije que conteste. Si manana el backend cambia `{ error: "..." }` por `{ mensaje: "..." }`, los tests siguen verdes y la app muestra "El servidor respondio 409" en vez del motivo real.
3. La cobertura mide ejecucion, no verificacion. Si a `'guarda el turno una sola vez'` le borro los tres `expect`, el test sigue pasando y `reservar` sigue figurando cubierto. Lo que me dice si los tests verifican es lo otro: invertir la regla y ver si algo se pone rojo.

Coverage bajo si es una senal confiable (hay codigo que nadie ejercita); coverage alto solo dice que el codigo se ejecuto.

### El ejercicio de la rama sin cubrir

1. **Que linea es**: `backend/src/turnos.js`, linea 21: `function crearServicioDeTurnos({ repo, ahora = () => new Date() })`. La rama la abre el valor por defecto del parametro: un camino es "me pasaron un reloj" y el otro es "no me pasaron ninguno, uso el del sistema". Todos los tests pasan un reloj fijo, asi que el camino del reloj real no se recorre nunca. Es la unica linea y la unica rama sin cubrir del backend.
2. **Que entrada la recorreria**: crear el servicio sin reloj, `crearServicioDeTurnos({ repo })`, y pedir la disponibilidad de una fecha cualquiera.
3. **Que decidi**: no agregar ese test. Recorrer esa rama es usar el reloj real, que es justo lo que saque de los tests para que sean deterministas: el resultado cambiaria segun el dia y la hora en que corra la suite. Y lo que verificaria (que `new Date()` devuelve la fecha actual) no es una regla mia. Ese camino lo usa `index.js` en produccion y se ejercita cuando la app corre de verdad.

### El Pull Request bloqueado por cobertura

- Pull Request con la secuencia completa (rojo por cobertura, los tests que faltaban, verde, merge): `PENDIENTE: .../pull/<n>`
- Corrida roja por umbral, con el numero en el log: `PENDIENTE: .../actions/runs/<id>`
- Que check se puso en rojo, en que metrica y con que numeros: `PENDIENTE`
- Que tests escribi para arreglarlo: `PENDIENTE`
- Segundo Pull Request, abierto y en rojo hasta la defensa: `PENDIENTE: .../pull/<m>`

Por que este freno es distinto del del TP4: alla el check se ponia rojo porque la imagen no se construia. Aca el codigo compila, la imagen se arma y todos los tests pasan; lo que frena es un numero que elegi yo. Lo que igual deja pasar: un requisito mal entendido (el test congela lo que yo entendi), un test que ejecuta sin verificar, y todo lo que quedo afuera de la cuenta.

### Problemas encontrados

- **La cobertura del backend daba mal por mezclar CommonJS con vitest.** Con el backend en `require`, `turnos.js` cargaba `horarios.js` por el `require` nativo de Node y el test lo cargaba por vitest: eran dos copias del mismo archivo y las lineas ejecutadas por una no se le contaban a la otra. `fechaLocal` y `minutosDelDia` figuraban sin cubrir aunque un test las recorria (85 % en `horarios.js`). Se paso el backend a modulos ES y la medicion quedo bien (100 % en ese archivo). `pg` sigue siendo CommonJS, por eso en `db.js` se importa entero (`import pg from 'pg'`) y despues se desarma.
- **`vitest` y `@vitest/coverage-v8` tienen que ser de la misma version mayor.** Se instalaron los dos en `@5` y se comprobo con `npm ls`.
- **En Windows el script `test:ci` no sirve tal cual**: la expansion `${COVERAGE_DIR:-coverage}` es de `sh`. En mi maquina corro `npm test -- --run --coverage`; `test:ci` es el del contenedor, que es Linux.

### Uso de IA

Use Claude para este TP. Hizo el refactor del backend y del frontend, escribio los tests, la configuracion de cobertura, las etapas de test de los Dockerfiles, los pasos nuevos del `ci.yml` y el borrador de esta seccion. Antes de entregarme los cambios corrio las dos suites, simulo los pasos del pipeline desde una copia limpia (`npm ci` + `test:ci` + el script del resumen), levanto el backend contra Postgres para probar los endpoints con `curl`, e invirtio 13 reglas a mano para confirmar que algun test se ponia rojo. No pudo construir las imagenes ni correr el workflow: eso se verifica en la corrida de GitHub Actions enlazada arriba.

Como lo verifique yo: `PENDIENTE` (correr las suites en mi maquina, leer cada test y poder decir que verifica cada assert y que caso no cubre, y revisar la corrida en Actions).
