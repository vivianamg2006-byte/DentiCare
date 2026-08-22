import { useEffect, useState } from "react"
import { CalendarClock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { TableLoading } from "@/components/shared/CardsLoading"
import { listarHorariosAtencion } from "@/services/horariosService"
import { formatHora } from "@/lib/format"

// Fija el orden de presentación Lunes → Domingo; el API no garantiza ningún orden
const DIAS_ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

/**
 * Horario semanal GENERAL de la clínica (no por empleado).
 * Agrupa los rangos de atención por día de la semana, ordenados por hora
 * de inicio; los días sin rangos se muestran como "Cerrado". Solo lectura.
 */
export function HorariosPage() {
    const [horarios, setHorarios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Bandera anti-carrera: si el componente se desmonta, ignoramos la respuesta
        let activo = true
        async function cargar() {
            try {
                const data = await listarHorariosAtencion()
                if (activo) setHorarios(Array.isArray(data) ? data : [])
            } catch (e) {
                if (activo) setError(e.message)
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => {
            activo = false
        }
    }, [])

    // horaInicio llega como "HH:mm:ss", así que comparar strings da el orden correcto
    const grupos = DIAS_ORDEN.map((dia) => ({
        dia,
        rangos: horarios
            .filter((h) => h.diaSemana?.nombre === dia)
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    }))

    return (
        <section className="space-y-6">
            <PageHeader
                title="Horario de atención"
                description="Horario general de la clínica DentiCare por día de la semana."
            />

            {cargando && <TableLoading rows={6} />}
            {!cargando && error && <ErrorState message={error} />}
            {!cargando && !error && horarios.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Aún no se ha configurado el horario de atención.
                </p>
            )}

            {!cargando && !error && horarios.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 text-primary" />
                            Semana tipo
                        </CardTitle>
                        <CardDescription>
                            Las citas solo pueden agendarse dentro de estos rangos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {grupos.map((grupo) => (
                            <div
                                key={grupo.dia}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
                            >
                                <span className="w-24 font-semibold">{grupo.dia}</span>
                                <div className="flex flex-wrap gap-2">
                                    {grupo.rangos.length === 0 ? (
                                        <Badge variant="outline" className="text-muted-foreground">
                                            Cerrado
                                        </Badge>
                                    ) : (
                                        grupo.rangos.map((rango) => (
                                            <Badge key={rango.id} variant={rango.activo ? "secondary" : "outline"}>
                                                {formatHora(rango.horaInicio)} – {formatHora(rango.horaFin)}
                                                {!rango.activo && " (inactivo)"}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </section>
    )
}
