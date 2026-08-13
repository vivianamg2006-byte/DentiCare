import PropTypes from "prop-types"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./useAuth"

export function ProtectedRoute({ children }) {
    const { loading, isAuthenticated } = useAuth()
    const location = useLocation()

    if (loading) {
        return <p>Verificando sesión...</p>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
}
