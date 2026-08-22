import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Clock, Pencil, Power, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useAuth } from "@/auth/useAuth"
import { obtenerServicio, cambiarEstadoServicio } from "@/services/serviciosService"
import { urlImagen } from "@/services/imagesService"
import { formatCurrency, formatDuracion } from "@/lib/format"

/**
 * Detalle de un tratamiento del catálogo.
 *
 * Carga el servicio por su id (ruta /tratamientos/:id), muestra imagen,
 * precio base en colones, duración, especialidad y estado. Las acciones
 * de edición y activar/desactivar son exclusivas del Administrador; el
 * cambio de estado es un toggle confirmado con diálogo.
 *
 * @component
 */
export function TratamientoDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAdmin } = useAuth()
    const [servicio, setServicio] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    // Controla la apertura del diálogo de confirmación para activar/desactivar
    const [confirmarEstado, setConfirmarEstado] = useState(false)

    // useCallback: la referencia estable permite reintentar la carga desde ErrorState
    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerServicio(id)
            setServicio(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [id])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Alterna el estado activo/inactivo del tratamiento (soft delete, no elimina el registro)
    async function cambiarEstado() {
        try {
            await cambiarEstadoServicio(servicio.id, !servicio.activo)
            toast.success(
                servicio.activo
                    ? "Tratamiento desactivado correctamente."
                    : "Tratamiento activado correctamente."
            )
            setConfirmarEstado(false)
            cargar()
        } catch (e) {
            toast.error(e.message || "No se pudo cambiar el estado del tratamiento.")
        }
    }

    if (cargando) {
        return (
            <section className="mx-auto max-w-3xl space-y-4">
                <div className="h-64 animate-pulse rounded-xl bg-muted" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </section>
        )
    }

    if (error) return <ErrorState message={error} onRetry={cargar} />
    if (!servicio) return null

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <PageHeader title={servicio.nombre} description={servicio.especialidad?.nombre} />

            <Card className="overflow-hidden pt-0">
                <div className="flex h-72 items-center justify-center border-b border-border bg-muted/40">
                    {urlImagen(servicio.imagen) ? (
                        <img
                            src={urlImagen(servicio.imagen)}
                            alt={servicio.nombre}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Stethoscope className="h-16 w-16 text-muted-foreground" />
                    )}
                </div>
                <CardContent className="space-y-4 p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={servicio.activo ? "secondary" : "outline"}>
                            {servicio.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Duración: {formatDuracion(servicio.duracionMinutos)}
                        </span>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="mb-1 font-semibold">Descripción</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {servicio.descripcion}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-8">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Precio base</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(servicio.precioBase)}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Especialidad</p>
                            <p className="text-sm font-medium">{servicio.especialidad?.nombre ?? "—"}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap justify-end gap-2">
                        {isAdmin && (
                            <>
                                <Button asChild variant="outline">
                                    <Link to={`/tratamientos/${servicio.id}/editar`}>
                                        <Pencil className="mr-1 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button variant={servicio.activo ? "destructive" : "default"} onClick={() => setConfirmarEstado(true)}>
                                    <Power className="mr-1 h-4 w-4" />
                                    {servicio.activo ? "Desactivar" : "Activar"}
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" onClick={() => navigate("/tratamientos")}>
                            Volver al listado
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmarEstado}
                onOpenChange={setConfirmarEstado}
                title={servicio.activo ? "Desactivar tratamiento" : "Activar tratamiento"}
                description={
                    servicio.activo
                        ? `¿Desea desactivar "${servicio.nombre}"? No aparecerá en los formularios de citas mientras esté inactivo.`
                        : `¿Desea activar "${servicio.nombre}"? Volverá a estar disponible para agendar citas.`
                }
                confirmText={servicio.activo ? "Desactivar" : "Activar"}
                destructive={servicio.activo}
                onConfirm={cambiarEstado}
            />
        </section>
    )
}
