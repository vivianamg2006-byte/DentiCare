import { useEffect, useMemo, useState } from "react"
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
import { MultiServiciosSelect } from "@/components/shared/MultiServiciosSelect"
import { empleadoSchema, aPayloadEmpleado } from "@/schemas/empleadoSchema"
import { listarEspecialidades } from "@/services/especialidadesService"
import { listarServiciosActivos } from "@/services/serviciosService"
import { listarEmpleados, crearEmpleado, obtenerEmpleado, actualizarEmpleado } from "@/services/empleadosService"
import { listarUsuarios } from "@/services/authService"
import { nombreCompleto } from "@/lib/format"

/**
 * Formulario compartido para crear o editar la ficha de un especialista.
 * Recibe `modo` ("crear" | "editar"); en edición toma el :id de la ruta,
 * precarga la ficha con sus tratamientos y valida todo con empleadoSchema.
 */
export function EspecialistaFormPage({ modo }) {
    // Cualquier modo distinto de "editar" se comporta como creación
    const esEdicion = modo === "editar"
    const { id } = useParams()
    const navigate = useNavigate()

    const [usuariosDisponibles, setUsuariosDisponibles] = useState([])
    const [especialidades, setEspecialidades] = useState([])
    const [servicios, setServicios] = useState([])
    const [servicioIds, setServicioIds] = useState([])
    const [cargando, setCargando] = useState(true)
    const [errorCarga, setErrorCarga] = useState(null)

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(empleadoSchema),
        defaultValues: {
            usuarioId: "",
            especialidadId: "",
            codigoEmpleado: "",
            descripcion: "",
        },
    })

    // Carga inicial en paralelo: catálogos + usuarios sin ficha (y la ficha actual si editamos)
    useEffect(() => {
        // Bandera anti-carrera: si el componente se desmonta, ignoramos toda respuesta
        let activo = true
        async function cargar() {
            try {
                const [listaUsuarios, listaEspecialidades, listaServicios, listaEmpleados] =
                    await Promise.all([
                        listarUsuarios("Empleado"),
                        listarEspecialidades(),
                        listarServiciosActivos(),
                        listarEmpleados(),
                    ])
                if (!activo) return

                setEspecialidades(listaEspecialidades.filter((e) => e.activo))
                setServicios(listaServicios)

                // Usuarios con rol Empleado que aún no tienen ficha asignada
                const usuariosConFicha = new Set(
                    listaEmpleados
                        .filter((e) => (esEdicion ? e.id !== Number(id) : true))
                        .map((e) => e.usuarioId)
                )
                const disponibles = listaUsuarios.filter(
                    (u) => u.activo && !usuariosConFicha.has(u.id)
                )
                setUsuariosDisponibles(disponibles)

                if (esEdicion) {
                    const empleado = await obtenerEmpleado(id)
                    if (!activo) return
                    reset({
                        usuarioId: String(empleado.usuarioId),
                        especialidadId: String(empleado.especialidadId),
                        codigoEmpleado: empleado.codigoEmpleado,
                        descripcion: empleado.descripcion ?? "",
                    })
                    setServicioIds(empleado.servicios?.map((s) => s.id) ?? [])
                    // En edición, incluir también el usuario ya asignado
                    setUsuariosDisponibles((prev) =>
                        prev.some((u) => u.id === empleado.usuarioId)
                            ? prev
                            : [empleado.usuario, ...prev]
                    )
                }
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

    // Mantener servicioIds sincronizado para la validación zod
    useEffect(() => {
        setValue("servicioIds", servicioIds, { shouldValidate: false })
    }, [servicioIds, setValue])

    const resumenSeleccion = useMemo(
        () =>
            servicios
                .filter((s) => servicioIds.includes(s.id))
                .map((s) => s.nombre),
        [servicios, servicioIds]
    )

    // Mismo handler para ambos modos: lo que cambia es el service que se invoca
    async function onSubmit(data) {
        try {
            if (esEdicion) {
                await actualizarEmpleado(id, aPayloadEmpleado(data))
                toast.success("Especialista actualizado correctamente.")
            } else {
                await crearEmpleado(aPayloadEmpleado(data))
                toast.success("Especialista creado correctamente.")
            }
            navigate("/especialistas")
        } catch (e) {
            toast.error(e.message || "No se pudo guardar el especialista.")
        }
    }

    if (cargando) return <div className="h-96 animate-pulse rounded-xl bg-muted" />
    if (errorCarga) return <ErrorState message={errorCarga} />

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <PageHeader
                title={esEdicion ? "Editar especialista" : "Nuevo especialista"}
                description={
                    esEdicion
                        ? "Modifique la ficha del especialista y sus tratamientos."
                        : "Registre la ficha de un nuevo odontólogo o higienista."
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Datos del especialista</CardTitle>
                    <CardDescription>Los campos marcados con * son obligatorios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Usuario (rol Empleado) *</Label>
                                <Controller
                                    control={control}
                                    name="usuarioId"
                                    render={({ field }) => (
                                        <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione un usuario…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {usuariosDisponibles.length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                                        No hay usuarios Empleado disponibles sin ficha.
                                                    </div>
                                                )}
                                                {usuariosDisponibles.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>
                                                        {nombreCompleto(u)} ({u.correo})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError message={errors.usuarioId?.message} />
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
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="codigoEmpleado">Código de empleado *</Label>
                                <Input
                                    id="codigoEmpleado"
                                    placeholder="DR-001"
                                    {...register("codigoEmpleado")}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Letras, números y guiones. Ejemplo: DR-001, HIG-001.
                                </p>
                                <FormError message={errors.codigoEmpleado?.message} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                                <Textarea
                                    id="descripcion"
                                    rows={3}
                                    placeholder="Odontólogo general con 10 años de experiencia…"
                                    {...register("descripcion")}
                                />
                                <FormError message={errors.descripcion?.message} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Tratamientos que atiende *</Label>
                            <MultiServiciosSelect
                                servicios={servicios}
                                seleccionados={servicioIds}
                                onChange={setServicioIds}
                            />
                            {resumenSeleccion.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Seleccionados: {resumenSeleccion.join(", ")}
                                </p>
                            )}
                            {errors.servicioIds && (
                                <FormError message={errors.servicioIds.message} />
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" onClick={() => navigate("/especialistas")}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="mr-1 h-4 w-4" />
                                {isSubmitting ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear especialista"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    )
}

EspecialistaFormPage.propTypes = {
    modo: PropTypes.oneOf(["crear", "editar"]).isRequired,
}
