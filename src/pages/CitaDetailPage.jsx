import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Pencil, RefreshCcw, Stethoscope, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
import { EstadoBadge } from "@/components/shared/EstadoBadge"
import { CancelarCitaDialog } from "@/components/citas/CancelarCitaDialog"
import { CambiarEstadoDialog } from "@/components/citas/CambiarEstadoDialog"
import { useAuth } from "@/auth/useAuth"
import { obtenerCita } from "@/services/citasService"
import { listarEstadosCita } from "@/services/estadosCitaService"
import {
    formatCurrency,
    formatDuracion,
    formatFecha,
    formatHora,
    nombreCompleto,
} from "@/lib/format"

export function CitaDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { rol, empleadoId, user } = useAuth()
    const isAdmin = rol === "Administrador"
    const isEmpleado = rol === "Empleado"

    const [cita, setCita] = useState(null)
    const [estados, setEstados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [cancelarAbierto, setCancelarAbierto] = useState(false)
    const [estadoAbierto, setEstadoAbierto] = useState(false)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerCita(id)
            setCita(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [id])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Bloqueo por ruta directa: un Cliente solo ve sus propias citas y
    // un Empleado solo las que tienen asignadas.
    useEffect(() => {
        if (!cita) return
        if (rol === "Cliente" && cita.clienteId !== user.id) {
            navigate("/unauthorized", { replace: true })
        }
        if (rol === "Empleado" && cita.empleadoId !== empleadoId) {
            navigate("/unauthorized", { replace: true })
        }
    }, [cita, rol, user?.id, empleadoId, navigate])

    useEffect(() => {
        let activo = true
        listarEstadosCita()
            .then((data) => activo && setEstados(Array.isArray(data) ? data : []))
            .catch(() => {})
        return () => {
            activo = false
        }
    }, [])

    if (cargando) return <div className="h-96 animate-pulse rounded-xl bg-muted" />
    if (error) return <ErrorState message={error} onRetry={cargar} />
    if (!cita) return null

    // Un empleado solo debe gestionar sus citas asignadas
    const esAsignada = isEmpleado && cita.empleadoId === empleadoId
    const puedeGestionar = isAdmin || esAsignada

    function puedeCancelar() {
        if (!cita.estadoCita) return false
        if (rol === "Cliente") {
            return Boolean(cita.estadoCita.permiteCancelacionCliente)
        }
        return puedeGestionar
    }

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <PageHeader
                    title={`Cita #${cita.id}`}
                    description={`${formatFecha(cita.fecha)} · ${formatHora(cita.horaInicio)} – ${formatHora(cita.horaFin)}`}
                />
                <EstadoBadge estado={cita.estadoCita} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalles de la consulta</CardTitle>
                        <CardDescription>Paciente y especialista asignado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Paciente</p>
                            <p className="font-medium">
                                {nombreCompleto(cita.cliente)}
                                {cita.cliente?.correo && (
                                    <span className="block text-xs text-muted-foreground">{cita.cliente.correo}</span>
                                )}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Especialista</p>
                            <p className="font-medium">{nombreCompleto(cita.empleado?.usuario)}</p>
                            <p className="text-xs text-muted-foreground">
                                {cita.empleado?.codigoEmpleado} ·{" "}
                                {cita.empleado?.especialidad?.nombre}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tratamiento principal</p>
                            <Link to={`/tratamientos/${cita.servicioId}`} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                                <Stethoscope className="h-4 w-4" />
                                {cita.servicio?.nombre}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                Duración: {formatDuracion(cita.duracionMinutos)}
                            </p>
                        </div>
                        {cita.observaciones && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Observaciones</p>
                                    <p>{cita.observaciones}</p>
                                </div>
                            </>
                        )}
                        {cita.motivoCancelacion && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Motivo de cancelación</p>
                                    <p className="font-medium text-destructive">{cita.motivoCancelacion}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de costos</CardTitle>
                        <CardDescription>Cálculo enviado al momento de registrar la cita.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {(cita.adicionales?.length ?? 0) > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Servicio adicional</TableHead>
                                        <TableHead className="text-right">Precio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cita.adicionales.map((adicional) => (
                                        <TableRow key={adicional.id}>
                                            <TableCell>
                                                <Link to={`/adicionales/${adicional.id}`} className="hover:text-primary hover:underline">
                                                    {adicional.nombre}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(adicional.precio)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground">Sin servicios adicionales.</p>
                        )}
                        <Separator />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio del tratamiento</span>
                            <span>{formatCurrency(cita.precioServicio)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Servicios adicionales</span>
                            <span>{formatCurrency(cita.costoAdicionales)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span className="text-primary">{formatCurrency(cita.costoTotal)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Acciones */}
            <Card>
                <CardContent className="flex flex-wrap justify-end gap-2 p-4">
                    {puedeGestionar && cita.estadoCita?.permiteEdicion && (
                        <Button asChild variant="outline">
                            <Link to={`/citas/${cita.id}/editar`}>
                                <Pencil className="mr-1 h-4 w-4" />
                                Editar cita
                            </Link>
                        </Button>
                    )}
                    {puedeGestionar && (
                        <Button variant="outline" onClick={() => setEstadoAbierto(true)}>
                            <RefreshCcw className="mr-1 h-4 w-4" />
                            Cambiar estado
                        </Button>
                    )}
                    {puedeCancelar() && !cita.motivoCancelacion && (
                        <Button variant="destructive" onClick={() => setCancelarAbierto(true)}>
                            <XCircle className="mr-1 h-4 w-4" />
                            Cancelar cita
                        </Button>
                    )}
                    <Button variant="ghost" onClick={() => navigate("/citas")}>
                        Volver al listado
                    </Button>
                </CardContent>
            </Card>

            <CancelarCitaDialog
                open={cancelarAbierto}
                onOpenChange={setCancelarAbierto}
                cita={cita}
                onConfirmada={cargar}
            />

            <CambiarEstadoDialog
                open={estadoAbierto}
                onOpenChange={setEstadoAbierto}
                cita={cita}
                estados={estados}
                onConfirmado={cargar}
            />

            {!isAdmin && !(isEmpleado && esAsignada) && rol !== "Cliente" && (
                <p className="text-center text-sm text-destructive">
                    No tiene permisos para gestionar esta cita.
                </p>
            )}
        </section>
    )
}
