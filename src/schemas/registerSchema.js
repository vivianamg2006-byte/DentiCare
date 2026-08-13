import { z } from "zod"

export const registerSchema = z.object({
    fullName: z.string()
        .trim()
        .min(3, "El nombre completo debe tener al menos 3 caracteres.")
        .max(120, "El nombre completo no debe superar 120 caracteres."),
    email: z.string()
        .trim()
        .email("Debe ingresar un correo electrónico válido."),
    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string()
        .min(1, "Debe confirmar su contraseña.")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
})
