import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Pencil, Power, PackagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { useAuth } from "@/auth/useAuth"
import { obtenerAdicional, cambiarEstadoAdicional } from "@/services/adicionalesService"
import { formatCurrency } from "@/lib/format"

/**
 * Detalle de un servicio adicional (ruta /adicionales/:id).
 *
 * Muestra nombre, descripción, precio en colones y estado. Las acciones
 * de editar y activar/desactivar quedan reservadas al Administrador;
 * el toggle de estado pide confirmación antes de aplicarse.
 *
 * @component
 */
export function AdicionalDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAdmin } = useAuth()
    const [adicional, setAdicional] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    // Abre/cierra el diálogo de confirmación del cambio de estado
    const [confirmarEstado, setConfirmarEstado] = useState(false)

    // Referencia estable para permitir el reintento desde ErrorState
    const cargar = useCallback(async () => {
        setCargando(true)
        setError(null)
        try {
            const data = await obtenerAdicional(id)
            setAdicional(data)
        } catch (e) {
            setError(e.message)
        } finally {
            setCargando(false)
        }
    }, [id])

    useEffect(() => {
        cargar()
    }, [cargar])

    // Toggle activo/inactivo: el registro no se elimina del catálogo
    async function cambiarEstado() {
        try {
            await cambiarEstadoAdicional(adicional.id, !adicional.activo)
            toast.success(
                adicional.activo
                    ? "Servicio adicional desactivado correctamente."
                    : "Servicio adicional activado correctamente."
            )
            setConfirmarEstado(false)
            cargar()
        } catch (e) {
            toast.error(e.message || "No se pudo cambiar el estado del servicio adicional.")
        }
    }

    if (cargando) return <div className="h-64 animate-pulse rounded-xl bg-muted" />
    if (error) return <ErrorState message={error} onRetry={cargar} />
    if (!adicional) return null

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <PageHeader title={adicional.nombre} />

            <Card>
                <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                        <Badge variant={adicional.activo ? "secondary" : "outline"}>
                            {adicional.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        <PackagePlus className="h-8 w-8 text-primary/60" />
                    </div>

                    <Separator />

                    <div>
                        <h3 className="mb-1 font-semibold">Descripción</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {adicional.descripcion}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Precio</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(adicional.precio)}</p>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap justify-end gap-2">
                        {isAdmin && (
                            <>
                                <Button asChild variant="outline">
                                    <Link to={`/adicionales/${adicional.id}/editar`}>
                                        <Pencil className="mr-1 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button
                                    variant={adicional.activo ? "destructive" : "default"}
                                    onClick={() => setConfirmarEstado(true)}
                                >
                                    <Power className="mr-1 h-4 w-4" />
                                    {adicional.activo ? "Desactivar" : "Activar"}
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" onClick={() => navigate("/adicionales")}>
                            Volver al listado
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={confirmarEstado}
                onOpenChange={setConfirmarEstado}
                title={adicional.activo ? "Desactivar servicio adicional" : "Activar servicio adicional"}
                description={
                    adicional.activo
                        ? `¿Desea desactivar "${adicional.nombre}"? No podrá agregarse a nuevas citas.`
                        : `¿Desea activar "${adicional.nombre}"? Volverá a estar disponible.`
                }
                confirmText={adicional.activo ? "Desactivar" : "Activar"}
                destructive={adicional.activo}
                onConfirm={cambiarEstado}
            />
        </section>
    )
}
