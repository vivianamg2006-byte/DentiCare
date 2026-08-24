import { Link, Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { FormError } from "@/components/FormError"
import { useAuth } from "@/auth/useAuth"
import { registroSchema, aPayloadRegistro } from "@/schemas/registroSchema"

/**
 * Página de registro de pacientes.
 *
 * Crea cuentas con rol Cliente (paciente) en el backend. Valida los datos
 * con registroSchema (incluye reglas de contraseña y confirmación) y
 * transforma el formulario al payload del API con aPayloadRegistro.
 * Al terminar con éxito redirige a /login; si ya hay sesión, vuelve al home.
 *
 * @component
 */
export function RegisterPage() {
    const { registerUser, isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            nombre: "",
            primerApellido: "",
            segundoApellido: "",
            correo: "",
            telefono: "",
            password: "",
            confirmPassword: "",
        },
    })

    // Un usuario ya autenticado no debería volver a registrarse
    if (!loading && isAuthenticated) {
        return <Navigate to="/" replace />
    }

    async function onSubmit(data) {
        try {
            // El formulario incluye confirmPassword, que se descarta al armar el payload del API
            await registerUser(aPayloadRegistro(data))
            toast.success("Registro exitoso. Ahora puede iniciar sesión.")
            navigate("/login")
        } catch (error) {
            toast.error(error.message || "No se pudo registrar el paciente.")
        }
    }

    return (
        <section className="mx-auto max-w-xl">
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Registro de pacientes</CardTitle>
                    <CardDescription>
                        Cree su cuenta como paciente de la clínica DentiCare para consultar y
                        cancelar sus citas.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <CardContent className="grid gap-5">
                        {/* Datos personales: dos columnas simétricas en pantallas sm+ */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input id="nombre" placeholder="María" {...register("nombre")} />
                                <FormError message={errors.nombre?.message} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="primerApellido">Primer apellido *</Label>
                                <Input id="primerApellido" placeholder="López" {...register("primerApellido")} />
                                <FormError message={errors.primerApellido?.message} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="segundoApellido">Segundo apellido (opcional)</Label>
                                <Input id="segundoApellido" placeholder="Rojas" {...register("segundoApellido")} />
                                <FormError message={errors.segundoApellido?.message} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="telefono">Teléfono (opcional)</Label>
                                <Input id="telefono" placeholder="8888-8888" {...register("telefono")} />
                                <FormError message={errors.telefono?.message} />
                            </div>
                        </div>

                        {/* Correo a lo ancho del formulario */}
                        <div className="grid gap-2">
                            <Label htmlFor="correo">Correo electrónico *</Label>
                            <Input
                                id="correo"
                                type="email"
                                placeholder="maria@correo.com"
                                autoComplete="email"
                                {...register("correo")}
                            />
                            <FormError message={errors.correo?.message} />
                        </div>

                        {/* Credenciales: ambas celdas con estructura idéntica
                            (etiqueta + input + error) para que queden alineadas;
                            la nota de requisitos es compartida y vive fuera de
                            las columnas, así ningún campo queda más alto que otro. */}
                        <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
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
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Registrando…" : "Crear cuenta"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            ¿Ya tiene una cuenta?{" "}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Inicie sesión aquí
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </section>
    )
}
