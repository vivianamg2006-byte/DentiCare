import { z } from "zod";

export const registerUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Debe ingresar un correo válido")
        .max(100, "El correo no puede superar 100 caracteres"),

    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(255, "La contraseña no puede superar 255 caracteres"),

    fullName: z
        .string()
        .trim()
        .min(3, "El nombre completo debe tener al menos 3 caracteres")
        .max(120, "El nombre completo no puede superar 120 caracteres"),

    roleId: z
        .number()
        .int()
        .positive("El rol es obligatorio")
        .optional(),
});

export const loginUserSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Debe ingresar un correo válido"),

    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;