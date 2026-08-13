import { z } from "zod";

export const createRegistrationSchema = z.object({
    eventId: z
        .number({
            message: "El evento es obligatorio",
        })
        .int("El evento debe ser un número entero")
        .positive("El evento es obligatorio"),

    userId: z
        .number({
            message: "El usuario es obligatorio",
        })
        .int("El usuario debe ser un número entero")
        .positive("El usuario es obligatorio"),

    statusId: z
        .number()
        .int("El estado debe ser un número entero")
        .positive("El estado debe ser válido")
        .optional(),
});

export const updateRegistrationSchema = z.object({
    statusId: z
        .number({
            message: "El estado es obligatorio",
        })
        .int("El estado debe ser un número entero")
        .positive("El estado debe ser válido"),
});

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationDto = z.infer<typeof updateRegistrationSchema>;