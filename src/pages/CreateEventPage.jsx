import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../components/PageHeader"
import { EventForm } from "../components/EventForm"
import { Alert } from "../components/ui/alert"
import { createEvent } from "../services/eventsService"
import { getCategories } from "@/services/categoriesService"
import { getOrganizers } from "@/services/organizersService"
import { getTags } from "@/services/tagsService"
import toast from "react-hot-toast"
import { uploadEventImage } from "@/services/storageService"

export function CreateEventPage() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [organizers, setOrganizers] = useState([])
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    useEffect(() => {
        async function loadFormData() {
            try {
                setLoading(true)
                const [categoriesData, organizersData, tagsData] = await Promise.all([
                    getCategories(),
                    getOrganizers(),
                    getTags()
                ])
                setCategories(categoriesData.data)
                setOrganizers(organizersData.data)
                setTags(tagsData.data)
            } catch {
                setError("No se pudieron cargar los datos del formulario.")
            } finally {
                setLoading(false)
            }
        }
        loadFormData()
    }, [])
    async function handleCreateEvent(formData) {
        try {
            let imageFileName = "image-not-found.jpg"
            const imageFile =
                formData.imageUrl instanceof File
                    ? formData.imageUrl
                    : formData.imageUrl?.[0]
            if (imageFile) {
                imageFileName = await uploadEventImage(imageFile)
            }
            const eventData = {
                ...formData,
                imageUrl: imageFileName,
                tagIds: formData.tagIds || [],
            }
            const newEvent = await createEvent(eventData)
            toast.success(`El evento "${newEvent.data.title}" fue registrado correctamente.`)
            navigate("/events")
        } catch (error) {
            console.error("Error al crear el evento", error);
            toast.error(error.message);
        }
    }
    if (loading) {
        return <p>Cargando datos del formulario...</p>
    }
    return (
        <section className="space-y-6">
            <PageHeader
                title="Crear evento"
                description="Complete la información del evento y guarde los datos en la API."
            />
            {error && (
                <Alert variant="destructive">
                    {error}
                </Alert>
            )}
            <EventForm
                onSubmit={handleCreateEvent}
                categories={categories}
                organizers={organizers}
                tags={tags}
            />
        </section>
    )
}