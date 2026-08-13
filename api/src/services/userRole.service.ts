import { prisma } from "../config/prisma";

export const userRoleService = {
    async listar() {
        return await prisma.userRole.findMany({
            orderBy: { id: "asc" },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.userRole.findUnique({
            where: { id },
        });
    },
};