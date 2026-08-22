import { z } from "zod"

// El Select de especialidades entrega strings; coerce convierte a número entero positivo
const idSchema = z.coerce
    .number({ message: "Debe seleccionar una opción." })
    .int("El identificador debe ser un número entero.")
    .positive("El identificador debe ser válido.")

/**
 * Validación del formulario de tratamientos.
 *
 * precioBase: mayor a 0, tope 99999999.99 (colones CRC). duracionMinutos:
 * entero entre 15 y 480 (máximo 8 horas), límites que usa el motor de
 * citas para calcular slots disponibles.
 */
export const servicioSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe contener al menos 3 caracteres.")
        .max(120, "El nombre no puede superar 120 caracteres."),
    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe contener al menos 10 caracteres.")
        .max(500, "La descripción no puede superar 500 caracteres."),
    precioBase: z.coerce
        .number({ message: "El precio debe ser numérico." })
        .positive("El precio debe ser mayor a cero.")
        .max(99999999.99, "El precio no puede superar 99,999,999.99."),
    duracionMinutos: z.coerce
        .number({ message: "La duración es obligatoria." })
        .int("La duración debe ser un número entero.")
        .min(15, "La duración mínima es de 15 minutos.")
        .max(480, "La duración no puede superar 8 horas (480 minutos)."),
    especialidadId: idSchema,
})

/**
 * Validación del formulario de servicios adicionales.
 *
 * A diferencia del tratamiento, aquí el precio admite 0 (nonegative)
 * y no hay duración ni especialidad: son insumos/complementos de cita.
 */
export const adicionalSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe contener al menos 3 caracteres.")
        .max(120, "El nombre no puede superar 120 caracteres."),
    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe contener al menos 10 caracteres.")
        .max(500, "La descripción no puede superar 500 caracteres."),
    precio: z.coerce
        .number({ message: "El precio debe ser numérico." })
        .nonnegative("El precio debe ser mayor o igual a cero.")
        .max(99999999.99, "El precio no puede superar 99,999,999.99."),
})
