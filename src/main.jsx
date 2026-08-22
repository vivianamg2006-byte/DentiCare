/**
 * Punto de entrada de DentiCare.
 *
 * Aquí vive el mapa completo de rutas. Estrategia de protección:
 *   <ProtectedRoute> exige sesión; anidado va <RoleRoute allowedRoles={[...]}>
 *   que restringe por rol. La protección es solo de frontend
 *   (el API no protege endpoints), así que esto es UX/permisos visuales.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RoleRoute } from './auth/RoleRoute'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { NotFoundPage } from './pages/NotFoundPage'

import { TratamientosPage } from './pages/TratamientosPage'
import { TratamientoDetailPage } from './pages/TratamientoDetailPage'
import { TratamientoFormPage } from './pages/TratamientoFormPage'

import { AdicionalesPage } from './pages/AdicionalesPage'
import { AdicionalDetailPage } from './pages/AdicionalDetailPage'
import { AdicionalFormPage } from './pages/AdicionalFormPage'

import { EspecialistasPage } from './pages/EspecialistasPage'
import { EspecialistaDetailPage } from './pages/EspecialistaDetailPage'
import { EspecialistaFormPage } from './pages/EspecialistaFormPage'

import { HorariosPage } from './pages/HorariosPage'
import { RestriccionesPage } from './pages/RestriccionesPage'
import { RestriccionDetailPage } from './pages/RestriccionDetailPage'

import { CitasPage } from './pages/CitasPage'
import { CitaDetailPage } from './pages/CitaDetailPage'
import { CitaFormPage } from './pages/CitaFormPage'
import { AgendaEmpleadoPage } from './pages/AgendaEmpleadoPage'
import { AgendaDiariaPage } from './pages/AgendaDiariaPage'

// Roles "de staff": Administrador y Empleado comparten varios módulos
// (citas, especialistas, restricciones, agenda). El Cliente es el rol restante.
const ROLES_STAFF = ["Administrador", "Empleado"]

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Contexto de sesión disponible para todas las rutas y componentes. */}
      <AuthProvider>
        <Routes>
          <Route element={<App />}>
            {/* Acceso público */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Catálogo público */}
            <Route path="/tratamientos" element={<TratamientosPage />} />
            <Route path="/tratamientos/:id" element={<TratamientoDetailPage />} />
            <Route path="/adicionales" element={<AdicionalesPage />} />
            <Route path="/adicionales/:id" element={<AdicionalDetailPage />} />
            <Route path="/horarios" element={<HorariosPage />} />

            {/* Gestión de tratamientos: solo Administrador */}
            {/* Patrón repetido en rutas privadas: ProtectedRoute (sesión)
                + RoleRoute (rol) + la página con su modo (crear/editar). */}
            <Route
              path="/tratamientos/nuevo"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <TratamientoFormPage modo="crear" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tratamientos/:id/editar"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <TratamientoFormPage modo="editar" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/adicionales/nuevo"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <AdicionalFormPage modo="crear" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/adicionales/:id/editar"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <AdicionalFormPage modo="editar" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Autenticados (cualquier rol) */}
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas"
              element={
                <ProtectedRoute>
                  <CitasPage />
                </ProtectedRoute>
              }
            />
            {/* OJO: /citas/nueva está declarada MÁS ADELANTE que /citas/:id.
                Funciona porque React Router v6 prioriza segmentos estáticos
                sobre dinámicos (ranking), pero por claridad conviene
                declarar la ruta específica primero. */}
            <Route
              path="/citas/:id"
              element={
                <ProtectedRoute>
                  <CitaDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Citas: creación y edición solo Administrador y Empleado */}
            {/* Ruta estática: debe ganarle a /citas/:id (ver nota arriba). */}
            <Route
              path="/citas/nueva"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <CitaFormPage modo="crear" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/citas/:id/editar"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <CitaFormPage modo="editar" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Especialistas: consulta para staff, gestión solo Administrador */}
            <Route
              path="/especialistas"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <EspecialistasPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/especialistas/:id"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <EspecialistaDetailPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/especialistas/nuevo"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <EspecialistaFormPage modo="crear" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/especialistas/:id/editar"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <EspecialistaFormPage modo="editar" />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Restricciones: solo staff */}
            <Route
              path="/restricciones"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <RestriccionesPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/restricciones/:id"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <RestriccionDetailPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Agendas */}
            <Route
              path="/agenda/:id"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={ROLES_STAFF}>
                    <AgendaEmpleadoPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda-diaria"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["Administrador"]}>
                    <AgendaDiariaPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
