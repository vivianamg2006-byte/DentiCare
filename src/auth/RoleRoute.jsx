import PropTypes from "prop-types"
import { Navigate } from "react-router-dom"
import { useAuth } from "./useAuth"

/**
 * Guardián de rutas por ROL: bloquea el acceso directo por URL a módulos
 * que no le corresponden al usuario (ej. un Cliente escribiendo /especialistas).
 *
 * IMPORTANTE: NO valida sesión por sí mismo; asume que va anidado dentro
 * de <ProtectedRoute> (ver main.jsx). Si se usa solo, un visitante sin
 * sesión caería en /unauthorized en vez de /login.
 *
 * `allowedRoles` es la matriz de permisos de la ruta, con nombres de rol
 * tal como los devuelve el API (user.rol.nombre), ej.: ["Administrador", "Empleado"].
 */
export function RoleRoute({ children, allowedRoles }) {
    const { hasRole } = useAuth()

    // Sin el rol permitido → pantalla 403 propia en lugar del contenido.
    if (!hasRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children
}

RoleRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
}
