import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { CalendarDays, Mail, Pencil, Phone, Power, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useAuth } from "@/auth/useAuth"
import { obtenerEmpleado, cambiarEstadoEmpleado } from "@/services/empleadosService"
import { formatCurrency, nombreCompleto } from "@/lib/format"

/**
 * Detalle de un especialista a partir del :id de la ruta (/especialistas/:id).
 * Muestra ficha y contacto, tratamientos asignados y sus restricciones de agenda.
 * Las acciones de editar y activar/desactivar se muestran solo al administrador.
 */
export function EspecialistaDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAdmin } = useAuth()
    const [empleado, setEmpleado] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [confirmarEstado, setConfirmarEstado] = useState(false)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerEmpleado(id)
            setEmpleado(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [id])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Alterna activo/inactivo de la ficha y recarga el detalle para reflejarlo
    async function cambiarEstado() {
        try {
            await cambiarEstadoEmpleado(empleado.id, !empleado.activo)
            toast.success(
                empleado.activo
                    ? "Especialista desactivado correctamente."
                    : "Especialista activado correctamente."
            )
            setConfirmarEstado(false)
            cargar()
        } catch (e) {
            toast.error(e.message || "No se pudo cambiar el estado del especialista.")
        }
    }

    if (cargando) return <div className="h-96 animate-pulse rounded-xl bg-muted" />
    if (error) return <ErrorState message={error} onRetry={cargar} />
    if (!empleado) return null

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <PageHeader
                    title={nombreCompleto(empleado.usuario)}
                    description={`Ficha ${empleado.codigoEmpleado} · ${empleado.especialidad?.nombre ?? ""}`}
                />
                <Button asChild variant="outline">
                    <Link to={`/agenda/${empleado.id}`}>
                        <CalendarDays className="mr-1 h-4 w-4" />
                        Ver agenda
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Datos generales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del especialista</CardTitle>
                        <CardDescription>Información de la ficha y contacto.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Badge variant={empleado.activo ? "secondary" : "outline"}>
                            {empleado.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        <Separator />
                        <p><span className="text-muted-foreground">Código:</span> <span className="font-mono font-medium">{empleado.codigoEmpleado}</span></p>
                        <p><span className="text-muted-foreground">Especialidad:</span> {empleado.especialidad?.nombre ?? "—"}</p>
                        <p>
                            <span className="text-muted-foreground">Correo:</span>{" "}
                            <span className="inline-flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" /> {empleado.usuario?.correo}
                            </span>
                        </p>
                        <p>
                            <span className="text-muted-foreground">Teléfono:</span>{" "}
                            <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {empleado.usuario?.telefono || "—"}
                            </span>
                        </p>
                        {empleado.descripcion && (
                            <>
                                <Separator />
                                <p className="text-muted-foreground">{empleado.descripcion}</p>
                            </>
                        )}
                        <Separator />
                        <p><span className="text-muted-foreground">Total de citas registradas:</span> {empleado._count?.citas ?? 0}</p>

                        {/* Permisos aplicados SOLO en FrontEnd: el API no valida el rol */}
                        {isAdmin && (
                            <>
                                <Separator />
                                <div className="flex flex-wrap gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/especialistas/${empleado.id}/editar`}>
                                            <Pencil className="mr-1 h-4 w-4" />
                                            Editar
                                        </Link>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={empleado.activo ? "destructive" : "default"}
                                        onClick={() => setConfirmarEstado(true)}
                                    >
                                        <Power className="mr-1 h-4 w-4" />
                                        {empleado.activo ? "Desactivar" : "Activar"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Tratamientos asignados */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tratamientos que atiende</CardTitle>
                        <CardDescription>
                            {empleado.servicios?.length ?? 0} tratamiento(s) asignado(s).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(empleado.servicios?.length ?? 0) === 0 ? (
                            <p className="text-sm text-muted-foreground">Sin tratamientos asignados.</p>
                        ) : (
                            <ul className="divide-y divide-border">
                                {empleado.servicios.map((servicio) => (
                                    <li key={servicio.id} className="flex items-center justify-between py-2 text-sm">
                                        <Link
                                            to={`/tratamientos/${servicio.id}`}
                                            className="font-medium hover:text-primary hover:underline"
                                        >
                                            {servicio.nombre}
                                        </Link>
                                        <span className="text-muted-foreground">
                                            {formatCurrency(servicio.precioBase)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Restricciones del especialista */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        Restricciones de agenda
                    </CardTitle>
                    <CardDescription>Bloqueos registrados para este especialista.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    {(empleado.restricciones?.length ?? 0) === 0 ? (
                        <p className="px-6 pb-6 text-sm text-muted-foreground">Sin restricciones registradas.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Rango</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {empleado.restricciones.map((restriccion) => (
                                    <TableRow key={restriccion.id}>
                                        <TableCell>{String(restriccion.fecha).slice(0, 10)}</TableCell>
                                        <TableCell>
                                            {restriccion.todoElDia
                                                ? "Todo el día"
                                                : `${restriccion.horaInicio} – ${restriccion.horaFin}`}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">{restriccion.motivo}</TableCell>
                                        <TableCell>
                                            <Badge variant={restriccion.activo ? "secondary" : "outline"}>
                                                {restriccion.activo ? "Activa" : "Inactiva"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmarEstado}
                onOpenChange={setConfirmarEstado}
                title={empleado.activo ? "Desactivar especialista" : "Activar especialista"}
                description={
                    empleado.activo
                        ? `¿Desea desactivar la ficha de ${nombreCompleto(empleado.usuario)}? No podrá atender nuevas citas.`
                        : `¿Desea activar la ficha de ${nombreCompleto(empleado.usuario)}?`
                }
                confirmText={empleado.activo ? "Desactivar" : "Activar"}
                destructive={empleado.activo}
                onConfirm={cambiarEstado}
            />

            <div className="flex justify-end">
                <Button variant="ghost" onClick={() => navigate("/especialistas")}>
                    Volver al listado
                </Button>
            </div>
        </section>
    )
}
