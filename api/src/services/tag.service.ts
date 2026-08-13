import { prisma } from "../config/prisma";

export const tagService = {
    async listar() {
        return await prisma.tag.findMany({
            orderBy: { name: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.tag.findUnique({
            where: { id },
        });
    },
};