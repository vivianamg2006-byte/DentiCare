import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarClock, ShieldCheck, Sparkles, Stethoscope, Smile } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/auth/useAuth"
import { listarHorariosAtencion } from "@/services/horariosService"
import { formatHora } from "@/lib/format"

const DIAS_ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

/**
 * Página de inicio (landing) pública de DentiCare.
 *
 * Muestra el hero con acciones distintas según autenticación y rol,
 * tarjetas de características y el horario general de atención agrupado
 * por día, cargado desde la API (solo se muestran los rangos activos).
 *
 * @component
 */
export function HomePage() {
    const { isAuthenticated, rol } = useAuth()
    const [horarios, setHorarios] = useState([])
    const [cargandoHorarios, setCargandoHorarios] = useState(true)

    useEffect(() => {
        // Bandera para evitar actualizar estado si el componente se desmonta antes de responder
        let activo = true
        // Contenido secundario: si la carga falla, se omite sin mostrar error al usuario
        listarHorariosAtencion()
            .then((data) => {
                if (activo) setHorarios(Array.isArray(data) ? data.filter((h) => h.activo) : [])
            })
            .catch(() => {})
            .finally(() => {
                if (activo) setCargandoHorarios(false)
            })
        return () => {
            activo = false
        }
    }, [])

    // Agrupa los rangos por día (respetando el orden de la semana) y ordena cada grupo por hora de inicio;
    // los días sin rangos configurados no se muestran
    const horarioAgrupado = DIAS_ORDEN.map((dia) => ({
        dia,
        rangos: horarios
            .filter((h) => h.diaSemana?.nombre === dia)
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
    })).filter((grupo) => grupo.rangos.length > 0)

    return (
        <section className="space-y-12">
            {/* Hero */}
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-gradient-to-b from-primary/10 to-background p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Stethoscope className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                        Clínica Dental <span className="text-primary">DentiCare</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Cuidamos tu sonrisa con especialistas certificados en odontología general,
                        ortodoncia, endodoncia y más. Gestiona tus citas de forma rápida y sencilla.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {!isAuthenticated && (
                        <>
                            <Button asChild size="lg">
                                <Link to="/registro">Registrarme como paciente</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link to="/login">Iniciar sesión</Link>
                            </Button>
                        </>
                    )}
                    {(rol === "Administrador" || rol === "Empleado") && (
                        <Button asChild size="lg">
                            <Link to="/citas/nueva">
                                <CalendarClock className="mr-2 h-5 w-5" />
                                Registrar una cita
                            </Link>
                        </Button>
                    )}
                    {isAuthenticated && rol !== "Administrador" && rol !== "Empleado" && (
                        <Button asChild size="lg">
                            <Link to="/tratamientos">Ver tratamientos</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Características */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-foreground">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <CardTitle>Especialistas calificados</CardTitle>
                        <CardDescription>
                            Odontólogos e higienistas con ficha clínica y tratamientos verificados
                            por la clínica.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-foreground">
                            <CalendarClock className="h-5 w-5" />
                        </div>
                        <CardTitle>Citas sin traslapes</CardTitle>
                        <CardDescription>
                            El sistema valida horarios de atención, restricciones y disponibilidad
                            de cada especialista antes de confirmar tu cita.
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-foreground">
                            <Smile className="h-5 w-5" />
                        </div>
                        <CardTitle>Tratamientos completos</CardTitle>
                        <CardDescription>
                            Desde limpiezas hasta cirugía oral, con servicios adicionales como
                            radiografías y anestesia extra.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Horario de atención */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        Horario de atención
                    </CardTitle>
                    <CardDescription>Horario general de la clínica.</CardDescription>
                </CardHeader>
                <CardContent>
                    {cargandoHorarios ? (
                        <p className="text-sm text-muted-foreground">Cargando horarios…</p>
                    ) : horarioAgrupado.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            El horario aún no ha sido configurado.
                        </p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {horarioAgrupado.map((grupo) => (
                                <li key={grupo.dia} className="flex items-center justify-between py-2 text-sm">
                                    <span className="font-medium">{grupo.dia}</span>
                                    <span className="text-muted-foreground">
                                        {grupo.rangos
                                            .map((r) => `${formatHora(r.horaInicio)} – ${formatHora(r.horaFin)}`)
                                            .join(" · ")}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Seguridad */}
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Acceso protegido por roles: pacientes consultan sus citas; especialistas gestionan
                su agenda; la administración controla toda la clínica.
            </div>
        </section>
    )
}
