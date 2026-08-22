import { z } from "zod"

const idSchema = z.coerce
    .number({ message: "Debe seleccionar una opción." })
    .int("El identificador debe ser un número entero.")
    .positive("Debe seleccionar una opción.")

const fechaSchema = z
    .string({ message: "La fecha es obligatoria." })
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener un formato válido.")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), {
        message: "La fecha no es válida.",
    })

const horaSchema = z
    .string({ message: "La hora es obligatoria." })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato HH:mm.")

export const citaFormSchema = z
    .object({
        clienteId: idSchema,
        servicioId: idSchema,
        empleadoId: idSchema,
        fecha: fechaSchema.refine(
            (value) => {
                const input = new Date(`${value}T00:00:00`)
                const hoy = new Date()
                input.setHours(0, 0, 0, 0)
                hoy.setHours(0, 0, 0, 0)
                return input >= hoy
            },
            { message: "La fecha no puede ser pasada." }
        ),
        horaInicio: horaSchema,
        horaFin: horaSchema,
        observaciones: z
            .union([
                z
                    .string()
                    .trim()
                    .min(3, "Las observaciones deben contener al menos 3 caracteres.")
                    .max(500, "Las observaciones no pueden superar 500 caracteres."),
                z.literal(""),
            ])
            .optional(),
    })
    .refine((data) => data.horaInicio < data.horaFin, {
        path: ["horaFin"],
        message: "La hora de finalización debe ser mayor que la hora de inicio.",
    })

export const cancelarCitaSchema = z.object({
    motivoCancelacion: z
        .string()
        .trim()
        .min(5, "El motivo debe contener al menos 5 caracteres.")
        .max(255, "El motivo no puede superar 255 caracteres."),
})
