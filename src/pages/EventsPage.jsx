import { useState, useEffect } from "react";
import { EventList } from "../components/EventList";
import { getEvents } from "../services/eventsService";
import { PageHeader } from "@/components/PageHeader";
import { SearchBar } from "@/components/SearchBar";
import { Alert, AlertDescription } from "@/components/ui/alert";


export function EventsPage() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                setLoading(true);
                const data = await getEvents();
                console.log(data);
                setEvents(data.data);
            } catch (error) {
                console.error("Error al cargar eventos", error);
                setError("Error al cargar eventos");
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    // Filtrar eventos por título
    const filteredEvents = events.filter((event) =>
        event.title.toLowerCase().includes(search.toLowerCase())
    );
   
    if (loading) {
        return (
            <p className="text-center text-muted-foreground">
                Cargando eventos...
            </p>
        );
    }
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    return (
        <section>
            <PageHeader
                title="Eventos"
                description={filteredEvents.length}
                isBadge={true}
            />

            <SearchBar value={search} onChange={setSearch} />
            {filteredEvents.length === 0 ? (
                <p className="text-center text-muted-foreground">
                    No hay resultados
                </p>
            ) : (
                <EventList events={filteredEvents} />
            )}
        </section>
    );
}
