import { Navigate, useNavigate, Link } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import toast from "react-hot-toast"
import { useAuth } from "@/auth/useAuth"
import { registerSchema } from "@/schemas/registerSchema"

export function RegisterPage() {
    const { registerUser, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    if (isAuthenticated) {
        return <Navigate to="/events" replace />
    }

    async function handleValidSubmit(formData) {
        try {
            await registerUser({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
            })
            toast.success("Usuario registrado correctamente. Ahora puede iniciar sesión.")
            navigate("/login", { replace: true })
        } catch (error) {
            toast.error(error.message || "No se pudo registrar el usuario.")
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Crear cuenta</CardTitle>
                    <CardDescription>
                        Regístrese para acceder al sistema de eventos.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(handleValidSubmit)} noValidate>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Nombre completo</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Ej: Ana Rodríguez"
                                autoComplete="name"
                                className={errors.fullName ? "border-destructive" : ""}
                                {...register("fullName")}
                            />
                            <FormError message={errors.fullName?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                autoComplete="email"
                                className={errors.email ? "border-destructive" : ""}
                                {...register("email")}
                            />
                            <FormError message={errors.email?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                                className={errors.password ? "border-destructive" : ""}
                                {...register("password")}
                            />
                            <FormError message={errors.password?.message} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repita su contraseña"
                                autoComplete="new-password"
                                className={errors.confirmPassword ? "border-destructive" : ""}
                                {...register("confirmPassword")}
                            />
                            <FormError message={errors.confirmPassword?.message} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Registrando..." : "Registrarse"}
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
