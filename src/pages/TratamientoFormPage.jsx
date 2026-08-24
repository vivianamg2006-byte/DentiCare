import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { ImageUpload } from "@/components/shared/ImageUpload"
import { servicioSchema } from "@/schemas/catalogoSchema"
import { listarEspecialidades } from "@/services/especialidadesService"
import {
    crearServicio,
    obtenerServicio,
    actualizarServicio,
} from "@/services/serviciosService"
import { subirImagen } from "@/services/imagesService"

/**
 * Formulario de creación/edición de tratamientos (solo Administrador).
 *
 * Componente dual: la prop `modo` decide si crea un tratamiento nuevo o
 * edita uno existente (carga sus datos por id). Valida con servicioSchema
 * (precio > 0 hasta 99999999.99 en colones, duración entre 15 y 480 min).
 * La imagen es obligatoria: si se sube un archivo nuevo se envía como
 * multipart al endpoint de imágenes (campo "image") y al tratamiento se
 * le asigna el fileName devuelto; en edición se conserva el anterior.
 *
 * @component
 * @param {Object} props
 * @param {"crear"|"editar"} props.modo Modo de operación del formulario.
 */
export function TratamientoFormPage({ modo }) {
    const esEdicion = modo === "editar"
    const { id } = useParams()
    const navigate = useNavigate()

    const [especialidades, setEspecialidades] = useState([])
    const [cargaError, setCargaError] = useState(null)
    const [cargandoDatos, setCargandoDatos] = useState(esEdicion)
    // fileName de la imagen ya asociada al tratamiento (undefined en creación)
    const [imagenActual, setImagenActual] = useState(null)
    const [archivoNuevo, setArchivoNuevo] = useState(null)
    const [vistaPrevia, setVistaPrevia] = useState(null)
    const [errorImagen, setErrorImagen] = useState("")
    const [enviando, setEnviando] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(servicioSchema),
        defaultValues: {
            nombre: "",
            descripcion: "",
            precioBase: "",
            duracionMinutos: "",
            especialidadId: "",
            imagen: "",
        },
    })

    useEffect(() => {
        // Evita actualizar estado si el componente se desmonta a mitad de la carga
        let activo = true
        async function cargarIniciales() {
            try {
                const listaEspecialidades = await listarEspecialidades()
                if (!activo) return
                // Solo se ofrecen especialidades activas al asignar el tratamiento
                setEspecialidades(listaEspecialidades.filter((e) => e.activo))

                if (esEdicion) {
                    const servicio = await obtenerServicio(id)
                    if (!activo) return
                    // Los inputs y el Select trabajan con strings, por eso las conversiones
                    reset({
                        nombre: servicio.nombre,
                        descripcion: servicio.descripcion,
                        precioBase: String(servicio.precioBase),
                        duracionMinutos: String(servicio.duracionMinutos),
                        especialidadId: String(servicio.especialidadId),
                        imagen: servicio.imagen ?? "",
                    })
                    setImagenActual(servicio.imagen ?? null)
                }
            } catch (e) {
                if (activo) setCargaError(e.message)
            } finally {
                if (activo) setCargandoDatos(false)
            }
        }
        cargarIniciales()
        return () => {
            activo = false
        }
    }, [esEdicion, id, reset])

    async function onSubmit(data) {
        setErrorImagen("")
        // El enunciado exige imagen representativa obligatoria: sin archivo
        // nuevo y sin imagen previa guardada no se permite guardar.
        if (!archivoNuevo && !imagenActual) {
            setErrorImagen("La imagen es obligatoria.")
            return
        }
        setEnviando(true)
        try {
            // 1) Si hay archivo nuevo, subirlo primero y usar el fileName recibido
            // El segundo argumento es el nombre de la imagen anterior para que el backend la reemplace
            let nombreImagen = imagenActual
            if (archivoNuevo) {
                const respuesta = await subirImagen(archivoNuevo, imagenActual)
                nombreImagen = respuesta.fileName
            }

            // 2) Enviar el formulario al API
            // El schema valida strings; aquí se convierten a los tipos que espera el backend
            const payload = {
                nombre: data.nombre.trim(),
                descripcion: data.descripcion.trim(),
                precioBase: Number(data.precioBase),
                duracionMinutos: Number(data.duracionMinutos),
                especialidadId: Number(data.especialidadId),
                imagen: nombreImagen ?? null,
            }

            if (esEdicion) {
                await actualizarServicio(id, payload)
                toast.success("Tratamiento actualizado correctamente.")
            } else {
                await crearServicio(payload)
                toast.success("Tratamiento creado correctamente.")
            }
            navigate("/tratamientos")
        } catch (e) {
            toast.error(e.message || "No se pudo guardar el tratamiento.")
        } finally {
            setEnviando(false)
        }
    }

    function handleImagenChange({ archivo, vistaPrevia: preview }) {
        setArchivoNuevo(archivo)
        setVistaPrevia(preview)
        // El schema exige un string no vacío en "imagen": en creación lo
        // aporta el archivo recién elegido; quitarlo vuelve a bloquear.
        setValue("imagen", archivo ? archivo.name : "", { shouldValidate: true })
    }

    if (cargandoDatos) {
        return <div className="h-96 animate-pulse rounded-xl bg-muted" />
    }
    if (cargaError) return <ErrorState message={cargaError} />

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <PageHeader
                title={esEdicion ? "Editar tratamiento" : "Nuevo tratamiento"}
                description={
                    esEdicion
                        ? "Modifique los datos del tratamiento dental."
                        : "Registre un nuevo tratamiento dental en el catálogo de la clínica."
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Datos del tratamiento</CardTitle>
                    <CardDescription>
                        Los campos marcados con * son obligatorios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input id="nombre" placeholder="Limpieza dental (profilaxis)" {...register("nombre")} />
                            <FormError message={errors.nombre?.message} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción *</Label>
                            <Textarea
                                id="descripcion"
                                rows={4}
                                placeholder="Eliminación de placa y sarro para prevenir caries…"
                                {...register("descripcion")}
                            />
                            <FormError message={errors.descripcion?.message} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Especialidad *</Label>
                            <Controller
                                control={control}
                                name="especialidadId"
                                render={({ field }) => (
                                    <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione una especialidad…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {especialidades.map((esp) => (
                                                <SelectItem key={esp.id} value={String(esp.id)}>
                                                    {esp.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError message={errors.especialidadId?.message} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="precioBase">Precio base (₡) *</Label>
                                <Input
                                    id="precioBase"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="25000"
                                    {...register("precioBase")}
                                />
                                <FormError message={errors.precioBase?.message} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="duracionMinutos">Duración (minutos) *</Label>
                                <Input
                                    id="duracionMinutos"
                                    type="number"
                                    min="15"
                                    step="1"
                                    placeholder="45"
                                    {...register("duracionMinutos")}
                                />
                                <FormError message={errors.duracionMinutos?.message} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Imagen *</Label>
                            <ImageUpload
                                value={imagenActual}
                                previewUrl={
                                    // Prioriza la vista previa local del archivo recién seleccionado;
                                    // si no, resuelve la imagen existente contra el CDN configurado en VITE_IMAGE_URL
                                    vistaPrevia ??
                                    (imagenActual
                                        ? `${import.meta.env.VITE_IMAGE_URL}/${imagenActual}`
                                        : null)
                                }
                                onChange={handleImagenChange}
                                onError={setErrorImagen}
                                disabled={enviando}
                            />
                            <FormError message={errors.imagen?.message} />
                            {errorImagen && <FormError message={errorImagen} />}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => navigate("/tratamientos")}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={enviando}>
                                <Save className="mr-1 h-4 w-4" />
                                {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear tratamiento"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    )
}

TratamientoFormPage.propTypes = {
    modo: PropTypes.oneOf(["crear", "editar"]).isRequired,
}
