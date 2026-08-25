import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { CalendarPlus, Eye, Pencil, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { TableLoading } from "@/components/shared/CardsLoading"
import { EstadoBadge } from "@/components/shared/EstadoBadge"
import { CancelarCitaDialog } from "@/components/citas/CancelarCitaDialog"
import { CambiarEstadoDialog } from "@/components/citas/CambiarEstadoDialog"
import { useAuth } from "@/auth/useAuth"
import {
    listarCitas,
    listarCitasCliente,
    listarCitasEmpleado,
} from "@/services/citasService"
import { listarEstadosCita } from "@/services/estadosCitaService"
import { formatCurrency, formatFechaCorta, nombreCompleto } from "@/lib/format"

export function CitasPage() {
    const { user, rol, empleadoId } = useAuth()
    const isAdmin = rol === "Administrador"
    const isEmpleado = rol === "Empleado"
    const isCliente = rol === "Cliente"

    const [citas, setCitas] = useState([])
    const [estados, setEstados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [filtroEstado, setFiltroEstado] = useState("todos")
    const [filtroFecha, setFiltroFecha] = useState("")
    const [citaACancelar, setCitaACancelar] = useState(null)
    const [citaACambiar, setCitaACambiar] = useState(null)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            let data
            if (isAdmin) {
                data = await listarCitas()
            } else if (isEmpleado && empleadoId) {
                data = await listarCitasEmpleado(empleadoId)
            } else if (isCliente) {
                data = await listarCitasCliente(user.id)
            } else {
                data = []
            }
            setCitas(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [isAdmin, isEmpleado, isCliente, empleadoId, user?.id])

    useEffect(() => {
        if (!rol) return
        cargar()
    }, [cargar, rol])

    useEffect(() => {
        let activo = true
        listarEstadosCita()
            .then((data) => {
                if (activo) setEstados(Array.isArray(data) ? data : [])
            })
            .catch(() => {})
        return () => {
            activo = false
        }
    }, [])

    const citasFiltradas = useMemo(() => {
        return [...citas]
            .filter((cita) => {
                if (filtroEstado !== "todos" && cita.estadoCita?.nombre !== filtroEstado) {
                    return false
                }
                if (filtroFecha && cita.fecha !== filtroFecha) {
                    return false
                }
                return true
            })
            .sort((a, b) =>
                `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`)
            )
    }, [citas, filtroEstado, filtroFecha])

    function puedeCancelar(cita) {
        if (isCliente) {
            // Enunciado: el Cliente solo cancela SUS citas y solo en estado
            // Pendiente (identificado por nombre, nunca por id numérico).
            // El listado ya es exclusivo suyo (listarCitasCliente), pero la
            // propiedad se verifica de forma explícita.
            return cita.clienteId === user?.id && cita.estadoCita?.nombre === "Pendiente"
        }
        // Administrador y Empleado: el API valida según el estado
        return true
    }

    function puedeEditar(cita) {
        if (!(isAdmin || isEmpleado)) return false
        return Boolean(cita.estadoCita?.permiteEdicion)
    }

    async function refrescar(mensaje) {
        await cargar()
        if (mensaje) toast.success(mensaje)
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <PageHeader
                    title={isCliente ? "Mis citas" : "Gestión de citas"}
                    description={
                        isCliente
                            ? "Consulte sus citas y cancélelas cuando el estado lo permita."
                            : isAdmin
                              ? "Todas las citas de la clínica DentiCare."
                              : "Citas asignadas a usted como especialista."
                    }
                />
                {(isAdmin || isEmpleado) && (
                    <Button asChild>
                        <Link to="/citas/nueva">
                            <CalendarPlus className="mr-1 h-4 w-4" />
                            Nueva cita
                        </Link>
                    </Button>
                )}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1">
                    <Label>Estado</Label>
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos los estados</SelectItem>
                            {estados.map((estado) => (
                                <SelectItem key={estado.id} value={estado.nombre}>
                                    {estado.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1">
                    <Label htmlFor="filtro-fecha">Fecha</Label>
                    <Input
                        id="filtro-fecha"
                        type="date"
                        className="w-44"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                </div>
                {(filtroFecha || filtroEstado !== "todos") && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setFiltroEstado("todos")
                            setFiltroFecha("")
                        }}
                    >
                        <RefreshCcw className="mr-1 h-4 w-4" />
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {cargando && <TableLoading rows={6} />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && citasFiltradas.length === 0 && (
                <EmptyState
                    title="Sin citas"
                    description={
                        citas.length === 0
                            ? isCliente
                                ? "Usted aún no tiene citas registradas."
                                : "No hay citas registradas."
                            : "No hay citas que coincidan con los filtros aplicados."
                    }
                />
            )}

            {!cargando && !error && citasFiltradas.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Horario</TableHead>
                                {!isCliente && <TableHead>Paciente</TableHead>}
                                {!isEmpleado && <TableHead className="hidden md:table-cell">Especialista</TableHead>}
                                <TableHead className="hidden lg:table-cell">Tratamiento</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {citasFiltradas.map((cita) => (
                                <TableRow key={cita.id}>
                                    <TableCell className="font-medium">{formatFechaCorta(cita.fecha)}</TableCell>
                                    <TableCell>{cita.horaInicio}</TableCell>
                                    {!isCliente && (
                                        <TableCell>{nombreCompleto(cita.cliente)}</TableCell>
                                    )}
                                    {!isEmpleado && (
                                        <TableCell className="hidden md:table-cell">
                                            {nombreCompleto(cita.empleado?.usuario)}
                                        </TableCell>
                                    )}
                                    <TableCell className="hidden max-w-48 truncate lg:table-cell">
                                        {cita.servicio?.nombre}
                                    </TableCell>
                                    <TableCell>{formatCurrency(cita.costoTotal)}</TableCell>
                                    <TableCell>
                                        <EstadoBadge estado={cita.estadoCita} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Acciones
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/citas/${cita.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        Ver detalle
                                                    </Link>
                                                </DropdownMenuItem>
                                                {puedeEditar(cita) && (
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/citas/${cita.id}/editar`}>
                                                            <Pencil className="h-4 w-4" />
                                                            Editar cita
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                {(isAdmin || isEmpleado) && (
                                                    <DropdownMenuItem onSelect={() => setCitaACambiar(cita)}>
                                                        <RefreshCcw className="h-4 w-4" />
                                                        Cambiar estado
                                                    </DropdownMenuItem>
                                                )}
                                                {puedeCancelar(cita) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onSelect={() => setCitaACancelar(cita)}
                                                        >
                                                            Cancelar cita
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CancelarCitaDialog
                open={Boolean(citaACancelar)}
                onOpenChange={(abierto) => !abierto && setCitaACancelar(null)}
                cita={citaACancelar}
                onConfirmada={() => refrescar()}
            />

            <CambiarEstadoDialog
                open={Boolean(citaACambiar)}
                onOpenChange={(abierto) => !abierto && setCitaACambiar(null)}
                cita={citaACambiar}
                estados={estados}
                onConfirmado={() => refrescar()}
            />
        </section>
    )
}
