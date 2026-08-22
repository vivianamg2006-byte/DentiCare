import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { listarEmpleados } from "@/services/empleadosService"
import { nombreCompleto } from "@/lib/format"

/**
 * Página de listado de especialistas (fichas de empleados) de DentiCare.
 * Sin props: carga el listado desde el API y ofrece búsqueda local por
 * nombre, código de empleado o especialidad. Cada fila enlaza al detalle.
 */
export function EspecialistasPage() {
    const [empleados, setEmpleados] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [busqueda, setBusqueda] = useState("")

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await listarEmpleados()
            // Blindaje: si el API responde algo distinto a un array, no rompemos el render
            setEmpleados(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Filtro en memoria: buscamos sobre lo ya cargado, sin golpear el API en cada tecla
    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()
        if (!texto) return empleados
        return empleados.filter(
            (e) =>
                nombreCompleto(e.usuario).toLowerCase().includes(texto) ||
                e.codigoEmpleado.toLowerCase().includes(texto) ||
                e.especialidad?.nombre?.toLowerCase().includes(texto)
        )
    }, [empleados, busqueda])

    return (
        <section className="space-y-6">
            <PageHeader
                title="Especialistas"
                description="Odontólogos e higienistas de la clínica DentiCare."
            />

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, código o especialidad…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button asChild className="ml-auto">
                    <Link to="/especialistas/nuevo">
                        <Plus className="mr-1 h-4 w-4" />
                        Nuevo especialista
                    </Link>
                </Button>
            </div>

            {cargando && <TableLoading rows={5} />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && filtrados.length === 0 && (
                <EmptyState
                    title="Sin especialistas"
                    description={
                        busqueda
                            ? "No se encontraron especialistas para la búsqueda."
                            : "Aún no hay especialistas registrados."
                    }
                />
            )}

            {!cargando && !error && filtrados.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Especialista</TableHead>
                                <TableHead>Especialidad</TableHead>
                                <TableHead className="hidden md:table-cell">Tratamientos</TableHead>
                                <TableHead className="hidden lg:table-cell">Citas</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.map((empleado) => (
                                <TableRow key={empleado.id} className="hover:bg-muted/50">
                                    <TableCell className="font-mono text-sm">
                                        <Link to={`/especialistas/${empleado.id}`} className="font-medium hover:text-primary hover:underline">
                                            {empleado.codigoEmpleado}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/especialistas/${empleado.id}`} className="hover:text-primary hover:underline">
                                            {nombreCompleto(empleado.usuario)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{empleado.especialidad?.nombre ?? "—"}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {empleado.servicios?.length ?? 0}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {empleado._count?.citas ?? 0}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={empleado.activo ? "secondary" : "outline"}>
                                            {empleado.activo ? "Activo" : "Inactivo"}
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
