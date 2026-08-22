import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CalendarX2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { obtenerRestriccion } from "@/services/restriccionesService"
import { nombreCompleto, formatFecha } from "@/lib/format"

/**
 * Detalle de una restricción (:id de la ruta /restricciones/:id).
 * Muestra fecha, tipo, alcance (un empleado o la clínica completa),
 * rango bloqueado y motivo. Vista de solo lectura, sin acciones.
 */
export function RestriccionDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [restriccion, setRestriccion] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerRestriccion(id)
            setRestriccion(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [id])

    useEffect(() => {
        cargar()
    }, [cargar])

    if (cargando) return <div className="h-64 animate-pulse rounded-xl bg-muted" />
    if (error) return <ErrorState message={error} onRetry={cargar} />
    if (!restriccion) return null

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <PageHeader title="Detalle de restricción" />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarX2 className="h-5 w-5 text-primary" />
                        {/* La fecha llega en ISO con hora; recortamos a yyyy-mm-dd */}
                        {formatFecha(String(restriccion.fecha).slice(0, 10))}
                    </CardTitle>
                    <CardDescription>{restriccion.tipoRestriccion?.nombre}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Badge variant={restriccion.activo ? "secondary" : "outline"}>
                        {restriccion.activo ? "Activa" : "Inactiva"}
                    </Badge>

                    <Separator />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Aplica a</p>
                            <p className="text-sm font-medium">
                                {restriccion.empleado
                                    ? `${nombreCompleto(restriccion.empleado.usuario)} (${restriccion.empleado.codigoEmpleado})`
                                    : "Toda la clínica (general)"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Rango bloqueado</p>
                            <p className="text-sm font-medium">
                                {restriccion.todoElDia
                                    ? "Todo el día"
                                    : `${restriccion.horaInicio} – ${restriccion.horaFin}`}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Motivo</p>
                        <p className="text-sm">{restriccion.motivo}</p>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                        <Button asChild variant="outline">
                            <Link to="/restricciones">Volver al listado</Link>
                        </Button>
                        <Button variant="ghost" onClick={() => navigate(-1)}>
                            Regresar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
