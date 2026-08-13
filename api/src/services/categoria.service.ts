import { prisma } from "../config/prisma";

export const categoryService = {
    async listar() {
        return await prisma.category.findMany({
            orderBy: { name: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.category.findUnique({
            where: { id },
        });
    },
};