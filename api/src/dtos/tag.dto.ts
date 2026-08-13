import { z } from "zod";

export const createTagSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "La etiqueta debe tener al menos 3 caracteres")
        .max(50, "La etiqueta no puede superar 50 caracteres"),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagDto = z.infer<typeof createTagSchema>;
export type UpdateTagDto = z.infer<typeof updateTagSchema>;