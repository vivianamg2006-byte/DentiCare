import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import PropTypes from "prop-types"
import { AlertCircle, CalendarCheck, Save, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Separator } from "@/components/ui/separator"
import { FormError } from "@/components/FormError"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { SlotGrid } from "@/components/citas/SlotGrid"
import { citaFormSchema } from "@/schemas/citaSchema"
import { listarUsuarios } from "@/services/authService"
import { listarServiciosActivos } from "@/services/serviciosService"
import { listarAdicionalesActivos } from "@/services/adicionalesService"
import {
    listarEmpleadosActivos,
} from "@/services/empleadosService"
import {
    crearCita,
    actualizarCita,
    consultarDisponibilidad,
    obtenerCita,
    obtenerAgendaEmpleado,
} from "@/services/citasService"
import { listarEstadosCita } from "@/services/estadosCitaService"
import { useAuth } from "@/auth/useAuth"
import {
    formatCurrency,
    formatDuracion,
    hoyISO,
    nombreCompleto,
} from "@/lib/format"

export function CitaFormPage({ modo }) {
    const esEdicion = modo === "editar"
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    // Catálogos
    const [pacientes, setPacientes] = useState([])
    const [servicios, setServicios] = useState([])
    const [adicionales, setAdicionales] = useState([])
    const [estados, setEstados] = useState([])

    // Dependencias del formulario
    const [especialistas, setEspecialistas] = useState([])
    const [agenda, setAgenda] = useState(null)
    const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([])
    const [errorDisponibilidad, setErrorDisponibilidad] = useState("")
    const [verificando, setVerificando] = useState(false)
    const [cargandoInicial, setCargandoInicial] = useState(true)
    const [cargandoAgenda, setCargandoAgenda] = useState(false)
    const [errorCarga, setErrorCarga] = useState(null)

 const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors },
} = useForm({
        resolver: zodResolver(citaFormSchema),
        defaultValues: {
            clienteId: "",
            servicioId: "",
            empleadoId: "",
            fecha: hoyISO(),
            horaInicio: "",
            horaFin: "",
            observaciones: "",
        },
    })

    const servicioIdActual = watch("servicioId")
    const empleadoIdActual = watch("empleadoId")
    const fechaActual = watch("fecha")
    const horaInicioActual = watch("horaInicio")

    /* ---------- Carga inicial ---------- */
    useEffect(() => {
        let activo = true
        async function cargarIniciales() {
            setCargandoInicial(true)
            try {
                const [listaPacientes, listaServicios, listaAdicionales, listaEstados] =
                    await Promise.all([
                        listarUsuarios("Cliente"),
                        listarServiciosActivos(),
                        listarAdicionalesActivos(),
                        listarEstadosCita(),
                    ])
                if (!activo) return
                setPacientes(listaPacientes.filter((p) => p.activo))
                setServicios(listaServicios)
                setAdicionales(listaAdicionales)
                setEstados(listaEstados)

                if (esEdicion) {
                    const cita = await obtenerCita(id)
                    if (!activo) return
                    reset({
                        clienteId: String(cita.clienteId),
                        servicioId: String(cita.servicioId),
                        empleadoId: String(cita.empleadoId),
                        fecha: cita.fecha,
                        horaInicio: cita.horaInicio,
                        horaFin: cita.horaFin,
                        observaciones: cita.observaciones ?? "",
                    })
                    setAdicionalesSeleccionados(
                        cita.adicionales?.map((a) => a.id) ?? []
                    )
                }
            } catch (e) {
                if (activo) setErrorCarga(e.message)
            } finally {
                if (activo) setCargandoInicial(false)
            }
        }
        cargarIniciales()
        return () => {
            activo = false
        }
    }, [esEdicion, id, reset])

    /* ---------- Especialistas que pueden atender el servicio ---------- */
    useEffect(() => {
        if (!servicioIdActual) {
            setEspecialistas([])
            return
        }
        let activo = true
        async function cargarEspecialistas() {
            try {
                const lista = await listarEmpleadosActivos(servicioIdActual)
                if (!activo) return
                setEspecialistas(lista)
// Si el especialista actual ya no puede atender el servicio, se limpia.
// OJO: setValue de react-hook-form NO admite una función
// "actualizadora" como el setState de React; hay que calcular
// el valor primero y pasarlo ya resuelto.
                const valorActual = getValues("empleadoId")
                const sigueValido = lista.some((e) => String(e.id) === valorActual)
                if (!sigueValido) {
                setValue("empleadoId", "")
                }
            } catch (e) {
                if (activo) toast.error(e.message || "No se pudieron cargar los especialistas.")
            }
        }
        cargarEspecialistas()
        return () => {
            activo = false
        }
    }, [servicioIdActual, setValue, getValues])

    /* ---------- Agenda del especialista para la fecha elegida ---------- */
    const cargarAgenda = useCallback(async () => {
        if (!empleadoIdActual || !fechaActual) {
            setAgenda(null)
            return
        }
        setCargandoAgenda(true)
        try {
            const data = await obtenerAgendaEmpleado(empleadoIdActual, fechaActual)
            setAgenda(data)
        } catch (e) {
            setAgenda(null)
            toast.error(e.message || "No se pudo consultar la agenda del especialista.")
        } finally {
            setCargandoAgenda(false)
        }
    }, [empleadoIdActual, fechaActual])

    useEffect(() => {
        cargarAgenda()
    }, [cargarAgenda])

    /* ---------- Cálculos automáticos ---------- */
    const servicioSeleccionado = useMemo(
        () => servicios.find((s) => s.id === Number(servicioIdActual)) ?? null,
        [servicios, servicioIdActual]
    )

    const adicionalesElegidos = useMemo(
        () => adicionales.filter((a) => adicionalesSeleccionados.includes(a.id)),
        [adicionales, adicionalesSeleccionados]
    )

    const precioServicio = Number(servicioSeleccionado?.precioBase ?? 0)
    const costoAdicionales = useMemo(
        () => adicionalesElegidos.reduce((total, a) => total + Number(a.precio), 0),
        [adicionalesElegidos]
    )
    const costoTotal = precioServicio + costoAdicionales
    const duracionMinutos = servicioSeleccionado?.duracionMinutos ?? 0

    function toggleAdicional(idAdicional) {
        setAdicionalesSeleccionados((prev) =>
            prev.includes(idAdicional)
                ? prev.filter((a) => a !== idAdicional)
                : [...prev, idAdicional] // los duplicados son imposibles por construcción
        )
    }

    function seleccionarHora(inicio, fin) {
        setValue("horaInicio", inicio, { shouldValidate: true })
        setValue("horaFin", fin, { shouldValidate: true })
        setErrorDisponibilidad("")
    }

    /* ---------- Envío ---------- */
    async function onSubmit(data) {
        setErrorDisponibilidad("")
        setVerificando(true)
        try {
            // Paso previo obligatorio: verificar disponibilidad contra el API
            const resultado = await consultarDisponibilidad({
                empleadoId: Number(data.empleadoId),
                servicioId: Number(data.servicioId),
                fecha: data.fecha,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                ...(esEdicion ? { citaIdExcluir: Number(id) } : {}),
            })

            if (!resultado.disponible) {
                setErrorDisponibilidad(resultado.motivo || "El horario seleccionado no está disponible.")
                toast.error(resultado.motivo || "El horario seleccionado no está disponible.")
                return
            }

            const datosComunes = {
                clienteId: Number(data.clienteId),
                empleadoId: Number(data.empleadoId),
                servicioId: Number(data.servicioId),
                fecha: data.fecha,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                duracionMinutos,
                precioServicio,
                costoAdicionales,
                costoTotal,
                observaciones: data.observaciones?.trim() ? data.observaciones.trim() : null,
                adicionalIds: adicionalesSeleccionados,
            }

            if (esEdicion) {
                await actualizarCita(id, datosComunes)
                toast.success("Cita actualizada correctamente.")
            } else {
                const estadoPendiente = estados.find((e) => e.nombre === "Pendiente")
                await crearCita({
                    ...datosComunes,
                    estadoCitaId: estadoPendiente?.id ?? 1,
                    creadoPorUsuarioId: user.id,
                })
                toast.success("Cita registrada correctamente.")
            }
            navigate("/citas")
        } catch (e) {
            toast.error(e.message || "No se pudo guardar la cita.")
        } finally {
            setVerificando(false)
        }
    }

    // Validación en cadena antes de enviar (los errores dependen unos de otros)
    async function submitConValidacion(e) {
        e.preventDefault()
        const esValido = await trigger()
        if (!esValido) {
            toast.error("Revise los campos marcados antes de continuar.")
            return
        }
        handleSubmit(onSubmit)(e)
    }

    if (cargandoInicial) return <div className="h-[600px] animate-pulse rounded-xl bg-muted" />
    if (errorCarga) return <ErrorState message={errorCarga} />

    return (
        <section className="mx-auto max-w-4xl space-y-6">
            <PageHeader
                title={esEdicion ? "Editar cita" : "Nueva cita"}
                description="Complete el proceso paso a paso: paciente, tratamiento, adicionales, especialista, fecha y hora."
            />

            <form onSubmit={submitConValidacion} noValidate className="space-y-6">
                {/* 1. Paciente y tratamiento */}
                <Card>
                    <CardHeader>
                        <CardTitle>1 · Paciente y tratamiento</CardTitle>
                        <CardDescription>
                            Seleccione el paciente y el tratamiento principal; precio y duración se muestran automáticamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Paciente *</Label>
                            <Controller
                                control={control}
                                name="clienteId"
                                render={({ field }) => (
                                    <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione el paciente…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pacientes.map((paciente) => (
                                                <SelectItem key={paciente.id} value={String(paciente.id)}>
                                                    {nombreCompleto(paciente)} ({paciente.correo})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError message={errors.clienteId?.message} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Tratamiento principal *</Label>
                            <Controller
                                control={control}
                                name="servicioId"
                                render={({ field }) => (
                                    <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione el tratamiento…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {servicios.map((servicio) => (
                                                <SelectItem key={servicio.id} value={String(servicio.id)}>
                                                    {servicio.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError message={errors.servicioId?.message} />
                        </div>

                        {servicioSeleccionado && (
                            <div className="sm:col-span-2 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                                <Badge variant="secondary">
                                    Precio base: {formatCurrency(precioServicio)}
                                </Badge>
                                <Badge variant="secondary">
                                    Duración: {formatDuracion(duracionMinutos)}
                                </Badge>
                                <span className="text-muted-foreground">
                                    {servicioSeleccionado.descripcion}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Servicios adicionales */}
                <Card>
                    <CardHeader>
                        <CardTitle>2 · Servicios adicionales</CardTitle>
                        <CardDescription>
                            Los adicionales aumentan el costo total, pero nunca la duración de la cita.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {adicionales.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay servicios adicionales disponibles.</p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {adicionales.map((adicional) => (
                                    <label
                                        key={adicional.id}
                                        htmlFor={`adicional-${adicional.id}`}
                                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                                    >
                                        <span className="flex items-center gap-3">
                                            <input
                                                id={`adicional-${adicional.id}`}
                                                type="checkbox"
                                                checked={adicionalesSeleccionados.includes(adicional.id)}
                                                onChange={() => toggleAdicional(adicional.id)}
                                                className="h-4 w-4 accent-[var(--primary)]"
                                            />
                                            <span>
                                                <span className="block text-sm font-medium">{adicional.nombre}</span>
                                                <span className="block text-xs text-muted-foreground line-clamp-1">
                                                    {adicional.descripcion}
                                                </span>
                                            </span>
                                        </span>
                                        <span className="text-sm font-semibold">{formatCurrency(adicional.precio)}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        <Separator />

                        {/* Resumen de costos recalculado dinámicamente */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Precio del tratamiento</span>
                                <span>{formatCurrency(precioServicio)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Servicios adicionales ({adicionalesElegidos.length})</span>
                                <span>{formatCurrency(costoAdicionales)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-base font-bold">
                                <span>Total a pagar</span>
                                <span className="text-primary">{formatCurrency(costoTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Especialista, fecha y hora */}
                <Card>
                    <CardHeader>
                        <CardTitle>3 · Especialista, fecha y hora</CardTitle>
                        <CardDescription>
                            Solo se listan especialistas activos que puedan atender el tratamiento. Los bloques ocupados
                            o restringidos no pueden seleccionarse.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Especialista *</Label>
                                <Controller
                                    control={control}
                                    name="empleadoId"
                                    render={({ field }) => (
                                        <Select
                                            value={String(field.value ?? "")}
                                            onValueChange={(valor) => {
                                                field.onChange(valor)
                                                setValue("horaInicio", "")
                                                setValue("horaFin", "")
                                                setErrorDisponibilidad("")
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue
                                                    placeholder={
                                                        servicioIdActual
                                                            ? "Seleccione el especialista…"
                                                            : "Primero seleccione un tratamiento…"
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {especialistas.map((especialista) => (
                                                    <SelectItem key={especialista.id} value={String(especialista.id)}>
                                                        {nombreCompleto(especialista.usuario)} ·{" "}
                                                        {especialista.especialidad?.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError message={errors.empleadoId?.message} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fecha">Fecha *</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    min={hoyISO()}
                                    {...register("fecha", {
                                        onChange: () => {
                                            setValue("horaInicio", "")
                                            setValue("horaFin", "")
                                            setErrorDisponibilidad("")
                                        },
                                    })}
                                />
                                <FormError message={errors.fecha?.message} />
                            </div>
                        </div>

                        {(empleadoIdActual || fechaActual) && (
                            <div className="rounded-xl border border-border bg-background p-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <Label>Horas disponibles *</Label>
                                    {cargandoAgenda && (
                                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Search className="h-3 w-3 animate-pulse" />
                                            Consultando agenda…
                                        </span>
                                    )}
                                </div>
                                {!empleadoIdActual ? (
                                    <p className="text-sm text-muted-foreground">
                                        Seleccione primero un especialista para ver su disponibilidad.
                                    </p>
                                ) : !fechaActual ? (
                                    <p className="text-sm text-muted-foreground">Seleccione una fecha.</p>
                                ) : cargandoAgenda ? (
                                    <div className="h-24 animate-pulse rounded-lg bg-muted" />
                                ) : agenda ? (
                                    <>
                                        <SlotGrid
                                            fecha={fechaActual}
                                            duracionMinutos={duracionMinutos}
                                            horarios={agenda.horarios}
                                            citas={agenda.citas}
                                            restricciones={agenda.restricciones}
                                            value={horaInicioActual}
                                            onChange={seleccionarHora}
                                        />
                                        {agenda.restricciones?.length > 0 && (
                                            <ul className="mt-4 space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                                                {agenda.restricciones.map((restriccion) => (
                                                    <li key={`r-${restriccion.id}`}>
                                                        ⛔ {restriccion.motivo} —{" "}
                                                        {restriccion.todoElDia
                                                            ? "todo el día"
                                                            : `${restriccion.horaInicio} – ${restriccion.horaFin}`}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : null}
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="horaInicio">Hora de inicio *</Label>
                                        <Input id="horaInicio" readOnly value={horaInicioActual || ""} placeholder="Seleccione un bloque disponible" />
                                        <FormError message={errors.horaInicio?.message} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="horaFin">Hora de fin (automática)</Label>
                                        <Input id="horaFin" readOnly value={watch("horaFin") || ""} placeholder="—" />
                                        <FormError message={errors.horaFin?.message} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {errorDisponibilidad && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Sin disponibilidad</AlertTitle>
                                <AlertDescription>{errorDisponibilidad}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* 4. Observaciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>4 · Observaciones</CardTitle>
                        <CardDescription>Notas adicionales para el especialista (opcional).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            id="observaciones"
                            rows={3}
                            placeholder="El paciente solicita atención puntual…"
                            {...register("observaciones")}
                        />
                        <FormError message={errors.observaciones?.message} />
                    </CardContent>
                </Card>

                {/* Acciones finales */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <p className="mr-auto text-sm text-muted-foreground">
                        Total: <span className="font-bold text-primary">{formatCurrency(costoTotal)}</span>
                        {" · "}
                        Duración: {formatDuracion(duracionMinutos)}
                        {esEdicion && (
                            <>
                                {" · "}
                                Se excluirá esta misma cita al validar disponibilidad.
                            </>
                        )}
                    </p>
                    <Button type="button" variant="ghost" onClick={() => navigate("/citas")}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={verificando}>
                        {esEdicion ? <Save className="mr-1 h-4 w-4" /> : <CalendarCheck className="mr-1 h-4 w-4" />}
                        {verificando
                            ? "Verificando disponibilidad…"
                            : esEdicion
                              ? "Guardar cambios"
                              : "Registrar cita"}
                    </Button>
                </div>
            </form>
        </section>
    )
}

CitaFormPage.propTypes = {
    modo: PropTypes.oneOf(["crear", "editar"]).isRequired,
}
