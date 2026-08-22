import { z } from "zod"

// Regla común para los campos de nombre: reutilizada por nombre y primer apellido
const nombrePersona = (campo) =>
    z
        .string()
        .trim()
        .min(2, `El ${campo} debe contener al menos 2 caracteres.`)
        .max(100, `El ${campo} no puede superar 100 caracteres.`)

/**
 * Validación del formulario de registro de pacientes (rol Cliente).
 *
 * Segundo apellido y teléfono son opcionales (se acepta cadena vacía).
 * La contraseña exige mínimo 8 caracteres con al menos una mayúscula,
 * una minúscula y un número; además debe coincidir con confirmPassword.
 */
export const registroSchema = z
    .object({
        nombre: nombrePersona("nombre"),
        primerApellido: nombrePersona("primer apellido"),
        segundoApellido: z
            .union([
                z
                    .string()
                    .trim()
                    .min(2, "El segundo apellido debe contener al menos 2 caracteres.")
                    .max(100, "El segundo apellido no puede superar 100 caracteres."),
                z.literal(""),
            ])
            .optional(),
        correo: z
            .string()
            .trim()
            .min(1, "El correo es obligatorio.")
            .email("Debe ingresar un correo electrónico válido.")
            .max(150, "El correo no puede superar 150 caracteres."),
        telefono: z
            .union([
                z
                    .string()
                    .trim()
                    .regex(/^[0-9+\-()\s]+$/, "El teléfono contiene caracteres no permitidos."),
                z.literal(""),
            ])
            .optional(),
        password: z
            .string()
            .min(8, "La contraseña debe tener al menos 8 caracteres.")
            .max(100, "La contraseña no puede superar 100 caracteres.")
            .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula.")
            .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula.")
            .regex(/[0-9]/, "La contraseña debe contener al menos un número."),
        confirmPassword: z.string().min(1, "Debe confirmar su contraseña."),
    })
    .refine((data) => data.password === data.confirmPassword, {
        // El error se ancla al campo confirmPassword para mostrarlo bajo ese input
        message: "Las contraseñas no coinciden.",
        path: ["confirmPassword"],
    })

/**
 * Convierte los datos del formulario al payload que espera el API.
 *
 * Descarta confirmPassword y normaliza los campos opcionales: cadena
 * vacía se envía como null (segundo apellido, teléfono).
 *
 * @param {Object} data Datos ya validados por registroSchema.
 * @returns {Object} Payload listo para el endpoint de registro.
 */
export function aPayloadRegistro(data) {
    return {
        nombre: data.nombre.trim(),
        primerApellido: data.primerApellido.trim(),
        segundoApellido: data.segundoApellido?.trim() ? data.segundoApellido.trim() : null,
        correo: data.correo.trim(),
        telefono: data.telefono?.trim() ? data.telefono.trim() : null,
        password: data.password,
    }
}
