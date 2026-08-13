import { prisma } from "../config/prisma";
import { fechaHoraParaDateTimeColumn, mapEventOutput } from "../utils/timezone";

export const eventService = {
    async listar() {
        const events = await prisma.event.findMany({
            include: {
                category: true,
                tags: true,
                organizer: true,
            },
            orderBy: { date: "asc" },
        });
        return events.map(mapEventOutput);
    },

    async obtenerPorId(id: number) {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                category: true,
                tags: true,
                organizer: true,
                registrations: {
                    include: {
                        user: true,
                        status: true,
                    },
                },
            },
        });
        return event ? mapEventOutput(event) : null;
    },

    async crear(data: {
        title: string;
        description: string;
        date: string;
        categoryId: number;
        organizerId: number;
        location: string;
        modality: string;
        totalCapacity: number;
        isActive?: boolean;
        imageUrl?: string;
        tagIds?: number[];
    }) {
        const event = await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: fechaHoraParaDateTimeColumn(data.date),
                categoryId: data.categoryId,
                location: data.location,
                modality: data.modality,
                totalCapacity: data.totalCapacity,
                isActive: data.isActive ?? true,
                imageUrl: data.imageUrl ?? "image-not-found.jpg",
                organizerId: data.organizerId,
                tags: data.tagIds
                    ? {
                        connect: data.tagIds.map((tagId) => ({
                            id: tagId,
                        })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                tags: true,
                organizer: true,
            },
        });
        return mapEventOutput(event);
    },

    async modificar(
        id: number,
        data: {
            title?: string;
            description?: string;
            date?: string;
            categoryId?: number;
            organizerId?: number;
            location?: string;
            modality?: string;
            totalCapacity?: number;
            isActive?: boolean;
            imageUrl?: string;
            tagIds?: number[];
        }
    ) {
        const event = await prisma.event.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                date: data.date
                    ? fechaHoraParaDateTimeColumn(data.date)
                    : undefined,
                categoryId: data.categoryId,
                location: data.location,
                modality: data.modality,
                totalCapacity: data.totalCapacity,
                isActive: data.isActive,
                imageUrl: data.imageUrl,
                organizerId: data.organizerId,
                tags: data.tagIds
                    ? {
                        set: data.tagIds.map((tagId) => ({
                            id: tagId,
                        })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                tags: true,
                organizer: true,
            },
        });
        return mapEventOutput(event);
    },
};