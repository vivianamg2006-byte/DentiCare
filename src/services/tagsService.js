const API_URL = import.meta.env.VITE_API_URL;

export async function getTags() {
    try {
        const response = await fetch(`${API_URL}/tags`);

        if (!response.ok) {
            throw new Error();
        }

        return await response.json();
    } catch (error) {
        throw new Error("No se pudieron cargar las etiquetas.");
    }
}