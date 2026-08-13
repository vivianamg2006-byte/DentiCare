import { z } from "zod";

const today = new Date();

export const createEventSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, "El título debe tener al menos 5 caracteres")
        .max(150, "El título no puede superar 150 caracteres"),

    description: z
        .string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(1000, "La descripción no puede superar 1000 caracteres"),

    date: z
        .string()
        .trim()
        .refine((value) => !isNaN(Date.parse(value)), {
            message: "La fecha debe tener un formato válido",
        })
        .refine((value) => new Date(value) > today, {
            message: "La fecha del evento debe ser futura",
        }),

    categoryId: z
        .number({
            message: "La categoría es obligatoria",
        })
        .int("La categoría debe ser un número entero")
        .positive("La categoría es obligatoria"),
    organizerId: z
    .number({
        message: "El organizador es obligatorio",
    })
    .int()
    .positive(),
    location: z
        .string()
        .trim()
        .min(3, "La ubicación debe tener al menos 3 caracteres")
        .max(150, "La ubicación no puede superar 150 caracteres"),

    modality: z.enum(["Presencial", "Virtual", "Híbrido"], {
        message: "La modalidad debe ser Presencial, Virtual o Híbrido",
    }),

    totalCapacity: z
        .number({
            message: "La capacidad debe ser numérica",
        })
        .int("La capacidad debe ser un número entero")
        .min(1, "La capacidad debe ser al menos 1")
        .max(1000, "La capacidad no puede superar 1000 personas"),

    isActive: z.boolean().optional(),

    imageUrl: z
        .string()
        .trim()
        .max(255, "La URL o nombre de imagen no puede superar 255 caracteres")
        .optional()
        .nullable(),

    tagIds: z
        .array(z.number().int().positive("La etiqueta debe ser válida"))
        .optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;