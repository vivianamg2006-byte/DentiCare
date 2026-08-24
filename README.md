# DentiCare — Frontend de Gestión de Citas Odontológicas

Sistema de gestión de citas para la clínica dental **DentiCare**. Es el **frontend**
de un API REST ya existente (carpeta `api-citas-main/`, no se modifica). Permite
a pacientes registrarse, consultar y cancelar sus citas; y al personal
(Administrador/Empleado) administrar tratamientos, servicios adicionales,
especialistas, horarios, restricciones y la agenda completa de la clínica.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura general](#arquitectura-general)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Puesta en marcha](#puesta-en-marcha)
5. [Credenciales de prueba](#credenciales-de-prueba)
6. [Autenticación y control de acceso](#autenticación-y-control-de-acceso)
7. [Mapa de rutas y permisos](#mapa-de-rutas-y-permisos)
8. [Módulos y funcionalidad](#módulos-y-funcionalidad)
9. [Capa de servicios (`src/services`)](#capa-de-servicios-srcservices)
10. [Cliente HTTP (`src/lib/http.js`)](#cliente-http-srclibhttpjs)
11. [Utilidades de formato (`src/lib/format.js`)](#utilidades-de-formato-srclibformatjs)
12. [Validaciones (`src/schemas`)](#validaciones-srcschemas)
13. [Componentes reutilizables](#componentes-reutilizables)
14. [Scripts auxiliares](#scripts-auxiliares)
15. [Variables de entorno](#variables-de-entorno)

---

## Stack tecnológico

| Tecnología | Uso |
| --- | --- |
| React 19 + Vite | SPA con compilador de React activado (`reactCompilerPreset`) |
| React Router DOM v7 | Rutas, guardias de sesión y de rol |
| Tailwind CSS v4 + shadcn/ui | Estilos y componentes base (estilo *radix-nova*) |
| react-hook-form + zod | Formularios con validación alineada a los DTOs del API |
| react-hot-toast | Notificaciones globales (esquina inferior derecha) |
| lucide-react | Iconografía |
| radix-ui / cmdk / react-day-picker | Primitivas de diálogos, selects múltiples y calendario |
| Capa propia `src/services` + `src/lib/http.js` | Consumo tipado y centralizado del API |

## Arquitectura general

El frontend sigue una arquitectura en capas donde las páginas **nunca** llaman
a `fetch` directamente:

```
┌─────────────────────────────────────────────────────────┐
│ pages/  (pantallas por módulo)                          │
│   usan → components/ (ui, shared, citas)                │
│   validan con → schemas/ (zod)                          │
│   consumen → services/*Service.js                       │
│                 ↓                                        │
│              lib/http.js  (fetch + token Bearer +       │
│              desenvuelve { success, message, data })    │
│                 ↓                                        │
│              API REST (Express + Prisma + MySQL)        │
└─────────────────────────────────────────────────────────┘
```

- **Estado global**: solo la sesión (React Context en `src/auth`). El resto del
  estado es local a cada página (cargas, errores, formularios).
- **Errores del API**: se lanzan como `ApiError` con mensaje listo para mostrar;
  las páginas los presentan con `toast.error(...)` o estados de error visuales.
- **Formatos**: las fechas viajan como `"YYYY-MM-DD"` y las horas como `"HH:mm"`.
  El parseo es manual (sin `new Date(string)`) para evitar desfases de zona horaria.

## Estructura del proyecto

```
app/
├── index.html                  Punto de entrada HTML
├── vite.config.js              Vite + React + Babel(compiler) + Tailwind; alias "@"
├── eslint.config.js            Reglas ESLint del proyecto
├── components.json             Configuración de shadcn/ui
├── .env                        Variables VITE_API_URL y VITE_IMAGE_URL
├── public/                     Archivos estáticos
├── scripts/
│   └── seed-clinica.mjs        Datos iniciales vía API REST (idempotente)
├── api-citas-main/api/         Backend Express + Prisma + MySQL (NO se modifica)
└── src/
    ├── main.jsx                Punto de entrada: mapa completo de rutas y guardias
    ├── App.jsx                 Layout raíz: Navbar + <Outlet/> + Footer + Toaster
    ├── index.css               Tema Tailwind v4 y tokens de shadcn/ui
    ├── auth/
    │   ├── AuthContext.js      Contexto con la forma del valor de sesión
    │   ├── AuthProvider.jsx    Ciclo de vida de la sesión (login/logout/restore)
    │   ├── useAuth.js          Hook para consumir la sesión
    │   ├── ProtectedRoute.jsx  Exige sesión iniciada
    │   └── RoleRoute.jsx       Restringe por rol (anidado en ProtectedRoute)
    ├── lib/
    │   ├── http.js             request(), ApiError, token en localStorage
    │   ├── format.js           Moneda CRC, fechas/horas sin desfase TZ, rangos
    │   └── utils.js            Helper cn() de shadcn (clsx + tailwind-merge)
    ├── schemas/                Esquemas zod de cada formulario
    ├── services/               Un archivo por recurso del API (13 servicios)
    ├── components/
    │   ├── ui/                 Componentes shadcn/ui (button, card, dialog…)
    │   ├── shared/             Estados y piezas transversales
    │   │   ├── ConfirmDialog.jsx     Confirmación genérica (con variante destructiva)
    │   │   ├── EmptyState.jsx        Mensaje de "sin datos"
    │   │   ├── ErrorState.jsx        Mensaje de error de carga
    │   │   ├── CardsLoading.jsx      Skeletons de tarjetas mientras carga
    │   │   ├── EstadoBadge.jsx       Badge coloreado según estado de cita
    │   │   ├── ImageUpload.jsx       Subida/reemplazo de imagen (multipart)
    │   │   └── MultiServiciosSelect.jsx  Selección múltiple de tratamientos
    │   ├── citas/
    │   │   ├── SlotGrid.jsx            Cuadrícula de bloques disponibles/ocupados/restringidos
    │   │   ├── CancelarCitaDialog.jsx  Diálogo de cancelación con motivo obligatorio
    │   │   └── CambiarEstadoDialog.jsx Diálogo de cambio de estado de cita
    │   ├── FormError.jsx       Mensaje de error bajo campos de formulario
    │   ├── Navbar.jsx          Barra superior (menú cambia según rol/sesión)
    │   ├── Footer.jsx          Pie de página
    │   └── PageHeader.jsx      Encabezado estándar de páginas
    └── pages/                  Pantallas organizadas por módulo (ver sección Módulos)
```

## Puesta en marcha

### 1. Backend y base de datos

```bash
cd app/api-citas-main/api
npm install
# Verifique MySQL local y la base "citas" (DATABASE_URL en .env del backend)
npm run init      # primera vez: prisma migrate dev + generate + seed + nodemon
# Ejecuciones posteriores:
npm run server
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

### 2. Datos iniciales

El seeder base del backend (`prisma/seed.ts`, se ejecuta con `npm run init`)
crea roles, estados de cita, días de la semana, tipos de restricción, el
administrador, 5 especialidades extra, 3 empleados especialistas y 2 pacientes.

Con el backend **en ejecución**, el script del frontend completa el catálogo:

```bash
cd app
node scripts/seed-clinica.mjs
```

Es idempotente y crea en orden: login admin → 2 pacientes → 12 tratamientos →
8 servicios adicionales → 3 fichas de especialista (DR-001, DR-002, HIG-001)
→ horarios (L–V 08:00–17:00, S 08:00–12:00) → restricciones (2 generales,
3 de empleado, 2 parciales 12:00–13:00, 1 de día completo) → 13 citas
(4 pendientes, 4 confirmadas, 3 finalizadas, 2 canceladas).

> **Diagnóstico rápido**: si la pantalla de inicio o `/horarios` muestran
> "El horario aún no ha sido configurado", si `/citas/nueva` no lista
> tratamientos/especialistas o si `SlotGrid` dice "La clínica no atiende…",
> la causa es que **la base de datos está sin sembrar** (le pasa a todos los
> roles, no solo a Cliente): ejecute `npx prisma db seed` dentro de
> `api-citas-main/api` y luego `node scripts/seed-clinica.mjs` con el
> backend corriendo. El script de clínica omite con un aviso las
> restricciones que se traslapan con datos de ejecuciones anteriores.

### 3. Frontend

```bash
cd app
npm install
npm run dev       # desarrollo
npm run build     # producción (salida en dist/)
npm run preview   # sirve el build
npm run lint      # ESLint
```

## Credenciales de prueba

| Rol           | Correo                      | Contraseña |
| ------------- | --------------------------- | ---------- |
| Administrador | admin@citas.com             | Admin12345 |
| Empleado      | carlos.mora@dentcare.com    | Odonto123  |
| Empleado      | fernanda.solis@dentcare.com | Odonto123  |
| Empleado      | sofia.herrera@dentcare.com  | Odonto123  |
| Cliente       | maria.lopez@example.com     | Cliente123 |
| Cliente       | ana.rojas@example.com       | Cliente123 |

---

## Autenticación y control de acceso

### `AuthProvider` (`src/auth/AuthProvider.jsx`)

Orquesta toda la sesión:

- **Login** (`POST /usuarios/login`) → guarda el JWT en `localStorage`
  (clave `token`) **antes** de pedir el perfil, porque `http.js` arma el header
  `Authorization` leyendo de localStorage.
- **Perfil** (`GET /usuarios/perfil`) → trae `rol.nombre` y `empleado.id|null`,
  claves para la matriz de permisos y la agenda propia.
- **Restauración**: al montar, si hay token guardado pide el perfil; si falla,
  limpia la sesión (token vencido).
- **Logout**: elimina el token y el estado en memoria.
- Expone: `user`, `token`, `loading`, `isAuthenticated`, `rol`, `empleadoId`,
  `login`, `logout`, `registerUser`, `hasRole(roles)`.

### Guardias de ruta

- `<ProtectedRoute>`: exige sesión; mientras restaura muestra
  "Verificando sesión…" y redirige a `/login` guardando `state.from`
  para volver a la página solicitada tras el login.
- `<RoleRoute allowedRoles={[...]}>`: valida el rol con `hasRole()`;
  si no coincide redirige a `/unauthorized`. Debe ir anidado dentro
  de `ProtectedRoute`.

> La protección es **solo de frontend** (el API no protege endpoints):
> sirve como UX/permisos visuales, no como seguridad real del backend.

## Mapa de rutas y permisos

Roles: `Administrador`, `Empleado` (staff) y `Cliente` (paciente).

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/` | HomePage | Público |
| `/login` | LoginPage | Público |
| `/registro` | RegisterPage | Público |
| `/unauthorized` | UnauthorizedPage | Público |
| `/tratamientos`, `/tratamientos/:id` | Listado y detalle | Público |
| `/tratamientos/nuevo` | TratamientoFormPage (crear) | Administrador |
| `/tratamientos/:id/editar` | TratamientoFormPage (editar) | Administrador |
| `/adicionales`, `/adicionales/:id` | Listado y detalle | Público |
| `/adicionales/nuevo` · `/:id/editar` | AdicionalFormPage | Administrador |
| `/horarios` | HorariosPage (solo lectura) | Público |
| `/perfil` | ProfilePage | Autenticado |
| `/citas` | CitasPage (filtrado por rol) | Autenticado |
| `/citas/:id` | CitaDetailPage | Autenticado |
| `/citas/nueva` | CitaFormPage (crear) | Staff |
| `/citas/:id/editar` | CitaFormPage (editar) | Staff |
| `/especialistas`, `/especialistas/:id` | Fichas de especialistas | Staff |
| `/especialistas/nuevo` · `/:id/editar` | EspecialistaFormPage | Administrador |
| `/restricciones`, `/restricciones/:id` | Bloqueos de horario | Staff |
| `/agenda/:id` | AgendaEmpleadoPage | Staff (Empleado solo la propia) |
| `/agenda-diaria` | AgendaDiariaPage | Administrador |
| `*` | NotFoundPage | — |

## Módulos y funcionalidad

### Autenticación (`LoginPage`, `RegisterPage`)

- **Login**: correo + contraseña validados con `loginSchema`; al entrar
  redirige a la página original (`state.from`, si llegó desde una ruta
  protegida) o, por defecto, siempre a la **pantalla de inicio** `/`.
  Si ya hay sesión, `/login` redirige también a `/`. Enlace a registro.
- **Registro de pacientes**: crea cuentas rol Cliente (`POST /usuarios/registro`)
  y **no** inicia sesión automáticamente; redirige a `/login`. Campos:
  nombre, primer apellido, segundo apellido (opcional), teléfono (opcional),
  correo, contraseña y confirmar contraseña. Diseño responsivo:
  - Datos personales en dos columnas simétricas (`sm:grid-cols-2`), apiladas
    en móvil.
  - Correo a lo ancho completo.
  - Las contraseñas van en un bloque propio con **estructura idéntica en ambas
    celdas** (etiqueta + input + error), de modo que siempre quedan perfectamente
    alineadas; los requisitos de la contraseña son una nota compartida debajo
    del par, así ningún campo queda más alto que el otro.

### Catálogo público (`Tratamientos*`, `Adicionales*`, `HorariosPage`)

- Listados con tarjetas (imagen, precio en colones, duración) y skeletons
  de carga; detalle con toda la ficha.
- ABM de tratamientos y adicionales **solo Administrador**: formulario con
  imagen (sube a `/images/upload`, envía `previousFileName` al reemplazar),
  precio, duración, especialidad y estado activo/inactivo (PATCH `/estado`).

### Especialistas (`Especialistas*`)

- Fichas de empleado con código (DR-001…), especialidad, tratamientos
  asignados (selección múltiple) y horario de atención.
- Consulta para staff; creación/edición/activar-desactivar solo Administrador.

### Citas (`CitasPage`, `CitaFormPage`, `CitaDetailPage`)

- **Listado filtrado por rol**: Administrador ve todas, Empleado las suyas,
  Cliente las propias (`/citas/cliente/:id`). Estados visibles con badges.
- **Formulario de citas (flujo principal)**:
  1. Selección de paciente (Administrador/Empleado).
  2. Tratamiento activo → precio base y duración automáticos; si cambia el
     tratamiento se limpia la hora elegida (la duración de los bloques depende de él).
  3. Adicionales activos → recálculo dinámico del costo total (sin cambiar duración).
  4. Especialistas filtrados por tratamiento (`/empleados/activos?servicioId=`),
     con aviso explícito si no hay especialistas activos para ese tratamiento.
  5. Fecha → agenda del especialista con bloques disponibles/ocupados/restringidos/
     pasados (`SlotGrid`, que valida con `rangosSeTraslapan` que toda la duración
     quepa sin choques); hora fin calculada = hora inicio + duración.
  6. Antes de guardar: `POST /citas/disponibilidad`; si falla se muestra el
     motivo exacto del API, se bloquea el envío y **se refresca la grilla** con
     el estado real del día.
  7. Duración y costos se envían ya calculados desde el frontend; al guardar,
     se navega al **detalle de la cita** (`/citas/:id`) como confirmación.
- **Detalle y ciclo de vida**: cambio de estado (pendiente → confirmada →
  finalizada) y cancelación con motivo obligatorio; el Cliente solo puede
  cancelar sus citas pendientes/confirmadas.

### Agendas (`AgendaEmpleadoPage`, `AgendaDiariaPage`)

- **Agenda por especialista** (`/agenda/:id`): citas del día seleccionado;
  un Empleado solo accede a la propia (usa su `empleadoId`).
- **Agenda diaria** (`/agenda-diaria`): cuadrante especialistas × horas de
  toda la clínica para el Administrador, usando `/citas/agenda-diaria?fecha=`.

### Restricciones (`RestriccionesPage`, `RestriccionDetailPage`)

- Listado y detalle de bloqueos de horario (generales, por empleado, parciales
  por franja o día completo). Solo consulta para staff.

### Perfil (`ProfilePage`)

- Consulta de los propios datos y rol; disponible para cualquier usuario autenticado.

---

## Capa de servicios (`src/services`)

Un archivo por recurso; todos usan `request()` de `lib/http.js`.

| Servicio | Funciones → Endpoint |
| --- | --- |
| `authService` | `loginUsuario` → `POST /usuarios/login` · `obtenerPerfil` → `GET /usuarios/perfil` · `registrarCliente` → `POST /usuarios/registro` · `listarUsuarios(rol?)` → `GET /usuarios[?rol=]` · `obtenerUsuario(id)` → `GET /usuarios/:id` |
| `citasService` | `listarCitas` → `GET /citas` · `listarCitasCliente(id)` → `GET /citas/cliente/:id` · `listarCitasEmpleado(id)` → `GET /citas/empleado/:id` · `obtenerAgendaEmpleado(id, fecha)` → `GET /citas/agenda-empleado/:id?fecha=` · `obtenerAgendaDiaria(fecha)` → `GET /citas/agenda-diaria?fecha=` · `consultarDisponibilidad(payload)` → `POST /citas/disponibilidad` · `crearCita` → `POST /citas` · `actualizarCita(id)` → `PUT /citas/:id` · `cancelarCita(id, motivo)` → `PATCH /citas/:id/cancelar` · `cambiarEstadoCita(id, estadoId)` → `PATCH /citas/:id/estado` · `obtenerCita(id)` → `GET /citas/:id` |
| `serviciosService` (tratamientos) | `listarServicios` · `listarServiciosActivos` · `obtenerServicio(id)` · `crearServicio` · `actualizarServicio(id)` · `cambiarEstadoServicio(id, activo)` → `/servicios` (+`/activos`, `/:id`, `/:id/estado`) |
| `adicionalesService` | Mismo patrón sobre `/servicios-adicionales` |
| `empleadosService` | `listarEmpleados` · `listarEmpleadosActivos(servicioId?)` → `/empleados/activos?servicioId=` · `obtenerEmpleado(id)` · `obtenerAgendaEmpleado(id, fecha)` → `/empleados/:id/agenda?fecha=` · `crearEmpleado` · `actualizarEmpleado(id)` · `cambiarEstadoEmpleado(id, activo)` |
| `especialidadesService` | `listarEspecialidades` · `obtenerEspecialidad(id)` → `/especialidades` |
| `horariosService` | `listarHorariosAtencion` · `obtenerHorarioAtencion(id)` → `/horarios-atencion` |
| `restriccionesService` | `listarRestricciones` · `obtenerRestriccion(id)` → `/restricciones-horario` |
| `estadosCitaService` | `listarEstadosCita` · `obtenerEstadoCita(id)` → `/estados-cita` |
| `diasSemanaService` | `listarDiasSemana` · `obtenerDiaSemana(id)` → `/dias-semana` |
| `rolesService` | `listarRoles` · `obtenerRol(id)` → `/roles` |
| `imagesService` | `subirImagen(archivo, previousFileName?)` → `POST /images/upload` (FormData multipart) · `urlImagen(fileName)` construye la URL pública con `VITE_IMAGE_URL` |

## Cliente HTTP (`src/lib/http.js`)

- `request(path, { method, body, authenticated = true, formData = false })`:
  única puerta de entrada al API.
  - Adjunta `Authorization: Bearer <token>` leyendo el token de localStorage.
  - Con `formData: true` no fija `Content-Type` (el navegador genera el
    boundary del multipart).
  - Desenvuelve la envoltura estándar `{ success, message, data }` → devuelve `data`.
  - Falla si el HTTP no es OK **o** si llega `success: false`; lanza `ApiError`
    con el `message` del servidor (o uno amigable ante fallo de red/CORS).
- `getStoredToken()` / `setStoredToken(token)`: persisten o eliminan el JWT
  (guardar `null` equivale a logout).

## Utilidades de formato (`src/lib/format.js`)

Funciones puras compartidas:

- `formatCurrency(v)`: moneda costarricense (CRC, locale `es-CR`).
- `formatFecha("YYYY-MM-DD")` → "dd de mes de yyyy"; `formatFechaCorta` → "DD/MM/YYYY".
  Parseo manual para evitar el desfase UTC de `new Date("YYYY-MM-DD")`.
- `formatHora(h)`, `formatDuracion(min)` ("45 min", "1 h 30 min").
- `nombreCompleto(persona)`, `iniciales(persona)` (para avatares).
- `horaAMinutos` / `minutosAHora` / `sumarMinutos`: aritmética de horarios.
- `hoyISO()`, `agregarDias(fecha, n)`, `numeroDiaSemana(fecha)` (ISO, lunes=1),
  `rangosSeTraslapan(a1, a2, b1, b2)`: detección de cruces de bloques.

## Validaciones (`src/schemas`)

Esquemas zod cuyos límites replican los DTOs del API:

| Esquema | Formulario | Reglas destacadas |
| --- | --- | --- |
| `registroSchema.js` | Registro de pacientes | Nombre/apellido 2–100 caracteres; segundo apellido y teléfono opcionales (teléfono solo dígitos y `+ - ( ) espacio`); correo válido ≤150; **contraseña mín. 8 con mayúscula, minúscula y número**; `confirmPassword` debe coincidir (error anclado a ese campo). `aPayloadRegistro(data)` descarta `confirmPassword` y conviene vacíos opcionales a `null`. |
| `loginSchema.js` | Login | Correo y contraseña obligatorios. |
| `citaSchema.js` | Crear/editar cita | Paciente, tratamiento, especialista, fecha, hora; coherencia hora inicio/fin. |
| `empleadoSchema.js` | Ficha de especialista | Datos personales + código + especialidad + tratamientos. |
| `catalogoSchema.js` | Tratamientos y adicionales | Nombre, descripción, precio y duración positivos. |
| `registerSchema.js` | — | Versión antigua/genérica del esquema de registro; actualmente **sin uso** (las páginas usan `registroSchema`). |

## Componentes reutilizables

- **UI base** (`components/ui/`): button, input, label, card, dialog,
  alert-dialog, select, checkbox, switch, radio-group, tabs, table, calendar,
  popover, command, dropdown-menu, textarea, badge, avatar, alert, skeleton,
  separator, tooltip, input-group (shadcn/ui).
- **Compartidos** (`components/shared/`): `ConfirmDialog`, `EmptyState`,
  `ErrorState`, `CardsLoading` (skeletons), `EstadoBadge`, `ImageUpload`
  (multipart + reemplazo), `MultiServiciosSelect` (cmdk con búsqueda).
- **De citas** (`components/citas/`): `SlotGrid` (bloques libres/ocupados/
  restringidos), `CancelarCitaDialog` (motivo obligatorio),
  `CambiarEstadoDialog`.
- **Transversales**: `FormError` (mensaje rojo bajo el campo; no renderiza
  nada si no hay error), `Navbar` (menú dinámico según sesión y rol),
  `Footer`, `PageHeader`.

## Scripts auxiliares

- `scripts/seed-clinica.mjs`: pobla la clínica vía API REST (ver
  [Puesta en marcha](#puesta-en-marcha)). Idempotente: verifica existencia
  antes de crear y valida disponibilidad antes de insertar cada cita.

## Variables de entorno

Archivo `.env` en la raíz del frontend (consumidas con `import.meta.env`):

```
VITE_API_URL=http://localhost:3000        # Base del API
VITE_IMAGE_URL=http://localhost:3000/images  # Base pública de imágenes subidas
```
