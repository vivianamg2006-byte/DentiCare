import { Link } from "react-router-dom"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Página 404: ruta inexistente en el sistema.
 *
 * Captura cualquier dirección que no coincida con las rutas definidas
 * en el router y ofrece regresar al inicio.
 *
 * @component
 */
export function NotFoundPage() {
    return (
        <section className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Página no encontrada</h1>
            <p className="text-muted-foreground">
                La dirección solicitada no existe en el sistema de DentiCare.
            </p>
            <Button asChild>
                <Link to="/">Volver al inicio</Link>
            </Button>
        </section>
    )
}
