const API_URL = import.meta.env.VITE_API_URL;
export async function getEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        if (!response.ok) {
            throw new Error();
        }
        return await response.json();
    } catch {
        throw new Error("Error al obtener eventos");
    }
}
export async function getEventById(id) {
    try {
        const response = await fetch(`${API_URL}/events/${id}`);
        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            throw new Error("Error al obtener el evento");
        }
        return await response.json();
    } catch {
        throw new Error("No se pudo cargar el detalle del evento.");
    }
}
export async function createEvent(eventData) {
    try {
        const response = await fetch(`${API_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventData)
        });
        //Presentar más detalle del error en la consola para depuración
        if (!response.ok) {
            const data = await response.json()
            console.error("========== ERROR API ==========")
            console.error(data);
            console.error(data.detail?.stack);
            console.error("===============================")
            throw new Error(
                JSON.stringify(data, null, 2)
            );
        }
        return await response.json();
    } catch {
        throw new Error("No se pudo crear el evento.");
    }
}
export async function updateEvent(id, eventData) {
    try {
        const response = await fetch(`${API_URL}/events/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventData)
        })
        if (!response.ok) {
            const data = await response.json()
            console.error("========== ERROR API UPDATE ==========")
            console.error(data)
            console.error(data.detail?.stack)
            console.error("======================================")

            throw new Error(
                JSON.stringify(data, null, 2)
            )
        }
        return await response.json()
    } catch {
        throw new Error("No se pudo actualizar el evento.")
    }
}
export async function deleteEvent(id) {
    /*
    IMPORTANTE:
    Esta función queda como referencia para cuando el API tenga DELETE.
    Ejemplo real:
    const response = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE"
    })
    if (!response.ok) {
        throw new Error("No se pudo eliminar el evento.")
    }
    return await response.json()
    */
    console.log("Simulación de eliminación del evento con id:", id)
}
