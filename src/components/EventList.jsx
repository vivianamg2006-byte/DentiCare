import PropTypes from "prop-types";
import { EventCard } from "./EventCard";

export function EventList({ events }) {    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}
EventList.propTypes = {
    events: PropTypes.array.isRequired,
};

