import { z } from "zod";

export const createEventTagSchema = z.object({
    eventId: z
        .number({
            message: "El evento es obligatorio",
        })
        .int("El evento debe ser un número entero")
        .positive("El evento es obligatorio"),

    tagId: z
        .number({
            message: "La etiqueta es obligatoria",
        })
        .int("La etiqueta debe ser un número entero")
        .positive("La etiqueta es obligatoria"),
});

export const updateEventTagSchema = createEventTagSchema.partial();

export type CreateEventTagDto = z.infer<typeof createEventTagSchema>;
export type UpdateEventTagDto = z.infer<typeof updateEventTagSchema>;