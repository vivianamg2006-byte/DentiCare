import { z } from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(80, "El nombre no puede superar 80 caracteres"),

    description: z
        .string()
        .trim()
        .max(500, "La descripción no puede superar 500 caracteres")
        .optional()
        .nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;