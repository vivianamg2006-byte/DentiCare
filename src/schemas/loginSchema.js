import { z } from "zod"

/**
 * Validación del formulario de inicio de sesión.
 *
 * Solo comprueba formato y presencia: las credenciales reales las
 * verifica el backend. Se usa en LoginPage vía zodResolver.
 */
export const loginSchema = z.object({
    correo: z
        .string()
        .trim()
        .min(1, "El correo es obligatorio.")
        .email("Debe ingresar un correo electrónico válido.")
        .max(150, "El correo no puede superar 150 caracteres."),
    password: z
        .string()
        .min(1, "La contraseña es obligatoria.")
        .max(100, "La contraseña no puede superar 100 caracteres."),
})
