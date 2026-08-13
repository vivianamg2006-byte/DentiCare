import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"

import { PageHeader } from "../components/PageHeader"
import { EventForm } from "../components/EventForm"
import { Alert } from "../components/ui/alert"

import { getEventById, updateEvent } from "../services/eventsService"
import { getCategories } from "@/services/categoriesService"
import { getOrganizers } from "@/services/organizersService"
import { getTags } from "@/services/tagsService"
import { uploadEventImage } from "@/services/storageService"
export function EditEventPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [event, setEvent] = useState(null)
    const [categories, setCategories] = useState([])
    const [organizers, setOrganizers] = useState([])
    const [tags, setTags] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    useEffect(() => {
        async function loadEditData() {
            try {
                setLoading(true)

                const [
                    eventData,
                    categoriesData,
                    organizersData,
                    tagsData
                ] = await Promise.all([
                    getEventById(id),
                    getCategories(),
                    getOrganizers(),
                    getTags()
                ])

                if (!eventData) {
                    setError("El evento solicitado no existe.")
                    return
                }

                setEvent(eventData.data)
                setCategories(categoriesData.data)
                setOrganizers(organizersData.data)
                setTags(tagsData.data)

            } catch {
                setError("No se pudieron cargar los datos para editar el evento.")
            } finally {
                setLoading(false)
            }
        }

        loadEditData()
    }, [id])
    async function handleUpdateEvent(formData) {
        try {
            let imageFileName = event.imageUrl || "image-not-found.jpg"
            const imageFile =
                formData.imageUrl instanceof File
                    ? formData.imageUrl
                    : formData.imageUrl?.[0]
            if (imageFile) {
                imageFileName = await uploadEventImage(
                    imageFile,
                    event.imageUrl
                )
            }
            const eventData = {
                ...formData,
                imageUrl: imageFileName,
                tagIds: formData.tagIds || []
            }
            const updatedEvent = await updateEvent(id, eventData)
            toast.success(
                `El evento "${updatedEvent.data.title}" fue actualizado correctamente.`
            )
            navigate("/events")
        } catch (error) {
            console.error("Error al actualizar el evento", error)
            toast.error(error.message)
        }
    }
    if (loading) {
        return <p>Cargando datos del evento...</p>
    }
    if (error) {
        return (
            <Alert variant="destructive">
                {error}
            </Alert>
        )
    }
    return (
        <section className="space-y-6">
            <PageHeader
                title="Editar evento"
                description="Modifique la información del evento seleccionado."
            />

            <EventForm
                onSubmit={handleUpdateEvent}
                categories={categories}
                organizers={organizers}
                tags={tags}
                initialData={event}
                submitText="Actualizar evento"
            />
        </section>
    )
}