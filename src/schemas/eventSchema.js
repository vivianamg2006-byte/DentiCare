import { z } from "zod"
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
]
export const eventSchema = z.object({
    title: z.string()
        .min(3, "El título debe tener al menos 3 caracteres.")
        .max(80, "El título no debe superar 80 caracteres."),
    description: z.string()
        .min(10, "La descripción debe tener al menos 10 caracteres."),
    date: z.string()
        .min(1, "La fecha y hora son obligatorias.")
        .refine((value) => new Date(value) > new Date(), {
            message: "Debe seleccionar una fecha futura."
        }),
    location: z.string()
        .min(3, "La ubicación debe tener al menos 3 caracteres."),
    modality: z.enum(["Presencial", "Virtual", "Híbrido"], {
        message: "Debe seleccionar una modalidad válida."
    }),
    totalCapacity: z.coerce.number()
        .int("La capacidad debe ser un número entero.")
        .min(1, "La capacidad debe ser mayor a 0."),
    isActive: z.boolean(),
    categoryId: z.coerce.number()
        .int("Debe seleccionar una categoría.")
        .min(1, "Debe seleccionar una categoría."),
    organizerId: z.coerce.number()
        .int("Debe seleccionar un organizador.")
        .min(1, "Debe seleccionar un organizador."),

    tagIds: z.array(z.coerce.number()).optional(),
    imageUrl: z
        .any()
        .refine((files) => files?.length === 1, {
            message: "Debe seleccionar una imagen."
        })
        .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, {
            message: "La imagen no debe superar los 2 MB."
        })
        .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), {
            message: "Solo se permiten imágenes JPG, PNG o WEBP."
        })
});