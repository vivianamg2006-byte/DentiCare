import { z } from "zod"

/**
 * Validación de la ficha de empleado/especialista para alta y edición.
 * La consume EspecialistaFormPage vía zodResolver (react-hook-form).
 * Ojo: los selects entregan strings, por eso los ids usan z.coerce.
 */
export const empleadoSchema = z.object({
    usuarioId: z.coerce
        .number({ message: "Debe seleccionar un usuario." })
        .int()
        .positive("Debe seleccionar un usuario."),
    especialidadId: z.coerce
        .number({ message: "Debe seleccionar una especialidad." })
        .int()
        .positive("Debe seleccionar una especialidad."),
    // Código tipo DR-001: entre 3 y 30 caracteres de letras, números, "-" y "_"
    codigoEmpleado: z
        .string()
        .trim()
        .min(3, "El código debe contener al menos 3 caracteres.")
        .max(30, "El código no puede superar 30 caracteres.")
        .regex(
            /^[A-Za-z0-9_-]+$/,
            "El código solo puede contener letras, números, guiones y guiones bajos."
        ),
    // Opcional: aceptamos "" tal cual llega del form; aPayloadEmpleado lo convierte en null
    descripcion: z
        .union([
            z
                .string()
                .trim()
                .min(3, "La descripción debe contener al menos 3 caracteres.")
                .max(500, "La descripción no puede superar 500 caracteres."),
            z.literal(""),
        ])
        .optional(),
    servicioIds: z
        .array(z.number().int().positive())
        .min(1, "El especialista debe tener al menos un tratamiento asignado.")
        // Con Set: si el tamaño no coincide con el array, había duplicados
        .refine((ids) => new Set(ids).size === ids.length, {
            message: "No se permiten tratamientos duplicados.",
        }),
})

/**
 * Normaliza los valores del formulario al payload que espera el API:
 * descripción vacía -> null y código de empleado sin espacios sobrantes.
 */
export function aPayloadEmpleado(data) {
    return {
        usuarioId: data.usuarioId,
        especialidadId: data.especialidadId,
        codigoEmpleado: data.codigoEmpleado.trim(),
        descripcion: data.descripcion?.trim() ? data.descripcion.trim() : null,
        servicioIds: data.servicioIds,
    }
}
