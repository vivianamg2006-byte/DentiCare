import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import PropTypes from "prop-types"

/**
 * Estado de error para fallos al cargar datos del API (alerta destructiva).
 * Si se pasa `onRetry`, muestra el botón "Reintentar" que normalmente
 * vuelve a disparar la consulta fallida.
 */
export function ErrorState({ message = "Ocurrió un error al cargar los datos.", onRetry }) {
    return (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                <span>{message}</span>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-md border border-current px-3 py-1 text-sm font-medium hover:bg-destructive hover:text-white"
                    >
                        Reintentar
                    </button>
                )}
            </AlertDescription>
        </Alert>
    )
}

ErrorState.propTypes = {
    message: PropTypes.string,
    onRetry: PropTypes.func,
}
