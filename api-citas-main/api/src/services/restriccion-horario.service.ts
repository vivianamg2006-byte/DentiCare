import { prisma } from "../config/prisma";
import {
    CreateRestriccionHorarioDto,
    UpdateEstadoRestriccionHorarioDto,
    UpdateRestriccionHorarioDto,
} from "../dtos/restriccion-horario.dto";
import {
    fechaParaDateColumn,
    horaParaTimeColumn,
    mapRestriccionOutput,
} from "../utils/timezone";

const usuarioSelect = {
    id: true,
    nombre: true,
    primerApellido: true,
    segundoApellido: true,
    correo: true,
    telefono: true,
    activo: true,
} as const;

/**
 * Valida el tipo, el empleado (si aplica) y los traslapes,
 * y devuelve fecha/horaInicio/horaFin ya listos para guardar
 * (columnas @db.Date / @db.Time, sin desfase de zona horaria).
 */
async function validarRestriccion(
    data: {
        tipoRestriccionId: number;
        empleadoId: number | null;
        fecha: string;
        horaInicio: string | null;
        horaFin: string | null;
        todoElDia: boolean;
    },
    restriccionIdExcluir?: number
) {
    const tipoRestriccion = await prisma.tipoRestriccionHorario.findUnique({
        where: { id: data.tipoRestriccionId },
        select: { id: true },
    });
    if (!tipoRestriccion) {
        throw new Error("El tipo de restricción indicado no existe");
    }

    if (data.empleadoId !== null) {
        const empleado = await prisma.empleado.findUnique({
            where: { id: data.empleadoId },
            select: {
                id: true,
                activo: true,
                usuario: { select: { activo: true } },
            },
        });
        if (!empleado) {
            throw new Error("El empleado indicado no existe");
        }
        if (!empleado.activo || !empleado.usuario.activo) {
            throw new Error("El empleado indicado se encuentra inactivo");
        }
    }

    // Conversión literal: DATE y TIME no tienen zona horaria,
    // no depende de la máquina donde corre el servidor.
    const fecha = fechaParaDateColumn(data.fecha);
    const horaInicio = data.horaInicio
        ? horaParaTimeColumn(data.horaInicio)
        : null;
    const horaFin = data.horaFin ? horaParaTimeColumn(data.horaFin) : null;

    const restriccionesExistentes = await prisma.restriccionHorario.findMany({
        where: {
            id: restriccionIdExcluir ? { not: restriccionIdExcluir } : undefined,
            fecha,
            activo: true,
            empleadoId: data.empleadoId,
        },
        select: {
            id: true,
            todoElDia: true,
            horaInicio: true,
            horaFin: true,
        },
    });

    const existeConflicto = restriccionesExistentes.some((restriccion) => {
        if (data.todoElDia || restriccion.todoElDia) {
            return true;
        }
        if (
            !horaInicio ||
            !horaFin ||
            !restriccion.horaInicio ||
            !restriccion.horaFin
        ) {
            return false;
        }
        return horaInicio < restriccion.horaFin && horaFin > restriccion.horaInicio;
    });

    if (existeConflicto) {
        throw new Error(
            "La restricción se traslapa con otra restricción registrada"
        );
    }

    return { fecha, horaInicio, horaFin };
}

export const restriccionHorarioService = {
    async listar() {
        const restricciones = await prisma.restriccionHorario.findMany({
            include: {
                tipoRestriccion: true,
                empleado: {
                    include: { usuario: { select: usuarioSelect } },
                },
            },
            orderBy: [{ fecha: "desc" }, { horaInicio: "asc" }],
        });
        return restricciones.map(mapRestriccionOutput);
    },

    async obtenerPorId(id: number) {
        const restriccion = await prisma.restriccionHorario.findUnique({
            where: { id },
            include: {
                tipoRestriccion: true,
                empleado: {
                    include: { usuario: { select: usuarioSelect } },
                },
            },
        });
        return restriccion ? mapRestriccionOutput(restriccion) : null;
    },

    async crear(data: CreateRestriccionHorarioDto) {
        const { fecha, horaInicio, horaFin } = await validarRestriccion(data);

        const restriccion = await prisma.restriccionHorario.create({
            data: {
                tipoRestriccionId: data.tipoRestriccionId,
                empleadoId: data.empleadoId,
                fecha,
                horaInicio,
                horaFin,
                todoElDia: data.todoElDia,
                motivo: data.motivo.trim(),
                activo: true,
            },
            include: {
                tipoRestriccion: true,
                empleado: {
                    include: { usuario: { select: usuarioSelect } },
                },
            },
        });

        return mapRestriccionOutput(restriccion);
    },

    async modificar(id: number, data: UpdateRestriccionHorarioDto) {
        const restriccionActual = await prisma.restriccionHorario.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!restriccionActual) {
            throw new Error("La restricción de horario no existe");
        }

        const { fecha, horaInicio, horaFin } = await validarRestriccion(
            data,
            id
        );

        const restriccion = await prisma.restriccionHorario.update({
            where: { id },
            data: {
                tipoRestriccionId: data.tipoRestriccionId,
                empleadoId: data.empleadoId,
                fecha,
                horaInicio,
                horaFin,
                todoElDia: data.todoElDia,
                motivo: data.motivo.trim(),
            },
            include: {
                tipoRestriccion: true,
                empleado: {
                    include: { usuario: { select: usuarioSelect } },
                },
            },
        });

        return mapRestriccionOutput(restriccion);
    },

    async cambiarEstado(id: number, data: UpdateEstadoRestriccionHorarioDto) {
        const restriccion = await prisma.restriccionHorario.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!restriccion) {
            throw new Error("La restricción de horario no existe");
        }

        const restriccionActualizada = await prisma.restriccionHorario.update({
            where: { id },
            data: { activo: data.activo },
            include: {
                tipoRestriccion: true,
                empleado: {
                    include: { usuario: { select: usuarioSelect } },
                },
            },
        });

        return mapRestriccionOutput(restriccionActualizada);
    },
};