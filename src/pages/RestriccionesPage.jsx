import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { TableLoading } from "@/components/shared/CardsLoading"
import { listarRestricciones } from "@/services/restriccionesService"
import { nombreCompleto, formatFechaCorta } from "@/lib/format"

/**
 * Listado de restricciones de disponibilidad (bloqueos de agenda).
 * Mezcla las generales (aplican a toda la clínica, sin empleado asociado)
 * y las de empleados; pueden ser de todo el día o parciales con rango horario.
 * Ordena de la más reciente a la más antigua. Vista de solo lectura.
 */
export function RestriccionesPage() {
    const [restricciones, setRestricciones] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await listarRestricciones()
            setRestricciones(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Fecha ISO (yyyy-mm-dd): el orden lexicográfico coincide con el cronológico
    const ordenadas = useMemo(
        () =>
            [...restricciones].sort((a, b) =>
                String(b.fecha).localeCompare(String(a.fecha))
            ),
        [restricciones]
    )

    return (
        <section className="space-y-6">
            <PageHeader
                title="Restricciones de horario"
                description="Bloqueos de agenda: feriados, capacitaciones, mantenimiento y más."
            />

            {cargando && <TableLoading rows={6} />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && ordenadas.length === 0 && (
                <EmptyState
                    title="Sin restricciones"
                    description="No hay restricciones de horario registradas."
                />
            )}

            {!cargando && !error && ordenadas.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        <ShieldAlert className="h-4 w-4" />
                        Seleccione una restricción para ver su detalle completo.
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Aplica a</TableHead>
                                <TableHead>Rango</TableHead>
                                <TableHead className="hidden md:table-cell">Motivo</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ordenadas.map((restriccion) => (
                                <TableRow key={restriccion.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <Link to={`/restricciones/${restriccion.id}`} className="hover:text-primary hover:underline">
                                            {formatFechaCorta(String(restriccion.fecha).slice(0, 10))}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{restriccion.tipoRestriccion?.nombre ?? "—"}</TableCell>
                                    <TableCell>
                                        {/* Sin empleado => restricción general, aplica a toda la clínica */}
                                        {restriccion.empleado
                                            ? nombreCompleto(restriccion.empleado.usuario)
                                            : "Toda la clínica"}
                                    </TableCell>
                                    <TableCell>
                                        {restriccion.todoElDia
                                            ? "Todo el día"
                                            : `${restriccion.horaInicio} – ${restriccion.horaFin}`}
                                    </TableCell>
                                    <TableCell className="hidden max-w-xs truncate md:table-cell">
                                        {restriccion.motivo}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={restriccion.activo ? "secondary" : "outline"}>
                                            {restriccion.activo ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </section>
    )
}
