import { prisma } from "../config/prisma";
import { mapEventOutput } from "../utils/timezone";

/**
 * Formatea la relación "event" anidada dentro de una registration,
 * si viene incluida. registeredAt no se toca (es automático).
 */
function mapRegistrationOutput<T extends { event?: { date: Date } }>(
    registration: T
) {
    if (!registration.event) {
        return registration;
    }
    return {
        ...registration,
        event: mapEventOutput(registration.event),
    };
}

export const registrationService = {
    async listar() {
        const registrations = await prisma.registration.findMany({
            include: {
                event: true,
                user: true,
                status: true,
            },
            orderBy: {
                registeredAt: "desc",
            },
        });
        return registrations.map(mapRegistrationOutput);
    },

    async obtenerPorUsuario(userId: number) {
        const registrations = await prisma.registration.findMany({
            where: { userId },
            include: {
                event: true,
                status: true,
            },
            orderBy: {
                registeredAt: "desc",
            },
        });
        return registrations.map(mapRegistrationOutput);
    },

    async obtenerPorEvento(eventId: number) {
        const registrations = await prisma.registration.findMany({
            where: { eventId },
            include: {
                user: true,
                status: true,
            },
            orderBy: {
                registeredAt: "desc",
            },
        });
        // Sin "event" incluido aquí, no hay date que formatear.
        return registrations;
    },

    async crear(data: {
        eventId: number;
        userId: number;
        statusId?: number;
    }) {
        const registration = await prisma.registration.create({
            data: {
                eventId: data.eventId,
                userId: data.userId,
                statusId: data.statusId ?? 1,
            },
            include: {
                event: true,
                user: true,
                status: true,
            },
        });
        return mapRegistrationOutput(registration);
    },

    async modificar(
        eventId: number,
        userId: number,
        data: {
            statusId: number;
        }
    ) {
        const registration = await prisma.registration.update({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
            data: {
                statusId: data.statusId,
            },
            include: {
                event: true,
                user: true,
                status: true,
            },
        });
        return mapRegistrationOutput(registration);
    },

    async eliminar(eventId: number, userId: number) {
        return await prisma.registration.delete({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });
    },
};