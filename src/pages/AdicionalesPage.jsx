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
import { useAuth } from "@/auth/useAuth"
import { listarAdicionales } from "@/services/adicionalesService"
import { formatCurrency } from "@/lib/format"

/**
 * Listado de servicios adicionales (radiografías, anestesia, etc.).
 *
 * Catálogo de lectura pública presentado en tabla, con búsqueda local
 * por nombre o descripción. Solo el Administrador puede crear nuevos
 * adicionales; la edición y el cambio de estado se hacen en el detalle.
 *
 * @component
 */
export function AdicionalesPage() {
    const { isAdmin } = useAuth()
    const [adicionales, setAdicionales] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [busqueda, setBusqueda] = useState("")

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await listarAdicionales()
            setAdicionales(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Búsqueda en memoria sobre el listado ya cargado, sin nuevas peticiones
    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()
        if (!texto) return adicionales
        return adicionales.filter(
            (a) =>
                a.nombre.toLowerCase().includes(texto) ||
                a.descripcion.toLowerCase().includes(texto)
        )
    }, [adicionales, busqueda])

    return (
        <section className="space-y-6">
            <PageHeader
                title="Servicios adicionales"
                description="Insumos y complementos que pueden agregarse a una cita."
            />

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar adicional…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {isAdmin && (
                    <Button asChild className="ml-auto">
                        <Link to="/adicionales/nuevo">
                            <Plus className="mr-1 h-4 w-4" />
                            Nuevo adicional
                        </Link>
                    </Button>
                )}
            </div>

            {cargando && <TableLoading rows={5} />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && filtrados.length === 0 && (
                <EmptyState
                    title="Sin servicios adicionales"
                    description={
                        busqueda
                            ? "No se encontraron resultados para la búsqueda."
                            : "Aún no hay servicios adicionales registrados."
                    }
                />
            )}

            {!cargando && !error && filtrados.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.map((adicional) => (
                                <TableRow key={adicional.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <Link to={`/adicionales/${adicional.id}`} className="hover:text-primary hover:underline">
                                            {adicional.nombre}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="hidden max-w-md truncate text-muted-foreground md:table-cell">
                                        {adicional.descripcion}
                                    </TableCell>
                                    <TableCell>{formatCurrency(adicional.precio)}</TableCell>
                                    <TableCell>
                                        <Badge variant={adicional.activo ? "secondary" : "outline"}>
                                            {adicional.activo ? "Activo" : "Inactivo"}
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
