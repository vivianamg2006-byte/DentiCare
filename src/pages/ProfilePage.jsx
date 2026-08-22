import { useEffect, useState } from "react"
import { Mail, Phone, CalendarClock, ShieldCheck, Hash } from "lucide-react"
import toast from "react-hot-toast"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/PageHeader"
import { ErrorState } from "@/components/shared/ErrorState"
import { TableLoading } from "@/components/shared/CardsLoading"
import { useAuth } from "@/auth/useAuth"
import { obtenerPerfil } from "@/services/authService"
import { nombreCompleto, iniciales, formatFechaCorta } from "@/lib/format"

// Etiquetas legibles según el rol que devuelve el API
const ETIQUETAS_ROL = {
    Administrador: "Administrador(a) de la clínica",
    Empleado: "Especialista / Odontólogo(a)",
    Cliente: "Paciente",
}

/**
 * Página de perfil del usuario autenticado.
 *
 * Arranca con los datos del contexto y luego refresca contra el endpoint
 * de perfil (petición autenticada con Bearer token vía obtenerPerfil),
 * para mostrar siempre la información vigente. Si el usuario tiene datos
 * de empleado asociados, muestra también su código de especialista.
 *
 * @component
 */
export function ProfilePage() {
    const { user: usuarioContexto } = useAuth()
    const [perfil, setPerfil] = useState(usuarioContexto)
    const [error, setError] = useState(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        // Evita setState sobre un componente ya desmontado
        let activo = true
        async function cargar() {
            setCargando(true)
            setError(null)
            try {
                const data = await obtenerPerfil()
                if (activo) setPerfil(data)
            } catch (e) {
                if (activo) {
                    setError(e.message)
                    toast.error(e.message || "No se pudo cargar el perfil.")
                }
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => {
            activo = false
        }
    }, [])

    if (cargando) return <TableLoading rows={3} />
    if (error && !perfil) return <ErrorState message={error} />

    // Si el perfil trae datos de empleado, es un especialista/odontólogo
    const esEmpleado = Boolean(perfil?.empleado)

    return (
        <section className="mx-auto max-w-2xl space-y-6">
            <PageHeader
                title="Mi perfil"
                description="Datos de la cuenta con la que inició sesión."
            />
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">{iniciales(perfil)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle>{nombreCompleto(perfil)}</CardTitle>
                        <CardDescription>
                            {ETIQUETAS_ROL[perfil?.rol?.nombre] ?? perfil?.rol?.nombre}
                        </CardDescription>
                        <Badge variant="secondary" className="w-fit">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            {perfil?.rol?.nombre}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Correo electrónico</p>
                                <p className="text-sm font-medium">{perfil?.correo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Teléfono</p>
                                <p className="text-sm font-medium">{perfil?.telefono || "—"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Identificador</p>
                                <p className="text-sm font-medium">#{perfil?.id}</p>
                            </div>
                        </div>
                        {esEmpleado && (
                            <div className="flex items-center gap-2">
                                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Código de especialista</p>
                                    <p className="text-sm font-medium">{perfil.empleado.codigoEmpleado}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {perfil?.creadoEn && (
                        <>
                            <Separator />
                            <p className="text-xs text-muted-foreground">
                                Cuenta registrada el {formatFechaCorta(String(perfil.creadoEn).slice(0, 10))}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
