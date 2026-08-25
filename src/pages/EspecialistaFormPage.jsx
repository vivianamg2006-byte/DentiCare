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
import {
    crearEspecialistaSchema,
    editarEspecialistaSchema,
    aPayloadEmpleado,
    aPayloadNuevoUsuario,
} from "@/schemas/empleadoSchema"
import { listarEspecialidades } from "@/services/especialidadesService"
import { listarServiciosActivos } from "@/services/serviciosService"
import { crearEmpleado, obtenerEmpleado, actualizarEmpleado } from "@/services/empleadosService"
import { crearUsuario } from "@/services/authService"
import { listarRoles } from "@/services/rolesService"

/**
 * Formulario compartido para crear o editar la ficha de un especialista.
 * Recibe `modo` ("crear" | "editar"); en edición toma el :id de la ruta,
 * precarga la ficha con sus tratamientos y valida todo con los schemas.
 *
 * Al crear no se elige un usuario existente: se registra la cuenta nueva
 * (nombre, correo, contraseña) siempre con el rol "Empleado" resuelto del
 * API, y luego se vincula a la ficha del especialista.
 */
export function EspecialistaFormPage({ modo }) {
    // Cualquier modo distinto de "editar" se comporta como creación
    const esEdicion = modo === "editar"
    const { id } = useParams()
    const navigate = useNavigate()

    // Id del rol "Empleado" resuelto desde el API; el especialista siempre
    // se crea con este rol (no es seleccionable en el formulario).
    const [rolEmpleadoId, setRolEmpleadoId] = useState(null)
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
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        // En creación se valida también la cuenta nueva; en edición, la ficha
        resolver: zodResolver(esEdicion ? editarEspecialistaSchema : crearEspecialistaSchema),
        defaultValues: {
            usuarioId: "",
            nombre: "",
            primerApellido: "",
            segundoApellido: "",
            correo: "",
            telefono: "",
            password: "",
            confirmPassword: "",
            especialidadId: "",
            codigoEmpleado: "",
            descripcion: "",
        },
    })

    // El API rechaza fichas con tratamientos de otra especialidad
    // ("Los siguientes servicios no pertenecen a la especialidad seleccionada"),
    // así que el multiselect solo ofrece servicios de la especialidad elegida.
    const especialidadIdActual = watch("especialidadId")
    const serviciosFiltrados = useMemo(
        () =>
            especialidadIdActual
                ? servicios.filter((s) => String(s.especialidadId) === especialidadIdActual)
                : servicios,
        [servicios, especialidadIdActual]
    )

    // Carga inicial en paralelo: catálogos (y la ficha actual si editamos)
    useEffect(() => {
        // Bandera anti-carrera: si el componente se desmonta, ignoramos toda respuesta
        let activo = true
        async function cargar() {
            try {
                const [listaEspecialidades, listaServicios, listaRoles] = await Promise.all([
                    listarEspecialidades(),
                    listarServiciosActivos(),
                    listarRoles(),
                ])
                if (!activo) return

                setEspecialidades(listaEspecialidades.filter((e) => e.activo))
                setServicios(listaServicios)
                // El rol de la cuenta nueva no se elige: se resuelve el rol
                // "Empleado" del catálogo (si no existe, se bloquea la creación
                // en onSubmit con un mensaje claro).
                const rolEmpleado = listaRoles.find((r) => r.activo && r.nombre === "Empleado")
                setRolEmpleadoId(rolEmpleado?.id ?? null)

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
                // Sin el rol "Empleado" no se puede garantizar la consistencia
                // usuario/ficha: se aborta la creación con un mensaje claro.
                if (!rolEmpleadoId) {
                    throw new Error(
                        "No se encontró el rol Empleado. No es posible registrar el especialista."
                    )
                }
                // 1) Alta de la cuenta con el rol Empleado; 2) ficha vinculada a ella
                const nuevoUsuario = await crearUsuario(aPayloadNuevoUsuario(data, rolEmpleadoId))
                await crearEmpleado(aPayloadEmpleado({ ...data, usuarioId: nuevoUsuario.id }))
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
                        : "Registre la cuenta y la ficha de un nuevo odontólogo o higienista."
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Datos del especialista</CardTitle>
                    <CardDescription>Los campos marcados con * son obligatorios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        {/* Cuenta nueva: solo al crear. Grilla responsiva:
                            una columna en móvil y dos desde sm. */}
                        {!esEdicion && (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="correo">Correo electrónico *</Label>
                                        <Input
                                            id="correo"
                                            type="email"
                                            placeholder="ana.rojas@dentcare.com"
                                            autoComplete="off"
                                            {...register("correo")}
                                        />
                                        <FormError message={errors.correo?.message} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="nombre">Nombre *</Label>
                                        <Input id="nombre" placeholder="Ana" {...register("nombre")} />
                                        <FormError message={errors.nombre?.message} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="primerApellido">Primer apellido *</Label>
                                        <Input
                                            id="primerApellido"
                                            placeholder="Rojas"
                                            {...register("primerApellido")}
                                        />
                                        <FormError message={errors.primerApellido?.message} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="segundoApellido">Segundo apellido (opcional)</Label>
                                        <Input
                                            id="segundoApellido"
                                            placeholder="Mora"
                                            {...register("segundoApellido")}
                                        />
                                        <FormError message={errors.segundoApellido?.message} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="telefono">Teléfono (opcional)</Label>
                                        <Input
                                            id="telefono"
                                            placeholder="8888-8888"
                                            {...register("telefono")}
                                        />
                                        <FormError message={errors.telefono?.message} />
                                    </div>
                                </div>

                                {/* Credenciales en bloque propio para alinear password + confirmación */}
                                <div className="grid gap-4 rounded-lg border border-border/70 bg-muted/30 p-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid content-start gap-2">
                                            <Label htmlFor="password">Contraseña *</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                autoComplete="new-password"
                                                {...register("password")}
                                            />
                                            <FormError message={errors.password?.message} />
                                        </div>
                                        <div className="grid content-start gap-2">
                                            <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                {...register("confirmPassword")}
                                            />
                                            <FormError message={errors.confirmPassword?.message} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        La contraseña debe tener mínimo 8 caracteres, incluyendo al menos
                                        una letra mayúscula, una minúscula y un número.
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Especialidad *</Label>
                                <Controller
                                    control={control}
                                    name="especialidadId"
                                    render={({ field }) => (
                                        <Select
                                            value={String(field.value ?? "")}
                                            onValueChange={(valor) => {
                                                field.onChange(valor)
                                                // Al cambiar la especialidad, los tratamientos
                                                // marcados de la anterior ya no son válidos para
                                                // el API: se limpian de la selección.
                                                setServicioIds((prev) =>
                                                    prev.filter((idSeleccionado) =>
                                                        servicios.some(
                                                            (s) =>
                                                                s.id === idSeleccionado &&
                                                                String(s.especialidadId) === valor
                                                        )
                                                    )
                                                )
                                            }}
                                        >
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

                        <div className="grid gap-2">
                            <Label>Tratamientos que atiende *</Label>
                            <MultiServiciosSelect
                                servicios={serviciosFiltrados}
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
