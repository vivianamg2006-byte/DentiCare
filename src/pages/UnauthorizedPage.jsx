import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

/**
 * Página de acceso no autorizado (403).
 *
 * Se muestra cuando un usuario autenticado intenta entrar a una ruta
 * cuyo rol no le corresponde (ver RoleRoute). Ofrece volver al inicio.
 *
 * @component
 */
export function UnauthorizedPage() {
    return (
        <section className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Acceso no autorizado
            </h1>
            <p className="text-muted-foreground">
                No posee los permisos suficientes para acceder al recurso solicitado.
            </p>
            <Button asChild>
                <Link to="/">Volver al inicio</Link>
            </Button>
        </section>
    )
}
