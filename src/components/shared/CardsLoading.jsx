import { Skeleton } from "@/components/ui/skeleton"
import PropTypes from "prop-types"

/**
 * Placeholders de carga (skeletons) reutilizables mientras llegan datos del API.
 * Exporta dos variantes:
 *   - CardsLoading: grilla de tarjetas (listados tipo tratamientos/especialistas).
 *   - TableLoading: filas apiladas (listados en formato tabla).
 * Ambas solo dibujan Skeleton; la cantidad es configurable por props.
 */

/** Estado de carga genérico para listados basados en tarjetas. */
export function CardsLoading({ count = 6 }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    )
}

/** Estado de carga genérico para listados en tabla. */
export function TableLoading({ rows = 5 }) {
    return (
        <div className="space-y-2">
            {/* Filas falsas de altura fija para simular el alto real de la tabla. */}
            {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
            ))}
        </div>
    )
}

CardsLoading.propTypes = {
    count: PropTypes.number,
}

TableLoading.propTypes = {
    rows: PropTypes.number,
}
