import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Clock, Plus, Search, Stethoscope, Smile } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { EmptyState } from "@/components/shared/EmptyState"
import { CardsLoading } from "@/components/shared/CardsLoading"
import { useAuth } from "@/auth/useAuth"
import { listarServicios } from "@/services/serviciosService"
import { urlImagen } from "@/services/imagesService"
import { formatCurrency, formatDuracion } from "@/lib/format"
import { imagenTratamiento } from "@/lib/imagenesTratamientos"

/**
 * Catálogo público de tratamientos dentales.
 *
 * Cualquier visitante puede consultar el catálogo (lectura pública).
 * Incluye búsqueda local (nombre, especialidad y descripción) y, solo
 * para Administrador, un filtro para ver también los inactivos y el
 * botón de crear nuevos tratamientos.
 *
 * @component
 */
export function TratamientosPage() {
    const { isAdmin } = useAuth()
    const [servicios, setServicios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    // Por defecto se ocultan los inactivos; solo admin puede mostrarlos
    const [verInactivos, setVerInactivos] = useState(false)

    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await listarServicios()
            setServicios(Array.isArray(data) ? data : [])
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Filtrado en memoria (sin petición al API): texto de búsqueda + visibilidad de inactivos
    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()
        return servicios.filter((s) => {
            if (!verInactivos && !s.activo) return false
            if (!texto) return true
            return (
                s.nombre.toLowerCase().includes(texto) ||
                s.especialidad?.nombre?.toLowerCase().includes(texto) ||
                s.descripcion?.toLowerCase().includes(texto)
            )
        })
    }, [servicios, busqueda, verInactivos])

    return (
        <section className="space-y-6">
            <PageHeader
                title="Tratamientos dentales"
                description="Catálogo de tratamientos disponibles en la clínica DentiCare."
            />

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar tratamiento…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {isAdmin && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={verInactivos}
                            onChange={(e) => setVerInactivos(e.target.checked)}
                            className="h-4 w-4 accent-[var(--primary)]"
                        />
                        Mostrar inactivos
                    </label>
                )}
                {isAdmin && (
                    <Button asChild className="ml-auto">
                        <Link to="/tratamientos/nuevo">
                            <Plus className="mr-1 h-4 w-4" />
                            Nuevo tratamiento
                        </Link>
                    </Button>
                )}
            </div>

            {cargando && <CardsLoading count={6} />}
            {!cargando && error && <ErrorState message={error} onRetry={cargar} />}
            {!cargando && !error && filtrados.length === 0 && (
                <EmptyState
                    title="Sin tratamientos"
                    description={
                        busqueda
                            ? "No se encontraron tratamientos que coincidan con la búsqueda."
                            : "Aún no hay tratamientos registrados."
                    }
                />
            )}
            {!cargando && !error && filtrados.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtrados.map((servicio) => {
                        // Prioriza la imagen local por nombre; si no hay, usa la del API
                        const imagen = imagenTratamiento(servicio.nombre) ?? urlImagen(servicio.imagen)
                        return (
                        <Link key={servicio.id} to={`/tratamientos/${servicio.id}`} className="group">
                            <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
                                <div className="flex aspect-video items-center justify-center overflow-hidden border-b border-border bg-muted/40">
                                    {imagen ? (
                                        <img
                                            src={imagen}
                                            alt={servicio.nombre}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <Smile className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                                <CardContent className="space-y-2 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold leading-tight">{servicio.nombre}</h3>
                                        <Badge variant={servicio.activo ? "secondary" : "outline"}>
                                            {servicio.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {servicio.descripcion}
                                    </p>
                                    <div className="flex items-center justify-between pt-1 text-sm">
                                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                                            <Stethoscope className="h-3.5 w-3.5" />
                                            {servicio.especialidad?.nombre ?? "—"}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            {formatDuracion(servicio.duracionMinutos)}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-primary">
                                        {formatCurrency(servicio.precioBase)}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
