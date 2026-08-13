import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ArrowRight, Pencil, Trash2 } from "lucide-react";

import { Link } from 'react-router-dom';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import toast from "react-hot-toast"
import { useAuth } from "@/auth/useAuth"

export function EventCard({ event }) {
    const URL = import.meta.env.VITE_IMAGE_URL
    const { hasRole } = useAuth()
    const canManageEvents = hasRole(["Administrador"])
    function handleDeleteEvent(event) {
        /*
        En esta clase no se llama al API porque todavía no existe
        una acción real para eliminar.
        Cuando exista el endpoint DELETE, se podría usar:
        await deleteEvent(event.id)
        Para el proyecto final se recomienda eliminación lógica:
        await updateEvent(event.id, {
            ...event,
            isActive: false
        })
        */
        toast.success(
            `El evento "${event.title}" fue eliminado de forma simulada.`
        )
    }
    return (
        <Card className="relative group overflow-hidden border-border bg-card text-card-foreground hover:border-primary/50 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                    src={`${URL}/${event.imageUrl}?width=300&height=200&resize=contain`}
                    alt={event.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
            </div>
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {event.title}
                </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary/70" />
                    <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    <span className="line-clamp-1">{event.location}</span>
                </div>
            </CardContent>

            <CardFooter className="pt-3">
                <div className="flex items-center justify-end gap-2">
                    {/* Ver detalle */}
                    <Button
                        asChild
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 bg-secondary/40 transition-colors hover:bg-accent"
                    >
                        <Link to={`/events/${event.id}`} title="Ver detalles">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>

                    {canManageEvents && (
                        <>
                            {/* Editar */}
                            <Button
                                asChild
                                size="icon"
                                variant="outline"
                                className="h-9 w-9 bg-secondary/40 transition-colors hover:bg-accent"
                            >
                                <Link to={`/events/${event.id}/edit`} title="Editar evento">
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            {/* Eliminar */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        title="Eliminar evento"
                                        className="h-9 w-9 border-destructive/30 bg-destructive/5 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Desea eliminar este evento?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción solo será simulada. En el proyecto final deberán implementar la eliminación lógica cambiando el estado del evento a inactivo.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDeleteEvent(event)}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Sí, eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

EventCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
    }).isRequired,
};

