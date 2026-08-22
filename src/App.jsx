import { Outlet } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Footer } from "@/components/Footer"
import { Navbar } from "@/components/Navbar"

/**
 * Layout raíz de la aplicación (ruta contenedora en main.jsx).
 * Todas las páginas se renderizan dentro de <Outlet>, envueltas
 * por la barra de navegación y el pie de página.
 */
export default function App() {
    return (
        // min-h-screen + flex column: empuja el Footer al fondo aunque
        // la página tenga poco contenido.
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            {/* Notificaciones globales (toasts) compartidas por toda la app. */}
            <Toaster
                position="bottom-right"
                toastOptions={{ duration: 3000 }}
            />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
