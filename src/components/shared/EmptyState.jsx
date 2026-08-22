import { Inbox } from "lucide-react"
import PropTypes from "prop-types"

/**
 * Placeholder amigable cuando un listado no trae resultados
 * (búsqueda sin coincidencias, agenda vacía, etc.).
 * Textos por defecto genéricos; cada página puede sobreescribirlos.
 */
export function EmptyState({ title = "Sin resultados", description = "No hay información para mostrar." }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

EmptyState.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
}
