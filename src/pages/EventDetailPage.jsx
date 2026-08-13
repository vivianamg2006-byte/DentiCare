import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    CalendarDays,
    MapPin,
    ArrowLeft,
    Users,
    Tag,
    Building2,
    Monitor
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { getEventById } from "../services/eventsService";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
export function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        async function loadEvent() {
            try {
                setLoading(true);
                setError("");
                const data = await getEventById(id);
                if (!data) {
                    setEvent(null);
                    return;
                }
                setEvent(data.data);
            } catch {
                setError("Ocurrió un error al cargar el evento.");
            } finally {
                setLoading(false);
            }
        }
        loadEvent();
    }, [id]);
    if (loading) {
        return <p className="text-muted-foreground">Cargando detalle...</p>;
    }
    if (error) {
        return <Alert>{error}</Alert>;
    }
    if (!event) {
        return (
            <section className="space-y-4">
                <PageHeader
                    title="Evento no encontrado"
                    description="No existe un evento asociado al identificador solicitado."
                />
                <Button asChild variant="outline">
                    <Link to="/events">Volver al listado de eventos</Link>
                </Button>
            </section>
        );
    }

    const inscritos = event.registrations?.length ?? 0;
    const cuposDisponibles = event.totalCapacity - inscritos;

    return (
        <section className="space-y-6">
            <Button asChild variant="outline">
                <Link to="/events">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al listado de eventos
                </Link>
            </Button>

            <PageHeader
                title={event.title}
                description="Información detallada del evento seleccionado"
            />

            <Card className="overflow-hidden">
                {event.imageUrl && (
                    <img
                        src={`${IMAGE_URL}/${event.imageUrl}`}
                        alt={event.title}
                        className="h-72 w-full object-cover"
                    />
                )}

                <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                    {event.description && (
                        <p className="leading-relaxed text-muted-foreground">
                            {event.description}
                        </p>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <p className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            {new Date(event.date).toLocaleDateString("es-CR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </p>

                        <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {event.location}
                        </p>

                        <p className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-primary" />
                            Modalidad: {event.modality}
                        </p>

                        <p className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            {inscritos} inscritos / {event.totalCapacity} cupos
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-2 font-semibold">Cupos disponibles</h3>
                        <p className="text-muted-foreground">
                            {cuposDisponibles > 0
                                ? `${cuposDisponibles} cupos disponibles`
                                : "No hay cupos disponibles"}
                        </p>
                    </div>
                    {event.category && (
                        <div>
                            <h3 className="mb-2 font-semibold">Categoría</h3>
                            <p className="text-muted-foreground">
                                {event.category.name}
                            </p>
                        </div>
                    )}
                    {event.tags?.length > 0 && (
                        <div>
                            <h3 className="mb-2 font-semibold">Etiquetas</h3>
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                                    >
                                        <Tag className="h-3 w-3" />
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {event.organizer && (
                        <div className="rounded-lg border p-4">
                            <h3 className="mb-2 flex items-center gap-2 font-semibold">
                                <Building2 className="h-4 w-4 text-primary" />
                                Organizador
                            </h3>
                            <p className="font-medium">{event.organizer.name}</p>
                            {event.organizer.description && (
                                <p className="text-sm text-muted-foreground">
                                    {event.organizer.description}
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}