import { z } from "zod";

export const createRegistrationStatusSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "El estado debe tener al menos 3 caracteres")
        .max(30, "El estado no puede superar 30 caracteres"),
});

export const updateRegistrationStatusSchema =
    createRegistrationStatusSchema.partial();

export type CreateRegistrationStatusDto = z.infer<
    typeof createRegistrationStatusSchema
>;

export type UpdateRegistrationStatusDto = z.infer<
    typeof updateRegistrationStatusSchema
>;