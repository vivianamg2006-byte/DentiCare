import { prisma } from "../config/prisma";
import {
    CreateHorarioAtencionDto,
    UpdateEstadoHorarioAtencionDto,
    UpdateHorarioAtencionDto,
} from "../dtos/horario-atencion.dto";
import { horaParaTimeColumn, mapHorarioAtencionOutput } from "../utils/timezone";

/**
 * Valida el día y los traslapes de horario.
 */
async function validarHorario(
    data: {
        diaSemanaId: number;
        horaInicio: string;
        horaFin: string;
    },
    horarioIdExcluir?: number
) {
    const diaSemana = await prisma.diaSemana.findUnique({
        where: { id: data.diaSemanaId },
        select: { id: true },
    });
    if (!diaSemana) {
        throw new Error("El día de la semana indicado no existe");
    }

    const horaInicio = horaParaTimeColumn(data.horaInicio);
    const horaFin = horaParaTimeColumn(data.horaFin);

    const horarioTraslapado = await prisma.horarioAtencion.findFirst({
        where: {
            id: horarioIdExcluir ? { not: horarioIdExcluir } : undefined,
            diaSemanaId: data.diaSemanaId,
            AND: [
                { horaInicio: { lt: horaFin } },
                { horaFin: { gt: horaInicio } },
            ],
        },
        select: { id: true, horaInicio: true, horaFin: true },
    });
    if (horarioTraslapado) {
        throw new Error(
            "El horario se traslapa con otro horario registrado para el mismo día"
        );
    }
    return { horaInicio, horaFin };
}

export const horarioAtencionService = {
    async listar() {
        const horarios = await prisma.horarioAtencion.findMany({
            include: { diaSemana: true },
            orderBy: [
                { diaSemana: { numeroOrden: "asc" } },
                { horaInicio: "asc" },
            ],
        });
        return horarios.map(mapHorarioAtencionOutput);
    },

    async obtenerPorId(id: number) {
        const horario = await prisma.horarioAtencion.findUnique({
            where: { id },
            include: { diaSemana: true },
        });
        return horario ? mapHorarioAtencionOutput(horario) : null;
    },

    async crear(data: CreateHorarioAtencionDto) {
        // validarHorario ya retorna Date listos para guardar
        const { horaInicio, horaFin } = await validarHorario(data);

        const horario = await prisma.horarioAtencion.create({
            data: {
                diaSemanaId: data.diaSemanaId,
                horaInicio,
                horaFin,
                activo: true,
            },
            include: { diaSemana: true },
        });

        return mapHorarioAtencionOutput(horario);
    },

    async modificar(id: number, data: UpdateHorarioAtencionDto) {
        const horarioActual = await prisma.horarioAtencion.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!horarioActual) {
            throw new Error("El horario de atención no existe");
        }

        const { horaInicio, horaFin } = await validarHorario(data, id);

        const horario = await prisma.horarioAtencion.update({
            where: { id },
            data: {
                diaSemanaId: data.diaSemanaId,
                horaInicio,
                horaFin,
            },
            include: { diaSemana: true },
        });

        return mapHorarioAtencionOutput(horario);
    },

    async cambiarEstado(id: number, data: UpdateEstadoHorarioAtencionDto) {
        const horario = await prisma.horarioAtencion.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!horario) {
            throw new Error("El horario de atención no existe");
        }

        const horarioActualizado = await prisma.horarioAtencion.update({
            where: { id },
            data: { activo: data.activo },
            include: { diaSemana: true },
        });

        return mapHorarioAtencionOutput(horarioActualizado);
    },
};