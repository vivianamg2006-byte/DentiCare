import { Badge } from "@/components/ui/badge"
import PropTypes from "prop-types"

/**
 * Badge de color según el campo `color` del EstadoCita
 * (amarillo, azul, morado, verde, rojo). Muestra el nombre
 * del estado tal cual viene del API.
 */
const COLORES_ESTADO = {
    amarillo: "border-yellow-500/40 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
    azul: "border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-400",
    morado: "border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-400",
    verde: "border-green-500/40 bg-green-500/15 text-green-700 dark:text-green-400",
    rojo: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-400",
}

/**
 * Badge coloreado según el estado de una cita.
 * El color NO se decide en el frontend: viene del campo `estado.color`
 * del API (amarillo/azul/morado/verde/rojo) y aquí solo lo mapeamos
 * a clases de Tailwind. Si el color es desconocido, cae a un estilo neutro.
 */
export function EstadoBadge({ estado }) {
    if (!estado) return <span className="text-muted-foreground">—</span>
    // Fallback neutro para colores que el frontend aún no conoce.
    const claseColor = COLORES_ESTADO[estado.color] ?? "border-border bg-muted text-muted-foreground"
    return (
        <Badge variant="outline" className={claseColor}>
            {estado.nombre}
        </Badge>
    )
}

EstadoBadge.propTypes = {
    estado: PropTypes.shape({
        nombre: PropTypes.string,
        color: PropTypes.string,
    }),
}
