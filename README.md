# DentiCare — Frontend de Gestión de Citas Odontológicas

Sistema de gestión de citas para la clínica dental **DentiCare**, construido
como **FrontEnd** sobre un API REST ya existente (no modificada).

## Stack tecnológico

- React 19 + Vite
- React Router DOM v7 (rutas protegidas por rol)
- Tailwind CSS v4 + shadcn/ui (estilo radix-nova)
- react-hook-form + zod (validaciones con los mismos límites de los DTOs del API)
- react-hot-toast (notificaciones)
- Capa de servicios propia (`src/services/`) y cliente HTTP genérico (`src/lib/http.js`)

## Estructura del proyecto

```
app/
├── src/
│   ├── auth/            Contexto de autenticación y rutas protegidas por rol
│   ├── components/
│   │   ├── ui/          Componentes shadcn/ui
│   │   ├── citas/       Diálogos (cancelar/cambiar estado) y cuadrícula de horarios
│   │   └── shared/      Estados de carga/error/vacío, badges, confirmaciones
│   ├── lib/             http.js (fetch + token + errores), format.js (moneda, fechas, horas)
│   ├── pages/           Pantallas organizadas por módulo
│   ├── schemas/         Esquemas zod
│   └── services/        Consumo del API por recurso (sin fetch directo en páginas)
├── scripts/
│   └── seed-clinica.mjs Script de datos iniciales vía API REST
└── api-citas-main/api/  Backend Express + Prisma + MySQL (NO se modifica)
```

## Puesta en marcha

### 1. Backend y base de datos

```bash
cd app/api-citas-main/api
npm install
# Verifique MySQL local y la base "citas" (DATABASE_URL en .env)
npm run init      # primera vez: prisma migrate dev + generate + seed + nodemon
# Ejecuciones posteriores:
npm run server
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

### 2. Extensión del seed base (`api-citas-main/api/prisma/seed.ts`)

El seeder base crea roles, estados de cita, días de la semana, tipos de
restricción y el administrador. Se le agregó inserción directa (única vía
posible: esas entidades no tienen endpoint POST) para crear:

- 5 especialidades odontológicas adicionales: Ortodoncia, Endodoncia,
  Odontopediatría, Cirugía Oral y Maxilofacial, Estética Dental.
- 3 usuarios con rol **Empleado** (especialistas): ver tabla de credenciales.
- 2 pacientes iniciales.

Se ejecuta automáticamente con `npm run init`, o manualmente:

```bash
cd app/api-citas-main/api
npx prisma db seed
```

### 3. Datos iniciales vía API (`scripts/seed-clinica.mjs`)

Con el backend **en ejecución**:

```bash
cd app
node scripts/seed-clinica.mjs
```

El script es idempotente y ejecuta, en orden:

1. Login del administrador.
2. Registro de los 2 pacientes (si no existen).
3. Creación de 12 tratamientos distribuidos por especialidad.
4. Creación de 8 servicios adicionales.
5. Creación de 3 fichas de especialista (`DR-001`, `DR-002`, `HIG-001`),
   cada una con mínimo 3 tratamientos asignados.
6. Horarios de atención: lunes a viernes 08:00–17:00, sábado 08:00–12:00.
7. Restricciones de horario: 2 generales del establecimiento,
   3 específicas de empleado, 2 parciales por horas (12:00–13:00)
   y 1 de día completo (mantenimiento del equipo de rayos X).
8. 13 citas validando disponibilidad antes de crear cada una:
   4 pendientes, 4 confirmadas, 3 finalizadas (cambio de estado)
   y 2 canceladas (con motivo).

Las imágenes de tratamientos quedan con `imagen: null`; pueden subirse desde la
pantalla de administración (el formulario sube primero a `/images/upload`,
envía `previousFileName` al reemplazar, y guarda el `fileName` recibido).

### 4. Frontend

```bash
cd app
npm install
npm run dev
```

El `.env` ya está configurado:

```
VITE_API_URL=http://localhost:3000
VITE_IMAGE_URL=http://localhost:3000/images
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

## Módulos implementados

| Ruta                        | Descripción                                            | Acceso                  |
| --------------------------- | ------------------------------------------------------ | ----------------------- |
| `/`                         | Landing de la clínica                                  | Público                 |
| `/login`, `/registro`       | Inicio de sesión y registro de pacientes               | Público                 |
| `/perfil`                   | Consulta del propio perfil                             | Autenticado             |
| `/tratamientos…`            | Listado/detalle; creación y edición con imagen         | ABM solo Administrador  |
| `/adicionales…`             | Listado/detalle; creación y edición                    | ABM solo Administrador  |
| `/especialistas…`           | Fichas con tratamientos asignados y agenda             | Staff; ABM Administrador|
| `/horarios`                 | Horario general de la clínica (solo lectura)           | Público                 |
| `/restricciones…`           | Listado y detalle de bloqueos                          | Staff                   |
| `/citas`                    | Listado filtrado por rol (todas/asignadas/propias)     | Autenticado             |
| `/citas/nueva`, editar      | Proceso principal con disponibilidad en tiempo real    | Staff                   |
| `/agenda/:id`               | Agenda del especialista                                | Staff (propia si Empleado) |
| `/agenda-diaria`            | Cuadrante especialista × hora de toda la clínica       | Administrador           |

### Flujo del formulario de citas

1. Selección de paciente (Administrador/Empleado).
2. Tratamiento activo → precio base y duración automáticos.
3. Adicionales activos → recálculo dinámico del costo total (sin cambiar duración).
4. Especialistas filtrados por tratamiento (`GET /empleados/activos?servicioId=`).
5. Fecha → agenda del especialista con bloques disponibles/ocupados/restringidos.
6. Hora → `horaFin = horaInicio + duración` calculada automáticamente.
7. Antes de guardar: `POST /citas/disponibilidad`; si no hay disponibilidad se
   muestra el motivo del API y se bloquea el envío.
8. Duración y costos se envían ya calculados desde el FrontEnd.
