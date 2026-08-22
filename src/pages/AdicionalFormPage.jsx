import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { FormError } from "@/components/FormError"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { adicionalSchema } from "@/schemas/catalogoSchema"
import {
    crearAdicional,
    obtenerAdicional,
    actualizarAdicional,
} from "@/services/adicionalesService"

/**
 * Formulario de creación/edición de servicios adicionales (solo Administrador).
 *
 * La prop `modo` alterna entre crear y editar; en edición se precargan
 * los datos del adicional por id. A diferencia del tratamiento, no lleva
 * imagen ni duración, solo nombre, descripción y precio en colones.
 *
 * @component
 * @param {Object} props
 * @param {"crear"|"editar"} props.modo Modo de operación del formulario.
 */
export function AdicionalFormPage({ modo }) {
    const esEdicion = modo === "editar"
    const { id } = useParams()
    const navigate = useNavigate()
    const [cargando, setCargando] = useState(esEdicion)
    const [errorCarga, setErrorCarga] = useState(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(adicionalSchema),
        defaultValues: { nombre: "", descripcion: "", precio: "" },
    })

    useEffect(() => {
        // En creación no hay nada que precargar
        if (!esEdicion) return
        // Evita setState sobre un componente ya desmontado
        let activo = true
        async function cargar() {
            try {
                const adicional = await obtenerAdicional(id)
                if (!activo) return
                // El input numérico espera string
                reset({
                    nombre: adicional.nombre,
                    descripcion: adicional.descripcion,
                    precio: String(adicional.precio),
                })
            } catch (e) {
                if (activo) setErrorCarga(e.message)
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => {
            activo = false
        }
    }, [esEdicion, id, reset])

    async function onSubmit(data) {
        try {
            // Conversión de tipos: el formulario entrega strings validados por Zod
            const payload = {
                nombre: data.nombre.trim(),
                descripcion: data.descripcion.trim(),
                precio: Number(data.precio),
            }
            if (esEdicion) {
                await actualizarAdicional(id, payload)
                toast.success("Servicio adicional actualizado correctamente.")
            } else {
                await crearAdicional(payload)
                toast.success("Servicio adicional creado correctamente.")
            }
            navigate("/adicionales")
        } catch (e) {
            toast.error(e.message || "No se pudo guardar el servicio adicional.")
        }
    }

    if (cargando) return <div className="h-64 animate-pulse rounded-xl bg-muted" />
    if (errorCarga) return <ErrorState message={errorCarga} />

    return (
        <section className="mx-auto max-w-xl space-y-6">
            <PageHeader
                title={esEdicion ? "Editar servicio adicional" : "Nuevo servicio adicional"}
                description={
                    esEdicion
                        ? "Modifique los datos del servicio o insumo adicional."
                        : "Registre un nuevo insumo o complemento para las citas."
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Datos del servicio adicional</CardTitle>
                    <CardDescription>Los campos marcados con * son obligatorios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input id="nombre" placeholder="Radiografía panorámica" {...register("nombre")} />
                            <FormError message={errors.nombre?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción *</Label>
                            <Textarea
                                id="descripcion"
                                rows={4}
                                placeholder="Estudio de imagen que muestra la totalidad de la boca…"
                                {...register("descripcion")}
                            />
                            <FormError message={errors.descripcion?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="precio">Precio (₡) *</Label>
                            <Input
                                id="precio"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="12000"
                                {...register("precio")}
                            />
                            <FormError message={errors.precio?.message} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => navigate("/adicionales")}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="mr-1 h-4 w-4" />
                                {isSubmitting ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear adicional"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    )
}

AdicionalFormPage.propTypes = {
    modo: PropTypes.oneOf(["crear", "editar"]).isRequired,
}
