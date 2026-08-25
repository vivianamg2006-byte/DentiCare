import { z } from "zod"

/**
 * Validación de la ficha de empleado/especialista para alta y edición.
 * La consume EspecialistaFormPage vía zodResolver (react-hook-form).
 * Ojo: los selects entregan strings, por eso los ids usan z.coerce.
 *
 * En creación ya no se elige un usuario existente: el especialista se da
 * de alta junto con su cuenta nueva, cuyo rol es siempre "Empleado"
 * (resuelto dinámicamente desde el API). En edición solo se modifica la ficha.
 */

// Reglas compartidas con registroSchema para los datos de la cuenta nueva
const nombrePersona = (campo) =>
    z
        .string()
        .trim()
        .min(2, `El ${campo} debe contener al menos 2 caracteres.`)
        .max(100, `El ${campo} no puede superar 100 caracteres.`)

const passwordUsuario = z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(100, "La contraseña no puede superar 100 caracteres.")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula.")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula.")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número.")

// Campos propios de la ficha, comunes a ambos modos
const camposFicha = {
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
}

/**
 * Alta de especialista: crea primero la cuenta del usuario (POST /usuarios)
 * con el rol "Empleado" y luego su ficha (POST /empleados).
 */
export const crearEspecialistaSchema = z
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
        password: passwordUsuario,
        confirmPassword: z.string().min(1, "Debe confirmar su contraseña."),
        ...camposFicha,
    })
    .refine((data) => data.password === data.confirmPassword, {
        // El error se ancla al campo confirmPassword para mostrarlo bajo ese input
        message: "Las contraseñas no coinciden.",
        path: ["confirmPassword"],
    })

/**
 * Edición de especialista: la cuenta ya existe y se conserva tal cual
 * (el usuarioId viaja oculto porque el PUT del API lo exige).
 */
export const editarEspecialistaSchema = z.object({
    usuarioId: z.coerce
        .number({ message: "Debe seleccionar un usuario." })
        .int()
        .positive("Debe seleccionar un usuario."),
    ...camposFicha,
})

/** Alias por compatibilidad con usos previos del esquema de edición */
export const empleadoSchema = editarEspecialistaSchema

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

/**
 * Arma el payload del endpoint POST /usuarios para la cuenta nueva.
 *
 * @param {Object} data Datos ya validados por crearEspecialistaSchema.
 * @param {number|string} rolId Id del rol "Empleado" resuelto desde el API (listarRoles).
 */
export function aPayloadNuevoUsuario(data, rolId) {
    return {
        nombre: data.nombre.trim(),
        primerApellido: data.primerApellido.trim(),
        segundoApellido: data.segundoApellido?.trim() ? data.segundoApellido.trim() : null,
        correo: data.correo.trim(),
        telefono: data.telefono?.trim() ? data.telefono.trim() : null,
        password: data.password,
        rolId: Number(rolId),
    }
}
