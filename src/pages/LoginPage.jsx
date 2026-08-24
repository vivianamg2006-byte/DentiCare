import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Stethoscope } from "lucide-react"

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
import { loginSchema } from "@/schemas/loginSchema"

/**
 * Página de inicio de sesión.
 *
 * Valida las credenciales con el schema Zod, delega la autenticación al
 * contexto (AuthProvider) y redirige: si el usuario ya está logueado va
 * a la pantalla de inicio; tras un login exitoso vuelve a la ruta que
 * intentaba visitar (si llegó desde un guardia) o cae por defecto en /.
 *
 * @component
 */
export function LoginPage() {
    const { login, isAuthenticated, loading } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { correo: "", password: "" } })

    // Si ya hay sesión activa, no tiene sentido mostrar el formulario
    if (!loading && isAuthenticated) {
        return <Navigate to="/" replace />
    }

    async function onSubmit(data) {
        try {
            await login(data.correo, data.password)
            toast.success("Inicio de sesión correcto.")
            // Vuelve a la ruta protegida que originó el login; si no existe,
            // siempre cae en la pantalla de inicio.
            const destino = location.state?.from?.pathname || "/"
            navigate(destino, { replace: true })
        } catch (error) {
            toast.error(error.message || "No se pudo iniciar sesión.")
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
                    <CardDescription>
                        Ingrese sus credenciales para acceder al sistema de citas de DentiCare.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="correo">Correo electrónico</Label>
                            <Input
                                id="correo"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                autoComplete="email"
                                {...register("correo")}
                            />
                            <FormError message={errors.correo?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                {...register("password")}
                            />
                            <FormError message={errors.password?.message} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            ¿No tiene una cuenta?{" "}
                            <Link to="/registro" className="font-medium text-primary hover:underline">
                                Regístrese aquí
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </section>
    )
}
