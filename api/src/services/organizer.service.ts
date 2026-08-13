import { prisma } from "../config/prisma";

export const organizerService = {
    async listar() {
        return await prisma.organizer.findMany({
            orderBy: {
                name: "asc",
            },
        });
    },

    async obtenerPorId(id: number) {
        return await prisma.organizer.findUnique({
            where: { id },
            include: {
                events: true,
            },
        })
    }
}