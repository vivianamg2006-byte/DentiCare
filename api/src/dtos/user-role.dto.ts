import { z } from "zod";

export const createUserRoleSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "El rol debe tener al menos 3 caracteres")
        .max(30, "El rol no puede superar 30 caracteres"),
});

export const updateUserRoleSchema = createUserRoleSchema.partial();

export type CreateUserRoleDto = z.infer<typeof createUserRoleSchema>;
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>;