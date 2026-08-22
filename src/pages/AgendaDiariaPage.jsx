import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Building2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { obtenerAgendaDiaria } from "@/services/citasService"
import { hoyISO, horaAMinutos, minutosAHora, nombreCompleto } from "@/lib/format"

const PASO = 30

function abreviar(nombre) {
    const partes = nombreCompleto(nombre).split(" ")
    return partes.length > 2 ? `${partes[0]} ${partes[1]}` : nombreCompleto(nombre)
}

/**
 * Agenda diaria de toda la clínica (solo Administrador):
 * tabla de especialista × hora con las citas y restricciones
 * del día seleccionado.
 */
export function AgendaDiariaPage() {
    const [fecha, setFecha] = useState(hoyISO())
    const [agenda, setAgenda] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerAgendaDiaria(fecha)
            setAgenda(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [fecha])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Rango horario del día: unión de todos los rangos de atención
    const rangoDia = useMemo(() => {
        if (!agenda?.horarios?.length) return null
        const inicios = agenda.horarios.map((h) => horaAMinutos(h.horaInicio))
        const fines = agenda.horarios.map((h) => horaAMinutos(h.horaFin))
        return { desde: Math.min(...inicios), hasta: Math.max(...fines) }
    }, [agenda])

    const horas = useMemo(() => {
        if (!rangoDia) return []
        const lista = []
        for (let m = rangoDia.desde; m < rangoDia.hasta; m += PASO) {
            lista.push(minutosAHora(m))
        }
        return lista
    }, [rangoDia])

    function restriccionDeEmpleado(empleado, hora) {
        const inicioSlot = horaAMinutos(hora)
        const finSlot = inicioSlot + PASO
        return (empleado.restricciones ?? []).some((r) => {
            if (r.todoElDia) return true
            const ini = horaAMinutos(r.horaInicio)
            const fin = horaAMinutos(r.horaFin)
            return ini < finSlot && inicioSlot < fin
        })
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PageHeader
                    title="Agenda diaria de la clínica"
                    description="Vista consolidada de todas las citas del día por especialista."
                />
                <div className="grid gap-1">
                    <Label htmlFor="diaria-fecha">Fecha</Label>
                    <Input
                        id="diaria-fecha"
                        type="date"
                        className="w-44"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
            </div>

            {/* Restricciones generales */}
            {(agenda?.restriccionesGenerales?.length ?? 0) > 0 && (
                <Card className="border-orange-500/40">
                    <CardContent className="space-y-1 p-4 text-sm">
                        <p className="font-semibold">Restricciones generales del establecimiento:</p>
                        {agenda.restriccionesGenerales.map((restriccion) => (
                            <p key={restriccion.id} className="text-muted-foreground">
                                ⛔ {restriccion.motivo} —{" "}
                                {restriccion.todoElDia ? "todo el día" : `${restriccion.horaInicio} – ${restriccion.horaFin}`}
                            </p>
                        ))}
                    </CardContent>
                </Card>
            )}

            {cargando && <div className="h-96 animate-pulse rounded-xl bg-muted" />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && agenda && (
                <>
                    {(agenda.empleados?.length ?? 0) === 0 ? (
                        <EmptyState
                            title="Sin especialistas activos"
                            description="No hay especialistas activos para mostrar en la agenda."
                        />
                    ) : !rangoDia ? (
                        <EmptyState
                            title="La clínica no atiende esta fecha"
                            description="No hay horario de atención configurado para el día seleccionado."
                        />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Cuadrante del día
                                </CardTitle>
                                <CardDescription>
                                    Bloques de 30 minutos. Pase el cursor sobre una cita para ver los detalles.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto px-0 pb-0">
                                <TooltipProvider delayDuration={100}>
                                    <table className="w-full min-w-[720px] border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/40">
                                                <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-semibold">
                                                    Hora
                                                </th>
                                                {agenda.empleados.map((empleado) => (
                                                    <th key={empleado.id} className="px-3 py-2 text-left font-semibold">
                                                        <Link to={`/especialistas/${empleado.id}`} className="hover:text-primary hover:underline">
                                                            {abreviar(empleado.usuario)}
                                                        </Link>
                                                        <span className="block text-xs font-normal text-muted-foreground">
                                                            {empleado.especialidad?.nombre}
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {horas.map((hora) => {
                                                const inicioSlot = horaAMinutos(hora)
                                                const finSlot = inicioSlot + PASO
                                                return (
                                                <tr key={hora} className="border-b border-border/60">
                                                    <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
                                                        {hora}
                                                    </td>
                                                    {agenda.empleados.map((empleado) => {
                                                        const cita = empleado.citas.find((c) => {
                                                            const ini = horaAMinutos(c.horaInicio)
                                                            const fin = horaAMinutos(c.horaFin)
                                                            return ini < finSlot && inicioSlot < fin
                                                        })
                                                        if (cita) {
                                                            const esInicio = cita.horaInicio === hora
                                                            const coloresEstado = {
                                                                amarillo: "bg-yellow-500/20 border-yellow-500/50",
                                                                azul: "bg-blue-500/20 border-blue-500/50",
                                                                morado: "bg-purple-500/20 border-purple-500/50",
                                                                verde: "bg-green-500/20 border-green-500/50",
                                                                rojo: "bg-red-500/20 border-red-500/50",
                                                            }
                                                            return (
                                                                <td
                                                                    key={`${empleado.id}-${hora}`}
                                                                    className="px-1 py-1 align-top"
                                                                >
                                                                    {esInicio ? (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Link
                                                                                    to={`/citas/${cita.id}`}
                                                                                    className={`block rounded-md border p-1.5 text-xs leading-tight hover:brightness-95 ${coloresEstado[cita.estadoCita?.color] ?? "bg-muted border-border"}`}
                                                                                >
                                                                                    <span className="block truncate font-semibold">
                                                                                        {abreviar(cita.cliente)}
                                                                                    </span>
                                                                                    <span className="block truncate text-[11px] opacity-80">
                                                                                        {cita.servicio?.nombre}
                                                                                    </span>
                                                                                </Link>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" className="max-w-xs">
                                                                                <p className="font-semibold">{nombreCompleto(cita.cliente)}</p>
                                                                                <p>{cita.servicio?.nombre}</p>
                                                                                <p>
                                                                                    {cita.horaInicio} – {cita.horaFin} · {cita.estadoCita?.nombre}
                                                                                </p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    ) : (
                                                                        <div className="rounded-md border border-dashed border-border/70 p-1 text-center text-[11px] text-muted-foreground">
                                                                            ↳
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )
                                                        }
                                                        if (restriccionDeEmpleado(empleado, hora)) {
                                                            return (
                                                                <td key={`${empleado.id}-${hora}`} className="px-1 py-1">
                                                                    <div className="rounded-md border border-orange-500/40 bg-orange-500/10 p-1.5 text-center text-[11px] text-orange-700 dark:text-orange-400">
                                                                        Restringido
                                                                    </div>
                                                                </td>
                                                            )
                                                        }
                                                        return (
                                                            <td key={`${empleado.id}-${hora}`} className="px-1 py-1">
                                                                <div className="h-full min-h-[34px] rounded-md border border-dashed border-border/70" />
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </TooltipProvider>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </section>
    )
}
