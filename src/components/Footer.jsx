import { Stethoscope } from "lucide-react"

/**
 * Pie de página con el branding de la clínica y el copyright.
 * El año se calcula en tiempo de render para no quedarse viejo.
 */
export function Footer() {
    const currentYear = new Date().getFullYear()
    return (
        <footer className="border-t border-border bg-card text-card-foreground mt-auto">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 p-6 text-center">
                <div className="flex items-center gap-2 text-primary">
                    <Stethoscope className="h-4 w-4" />
                    <span className="font-semibold">DentiCare</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    © {currentYear} Clínica Dental DentiCare. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}
