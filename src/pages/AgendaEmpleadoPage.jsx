import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { EstadoBadge } from "@/components/shared/EstadoBadge"
import { useAuth } from "@/auth/useAuth"
import { obtenerAgendaEmpleado as obtenerAgendaAPI } from "@/services/citasService"
import {
    formatCurrency,
    formatFecha,
    hoyISO,
    nombreCompleto,
} from "@/lib/format"

/**
 * Agenda de un especialista para una fecha determinada:
 * horario del día, restricciones y citas programadas.
 * Un empleado solo puede consultar su propia agenda.
 */
export function AgendaEmpleadoPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { rol, empleadoId: empleadoPropio } = useAuth()
    const isAdmin = rol === "Administrador"

    const [fecha, setFecha] = useState(hoyISO())
    const [agenda, setAgenda] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    // Bloqueo por ruta directa: un Empleado solo ve su propia agenda
    useEffect(() => {
        if (rol === "Empleado" && Number(id) !== empleadoPropio) {
            navigate("/unauthorized", { replace: true })
        }
    }, [rol, id, empleadoPropio, navigate])

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerAgendaAPI(id, fecha)
            setAgenda(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [id, fecha])

    useEffect(() => {
        if (rol === "Empleado" && Number(id) !== empleadoPropio) return
        cargar()
    }, [cargar, rol, id, empleadoPropio])

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PageHeader
                    title={`Agenda${agenda?.empleado ? ` de ${nombreCompleto(agenda.empleado.usuario)}` : " del especialista"}`}
                    description={formatFecha(fecha)}
                />
                <div className="grid gap-1">
                    <Label htmlFor="agenda-fecha">Fecha</Label>
                    <Input
                        id="agenda-fecha"
                        type="date"
                        className="w-44"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
            </div>

            {cargando && <div className="h-64 animate-pulse rounded-xl bg-muted" />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && agenda && (
                <>
                    {/* Horario del día */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-primary" />
                                Horario de atención del día
                            </CardTitle>
                            <CardDescription>
                                {agenda.horarios?.length > 0
                                    ? agenda.horarios
                                          .map((h) => `${h.horaInicio} – ${h.horaFin}`)
                                          .join(" · ")
                                    : "La clínica no atiende en esta fecha."}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Restricciones */}
                    {(agenda.restricciones?.length ?? 0) > 0 && (
                        <Card className="border-orange-500/40">
                            <CardHeader>
                                <CardTitle>Restricciones aplicables</CardTitle>
                                <CardDescription>Bloqueos generales o específicos para este día.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {agenda.restricciones.map((restriccion) => (
                                    <p key={restriccion.id}>
                                        ⛔ <span className="font-medium">{restriccion.motivo}</span>{" "}
                                        ({restriccion.tipoRestriccion?.nombre}) —{" "}
                                        {restriccion.todoElDia
                                            ? "todo el día"
                                            : `${restriccion.horaInicio} – ${restriccion.horaFin}`}
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Citas del día */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Citas programadas</CardTitle>
                            <CardDescription>
                                {(agenda.citas?.length ?? 0)} cita(s) con bloqueo de disponibilidad.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            {(agenda.citas?.length ?? 0) === 0 ? (
                                <div className="px-6 pb-6">
                                    <EmptyState
                                        title="Sin citas este día"
                                        description="No hay citas que bloqueen disponibilidad para la fecha seleccionada."
                                    />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Horario</TableHead>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead className="hidden md:table-cell">Tratamiento</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agenda.citas.map((cita) => (
                                            <TableRow key={cita.id}>
                                                <TableCell className="font-medium">
                                                    {cita.horaInicio} – {cita.horaFin}
                                                </TableCell>
                                                <TableCell>{nombreCompleto(cita.cliente)}</TableCell>
                                                <TableCell className="hidden max-w-48 truncate md:table-cell">
                                                    {cita.servicio?.nombre}
                                                </TableCell>
                                                <TableCell>{formatCurrency(cita.costoTotal)}</TableCell>
                                                <TableCell>
                                                    <EstadoBadge estado={cita.estadoCita} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link to={`/citas/${cita.id}`}>Ver</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-between">
                        {isAdmin && (
                            <Button asChild variant="outline">
                                <Link to={`/especialistas/${id}`}>Ver ficha del especialista</Link>
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => navigate("/citas")}>
                            Ir a citas
                        </Button>
                    </div>
                </>
            )}
        </section>
    )
}
