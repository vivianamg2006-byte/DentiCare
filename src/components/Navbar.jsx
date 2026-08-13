import { useEffect, useState } from "react";
import { CalendarDays, Moon, Sun, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

function getInitials(fullName) {
    if (!fullName) {
        return "?";
    }
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const initials = parts
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    return initials || "?";
}

export function Navbar() {
    const { user, isAuthenticated, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true);
    const linkClass = ({ isActive }) =>
        isActive
            ? "text-primary font-semibold"
            : "rounded-full px-4 text-muted-foreground hover:bg-primary hover:text-primary-foreground";

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    function toggleTheme() {
        setDarkMode((prev) => !prev);
    }

    const canManageEvents = hasRole(["Administrador"]);

    return (
        <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CalendarDays className="h-5 w-5" />
                    </div>

                    <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                        Sistema de{" "}
                        <span className="text-primary">Eventos</span>
                    </h1>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 p-1 shadow-sm">
                    <NavLink to="/" className={linkClass}>
                        Inicio
                    </NavLink>
                    <NavLink to="/events" className={linkClass}>
                        Eventos
                    </NavLink>
                    {canManageEvents && (
                        <NavLink to="/create" className={linkClass}>
                            Crear evento
                        </NavLink>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="gap-2 rounded-full border-border bg-background hover:bg-accent hover:text-accent-foreground"
                            >
                                <Avatar size="sm">
                                    <AvatarFallback>
                                        {isAuthenticated ? getInitials(user?.fullName) : <User className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="max-w-32 truncate text-sm font-medium">
                                    {isAuthenticated ? user?.fullName : "Invitado"}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {isAuthenticated ? (
                                <>
                                    <DropdownMenuLabel>
                                        <p className="truncate text-sm font-semibold">{user?.fullName}</p>
                                        <p className="truncate text-xs font-normal text-muted-foreground">
                                            Rol: {user?.role?.name}
                                        </p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled>
                                        <LogIn className="h-4 w-4" />
                                        Iniciar sesión
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled>
                                        <UserPlus className="h-4 w-4" />
                                        Registrarse
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onSelect={() => logout()}
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
                                    <DropdownMenuItem onSelect={() => navigate("/register")}>
                                        <UserPlus className="h-4 w-4" />
                                        Registrarse
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled>
                                        <LogOut className="h-4 w-4" />
                                        Cerrar sesión
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Cambiar tema"
                        className="rounded-full border-border bg-background hover:bg-accent hover:text-accent-foreground"
                    >
                        {darkMode ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </nav>
        </header>
    );
}
