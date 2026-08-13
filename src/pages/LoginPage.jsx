import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
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
import { Alert } from "@/components/ui/alert"
import toast from "react-hot-toast"
import { useAuth } from "@/auth/useAuth"

export function LoginPage() {
    const { login, isAuthenticated } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    if (isAuthenticated) {
        return <Navigate to="/events" replace />
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        if (!email.trim() || !password) {
            setError("Debe ingresar su correo y contraseña.")
            return
        }
        setLoading(true)
        try {
            await login(email, password)
            toast.success("Inicio de sesión correcto.")
            const previousRoute = location.state?.from?.pathname
            navigate(previousRoute || "/events", { replace: true })
        } catch (loginError) {
            setError(loginError.message || "No se pudo iniciar sesión.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="mx-auto max-w-md">
            <Card className="border-border/70 shadow-sm">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
                    <CardDescription>
                        Ingrese sus credenciales para acceder al sistema.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} noValidate>
                    <CardContent className="grid gap-4">
                        {error && (
                            <Alert variant="destructive">{error}</Alert>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            ¿No tiene una cuenta?{" "}
                            <Link to="/register" className="font-medium text-primary hover:underline">
                                Regístrese aquí
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </section>
    )
}
