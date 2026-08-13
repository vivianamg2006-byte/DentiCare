import PropTypes from "prop-types"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    CalendarDays,
    Image,
    MapPin,
    Text,
    Type,
    Users,
    Tags,
    Monitor,
    Hash
} from "lucide-react"

import { eventSchema } from "../schemas/eventSchema"
import { FormError } from "./FormError"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { Controller, useForm } from "react-hook-form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import { Badge } from '@/components/ui/badge'
import { useState } from "react"

export function EventForm({
    onSubmit,
    categories,
    organizers,
    tags,
    initialData = null,
    submitText = "Registrar evento"
}) {
    const [imagePreview, setImagePreview] = useState(
        initialData?.imageUrl
            ? `${import.meta.env.VITE_IMAGE_URL}/${initialData.imageUrl}`
            : null
    )
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            date: initialData?.date
                ? initialData.date.slice(0, 16)
                : "",
            location: initialData?.location || "",
            modality: initialData?.modality || "Presencial",
            totalCapacity: initialData?.totalCapacity || 1,
            isActive: initialData?.isActive ?? true,
            imageUrl: undefined,
            categoryId: initialData?.categoryId
                ? String(initialData.categoryId)
                : "",
            organizerId: initialData?.organizerId
                ? String(initialData.organizerId)
                : "",
            tagIds: initialData?.tags
                ? initialData.tags.map((tag) => String(tag.id))
                : []
        }
    })
    function handleImageChange(event) {
        const file = event.target.files?.[0]
        if (!file) {
            setImagePreview(null)
            return
        }
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
    }

    function handleValidSubmit(formData) {
        const file = formData.imageUrl?.[0]
        const dataToSend = {
            ...formData,
            imageUrl: file || initialData?.imageUrl
        }
        console.log("Datos enviados:", dataToSend)

        onSubmit(dataToSend)
    }


    return (
        <Card className="mx-auto max-w-4xl border-border/70 shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Datos del evento</CardTitle>
                <CardDescription>
                    Complete la información principal. En la próxima clase estos datos se enviarán a la API.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleValidSubmit)}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label htmlFor="title" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Type className="h-4 w-4 text-primary" />
                                Título del evento
                            </label>
                            <Input
                                id="title"
                                placeholder="Ej: Conferencia React"
                                className={errors.title ? "border-destructive" : ""}
                                {...register("title")}
                            />

                            <FormError message={errors.title?.message} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Text className="h-4 w-4 text-primary" />
                                Descripción
                            </label>
                            <Textarea
                                id="description"
                                placeholder="Describa brevemente el evento"
                                rows={4}
                                className={errors.description ? "border-destructive" : ""}
                                {...register("description")}
                            />

                            <FormError message={errors.description?.message} />
                        </div>
                        <div>
                            <label htmlFor="date" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                Fecha y hora
                            </label>
                            <Input
                                id="date"
                                type="datetime-local"
                                className={errors.date ? "border-destructive" : ""}
                                {...register("date")}
                            />
                            <FormError message={errors.date?.message} />
                        </div>

                        <div>
                            <label htmlFor="location" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <MapPin className="h-4 w-4 text-primary" />
                                Ubicación
                            </label>
                            <Input
                                id="location"
                                placeholder="Ej: San José"
                                className={errors.location ? "border-destructive" : ""}
                                {...register("location")}
                            />
                            <FormError message={errors.location?.message} />
                        </div>

                        <div>
                            <label htmlFor="modality" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Monitor className="h-4 w-4 text-primary" />
                                Modalidad
                            </label>
                            <select
                                id="modality"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                {...register("modality")}
                            >
                                <option value="Presencial">Presencial</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                            <FormError message={errors.modality?.message} />
                        </div>

                        <div>
                            <label htmlFor="totalCapacity" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4 text-primary" />
                                Capacidad total
                            </label>
                            <Input
                                id="totalCapacity"
                                type="number"
                                min="1"
                                placeholder="Ej: 100"
                                className={errors.totalCapacity ? "border-destructive" : ""}
                                {...register("totalCapacity")}
                            />
                            <FormError message={errors.totalCapacity?.message} />
                        </div>

                        <div>
                            <label htmlFor="categoryId" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Hash className="h-4 w-4 text-primary" />
                                Categoría
                            </label>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Seleccione una categoría" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                En la próxima clase se cargará desde la API.
                            </p>
                            <FormError message={errors.categoryId?.message} />
                        </div>

                        <div>
                            <label htmlFor="organizerId" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Users className="h-4 w-4 text-primary" />
                                Organizador
                            </label>
                            <Controller
                                name="organizerId"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={errors.organizerId ? "border-destructive" : ""}>
                                            <SelectValue placeholder="Seleccione un organizador" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {organizers.map((organizer) => (
                                                <SelectItem key={organizer.id} value={String(organizer.id)}>
                                                    {organizer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                En la próxima clase se cargará desde la API.
                            </p>
                            <FormError message={errors.organizerId?.message} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <Tags className="h-4 w-4 text-primary" />
                                Etiquetas
                            </label>
                            <div className="rounded-xl border bg-muted/20 p-4">
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <label
                                            key={tag.id}
                                            className="flex cursor-pointer items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
                                        >
                                            <input
                                                type="checkbox"
                                                value={tag.id}
                                                className="h-4 w-4 accent-primary"
                                                {...register("tagIds")}
                                            />

                                            <Badge variant="secondary">{tag.name}</Badge>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    En la próxima clase estas etiquetas se cargarán desde la API.
                                </p>

                                <FormError message={errors.tagIds?.message} />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label
                                htmlFor="imageUrl"
                                className="mb-2 flex items-center gap-2 text-sm font-medium"
                            >
                                <Image className="h-4 w-4 text-primary" />
                                Imagen del evento
                            </label>
                            <div
                                className={`grid gap-4 rounded-xl border border-dashed bg-muted/30 p-4 transition-colors md:grid-cols-[220px_1fr] ${errors.imageUrl
                                    ? "border-destructive"
                                    : "border-border hover:border-primary/60"
                                    }`}
                            >
                                <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border bg-background">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Vista previa del evento"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-center text-muted-foreground">
                                            <Image className="mb-2 h-10 w-10" />
                                            <span className="text-sm font-medium">Vista previa</span>
                                            <span className="text-xs">Sin imagen seleccionada</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center gap-3">
                                    <div>
                                        <Input
                                            id="imageUrl"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            {...register("imageUrl", {
                                                onChange: handleImageChange
                                            })}
                                        />

                                        <label
                                            htmlFor="imageUrl"
                                            className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                        >
                                            Seleccionar imagen
                                        </label>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Subir imagen del evento</p>
                                        <p className="text-xs text-muted-foreground">
                                            En esta clase solo se selecciona el archivo. La vista previa real y la carga al servidor se implementarán después.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Formatos recomendados: PNG, JPG o WEBP.
                                        </p>
                                    </div>
                                    <FormError message={errors.imageUrl?.message} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 md:col-span-2">
                            <input
                                id="isActive"
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                {...register("isActive")}
                            />

                            <div>
                                <label htmlFor="isActive" className="text-sm font-medium">
                                    Evento activo
                                </label>
                                <p className="text-xs text-muted-foreground">
                                    Si está activo, el evento podrá mostrarse en el listado público.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            reset();
                            setImagePreview(null);
                        }}
                    >
                        Limpiar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {submitText}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
EventForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired,
    organizers: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    initialData: PropTypes.object,
    submitText: PropTypes.string
}

