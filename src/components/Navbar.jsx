import { useEffect, useState } from "react"
import {
    CalendarDays,
    ClipboardList,
    CalendarClock,
    Stethoscope,
    Sparkles,
    Clock,
    ShieldAlert,
    LayoutDashboard,
    Menu,
    Moon,
    Sun,
    User,
    UserPlus,
    LogIn,
    LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NavLink, Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { iniciales } from "@/lib/format"

/**
 * Arma los links del menú según el rol del usuario autenticado:
 * - Base pública: Inicio, Tratamientos y Horarios (para todos).
 * - Cliente: ve "Mis citas" (/citas).
 * - Staff (Admin/Empleado): gestión de citas, especialistas y restricciones.
 * - Empleado con ficha: acceso a su propia agenda (/agenda/{empleadoId}).
 * - Administrador: "Agenda diaria" se inserta al principio del menú.
 */
function getLinks({ isAdmin, isEmpleado, isCliente, empleadoId }) {
    const links = [
        { to: "/", label: "Inicio", end: true },
        { to: "/tratamientos", label: "Tratamientos" },
        { to: "/horarios", label: "Horarios" },
    ]
    if (isCliente) {
        links.push({ to: "/citas", label: "Mis citas" })
    }
    if (isAdmin || isEmpleado) {
        links.push({ to: "/citas", label: "Citas" })
        links.push({ to: "/especialistas", label: "Especialistas" })
        links.push({ to: "/restricciones", label: "Restricciones" })
    }
    if (isEmpleado && empleadoId) {
        links.push({ to: `/agenda/${empleadoId}`, label: "Mi agenda" })
    }
    if (isAdmin) {
        links.unshift({ to: "/agenda-diaria", label: "Agenda diaria", icono: true })
    }
    return links
}

/**
 * Barra de navegación principal de DentiCare.
 *
 * Incluye: branding, links según rol (getLinks), CTA "Nueva cita" para admin,
 * toggle de tema oscuro (persistido en localStorage con la clave "tema"),
 * menú de usuario (perfil/agenda/logout) y menú hamburguesa para móvil.
 */
export function Navbar() {
    const { user, isAuthenticated, logout, rol, empleadoId } = useAuth()
    const navigate = useNavigate()
    // Lazy initializer: leemos el tema guardado UNA sola vez al montar.
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("tema") === "oscuro")
    const [menuAbierto, setMenuAbierto] = useState(false)

    // Flags de rol que simplifican el render condicional de más abajo.
    const isAdmin = rol === "Administrador"
    const isEmpleado = rol === "Empleado"
    const isCliente = rol === "Cliente"
    const links = getLinks({ isAdmin, isEmpleado, isCliente, empleadoId })

    // Aplica/quita la clase "dark" en <html> y persiste la preferencia
    // para que el tema sobreviva recargas.
    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode)
        localStorage.setItem("tema", darkMode ? "oscuro" : "claro")
    }, [darkMode])

    // Al cerrar sesión mandamos a Inicio para no dejar al usuario
    // en una ruta que ahora sería privada.
    function handleLogout() {
        logout()
        navigate("/")
    }

    function handlePerfil() {
        navigate("/perfil")
    }

    // Estilo del link: píldora resaltada si es la ruta activa.
    const linkClass = ({ isActive }) =>
        `rounded-full px-3 py-1.5 text-sm transition-colors ${
            isActive
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`

    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
                {/* Branding: logo + nombre con acento de color en "Care". */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                        Denti<span className="text-primary">Care</span>
                    </h1>
                </Link>

                {/* Navegación en pantallas grandes */}
                <div className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <NavLink key={link.to + link.label} to={link.to} end={link.end} className={linkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {/* CTA de creación de cita: visible solo para admin en desktop
                        (en móvil lo habilita el menú hamburguesa también para empleado). */}
                    {isAdmin && isAuthenticated && (
                        <Button
                            asChild
                            size="sm"
                            className="hidden rounded-full md:inline-flex"
                            variant="outline"
                        >
                            <Link to="/citas/nueva">
                                <CalendarClock className="h-4 w-4" />
                                Nueva cita
                            </Link>
                        </Button>
                    )}

                    {/* Toggle de tema: el icono muestra lo que pasaría al hacer clic. */}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDarkMode((prev) => !prev)}
                        aria-label="Cambiar tema"
                        className="rounded-full border-border bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    {/* Menú de usuario: contenido distinto según haya sesión o no. */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="gap-2 rounded-full border-border bg-background hover:bg-accent hover:text-accent-foreground"
                            >
                                <Avatar size="sm">
                                    <AvatarFallback>
                                        {isAuthenticated ? iniciales(user) : <User className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
                                    {isAuthenticated ? user?.nombre : "Invitado"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {isAuthenticated ? (
                                <>
                                    <DropdownMenuLabel>
                                        <p className="truncate text-sm font-semibold">{user?.correo}</p>
                                        <p className="text-xs font-normal text-muted-foreground">
                                            Rol: {rol}
                                        </p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={handlePerfil}>
                                        <User className="h-4 w-4" />
                                        Mi perfil
                                    </DropdownMenuItem>
                                    {/* Solo tiene sentido para empleados con ficha en el API. */}
                                    <DropdownMenuItem disabled={!isEmpleado || !empleadoId} onSelect={() => navigate(`/agenda/${empleadoId}`)}>
                                        <LayoutDashboard className="h-4 w-4" />
                                        Mi agenda
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onSelect={handleLogout}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Cerrar sesión
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuLabel>
                                        <p className="text-sm font-semibold">Invitado</p>
                                        <p className="text-xs font-normal text-muted-foreground">
                                            Sin sesión iniciada
                                        </p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => navigate("/login")}>
                                        <LogIn className="h-4 w-4" />
                                        Iniciar sesión
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => navigate("/registro")}>
                                        <UserPlus className="h-4 w-4" />
                                        Registrarse
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Menú móvil */}
                    <DropdownMenu open={menuAbierto} onOpenChange={setMenuAbierto}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Abrir menú de navegación"
                                className="lg:hidden rounded-full border-border bg-background"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 lg:hidden">
                            {links.map((link) => (
                                <DropdownMenuItem key={link.to + link.label} onSelect={() => navigate(link.to)}>
                                    <CalendarDays className="h-4 w-4" />
                                    {link.label}
                                </DropdownMenuItem>
                            ))}
                            {!isAuthenticated && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => navigate("/login")}>
                                        <LogIn className="h-4 w-4" />
                                        Iniciar sesión
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => navigate("/registro")}>
                                        <ClipboardList className="h-4 w-4" />
                                        Registrarse
                                    </DropdownMenuItem>
                                </>
                            )}
                            {isAuthenticated && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => navigate("/citas/nueva")} disabled={!(isAdmin || isEmpleado)}>
                                        <Sparkles className="h-4 w-4" />
                                        Nueva cita
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => navigate("/perfil")}>
                                        <Clock className="h-4 w-4" />
                                        Mi perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={handleLogout}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <ShieldAlert className="h-4 w-4" />
                                        Cerrar sesión
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>
        </header>
    )
}
