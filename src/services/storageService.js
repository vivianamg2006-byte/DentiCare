const API_URL = import.meta.env.VITE_API_URL

export async function uploadEventImage(
    file,
    previousFileName = null
) {
    if (!file) return null
    const formData = new FormData()
    formData.append("image", file)
    if (previousFileName) {
        formData.append(
            "previousFileName",
            previousFileName
        )
    }
    try {
        const response = await fetch(
            `${API_URL}/images/upload`,
            {
                method: "POST",
                body: formData,
            }
        )
        if (!response.ok) {
            throw new Error()
        }
        const data = await response.json()
        return data.fileName
    } catch {
        throw new Error(
            "No se pudo subir la imagen."
        )
    }
}