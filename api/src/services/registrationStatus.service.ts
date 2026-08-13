import { prisma } from "../config/prisma";

export const registrationStatusService = {
  async listar() {
    return await prisma.registrationStatus.findMany({
      orderBy: { id: "asc" },
    });
  },

  async obtenerPorId(id: number) {
    return await prisma.registrationStatus.findUnique({
      where: { id },
    });
  },
};
