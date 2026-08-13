
import { prisma } from "../src/config/prisma";

async function main() {
    console.log("Iniciando seed...");
    // Limpiar datos en orden correcto por llaves foráneas
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organizer.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.registrationStatus.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();

    // Categorías
    await prisma.category.createMany({
        data: [
            { id: 1, name: "Mobile Dev", description: null },
            { id: 2, name: "Cloud Computing", description: null },
            { id: 3, name: "Videojuegos", description: null },
            { id: 4, name: "Arquitectura de Software", description: null },
            { id: 5, name: "Inteligencia Artificial", description: null },
            { id: 6, name: "Ciberseguridad", description: null },
            { id: 7, name: "Desarrollo Web", description: null },
            { id: 8, name: "Habilidades Blandas", description: null },
        ],
    });

    // Etiquetas
    await prisma.tag.createMany({
        data: [
            { id: 1, name: "Certificado" },
            { id: 2, name: "Gratis" },
            { id: 3, name: "Presencial" },
            { id: 4, name: "Virtual" },
            { id: 5, name: "Cupo Limitado" },
        ],
    });

    // Estados de inscripción
    await prisma.registrationStatus.createMany({
        data: [
            { id: 1, name: "Inscrito" },
            { id: 2, name: "Cancelado" },
            { id: 3, name: "Lista de espera" },
        ],
    });

    // Roles
    await prisma.userRole.createMany({
        data: [
            { id: 1, name: "Administrador" },
            { id: 2, name: "Gestor" },
            { id: 3, name: "Cliente" },
        ],
    });

    // Usuarios
    await prisma.user.createMany({
        data: [
            {
                id: 1,
                email: "admin@utn.ac.cr",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                fullName: "Usuario Administrador",
                roleId: 1,
            },
            {
                id: 2,
                email: "estudiante@utn.ac.cr",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                fullName: "Usuario Estudiante",
                roleId: 2,
            },
            {
                id: 3,
                email: "invitado@utn.ac.cr",
                password: "$2b$10$jCyLTcAWtCs11jxUhfRkyumn9kqPUWhIwV2F7d8eiYDEtptQFsWIO",
                fullName: "Usuario Invitado",
                roleId: 3,
            },
        ],
    });
    //Organizadores
    await prisma.organizer.createMany({
        data: [
            {
                name: "Universidad Técnica Nacional",
                description: "Institución organizadora de eventos académicos y tecnológicos.",
                imageUrl: "org_utn_software.png",
            },
            {
                name: "Comunidad ISWARC",
                description: "Comunidad académica orientada a innovación, software y realidad extendida.",
                imageUrl: "org_cet_comunidad.png",
            },
            {
                name: "TechEvents CR",
                description: "Organización dedicada a eventos de tecnología y desarrollo web.",
                imageUrl: "org_global_tech.png",
            },
        ],
        skipDuplicates: true,
    });

    // Eventos
    await prisma.event.createMany({
        data: [
            {
                id: 1,
                title: "Cyber Threat Hunting",
                description: "Búsqueda de amenazas proactiva.",
                date: new Date("2026-06-13T19:57:54.000Z"),
                categoryId: 6,
                organizerId: 1,
                location: "Laboratorio 1, UTN",
                modality: "Presencial",
                totalCapacity: 40,
                isActive: true,
                imageUrl: "event-cyber-threat-hunting.jpg",
            },
            {
                id: 2,
                title: "Next.js Mastery",
                description: "Desarrollo con el framework de React.",
                date: new Date("2026-06-08T19:57:54.000Z"),
                categoryId: 7,
                organizerId: 2,
                location: "Virtual (Discord)",
                modality: "Virtual",
                totalCapacity: 80,
                isActive: true,
                imageUrl: "event-nextjs-mastery.webp",
            },
            {
                id: 3,
                title: "AI & Ethics Forum",
                description: "Discusión sobre ética en IA.",
                date: new Date("2026-05-04T19:57:54.000Z"),
                categoryId: 5,
                organizerId: 3,
                location: "Virtual (Microsoft Teams)",
                modality: "Virtual",
                totalCapacity: 100,
                isActive: true,
                imageUrl: "event-ai-ethics-forum.jpeg",
            },
            {
                id: 4,
                title: "Flutter Workshop",
                description: "Creación de apps multiplataforma.",
                date: new Date("2026-05-24T19:57:54.000Z"),
                categoryId: 1,
                organizerId: 1,
                location: "Laboratorio 5, UTN",
                modality: "Presencial",
                totalCapacity: 35,
                isActive: true,
                imageUrl: "event-flutter-workshop.png",
            },
            {
                id: 5,
                title: "Azure Cloud Day",
                description: "Introducción a servicios de nube.",
                date: new Date("2026-05-19T19:57:54.000Z"),
                categoryId: 2,
                organizerId: 2,
                location: "Virtual (Zoom)",
                modality: "Virtual",
                totalCapacity: 90,
                isActive: true,
                imageUrl: "event-azure-cloud-day.jpg",
            },
            {
                id: 6,
                title: "Leadership for Devs",
                description: "Habilidades de liderazgo en equipos técnicos.",
                date: new Date("2026-05-14T19:57:54.000Z"),
                categoryId: 8,
                organizerId: 3,
                location: "Sala de Conferencias",
                modality: "Presencial",
                totalCapacity: 45,
                isActive: true,
                imageUrl: "event-leadership-devs.webp",
            },
            {
                id: 7,
                title: "Unity 3D Basics",
                description: "Introducción al desarrollo de videojuegos.",
                date: new Date("2026-05-29T19:57:54.000Z"),
                categoryId: 3,
                organizerId: 1,
                location: "Biblioteca Central",
                modality: "Presencial",
                totalCapacity: 30,
                isActive: true,
                imageUrl: "event-unity-3d-basics.png",
            },
            {
                id: 8,
                title: "Microservices Patterns",
                description: "Patrones de diseño en la nube.",
                date: new Date("2026-06-03T19:57:54.000Z"),
                categoryId: 4,
                organizerId: 1,
                location: "Auditorio UTN, Alajuela",
                modality: "Presencial",
                totalCapacity: 60,
                isActive: true,
                imageUrl: "event-microservices-patterns.png",
            },
            {
                id: 9,
                title: "CTF Interuniversitario",
                description: "Competencia de captura de la bandera.",
                date: new Date("2026-05-09T19:57:54.000Z"),
                categoryId: 6,
                organizerId: 2,
                location: "Laboratorio 3, UTN",
                modality: "Presencial",
                totalCapacity: 25,
                isActive: true,
                imageUrl: "event-ctf-hacking.webp",
            },
            {
                id: 10,
                title: "React Summit Alajuela",
                description: "Taller avanzado de React y Hooks.",
                date: new Date("2026-04-29T19:57:54.000Z"),
                categoryId: 7,
                organizerId: 3,
                location: "Auditorio UTN, Alajuela",
                modality: "Presencial",
                totalCapacity: 50,
                isActive: true,
                imageUrl: "event-react-summit.jpg",
            },
        ],
    });

    // Relación eventos - etiquetas
    const eventTags = [
        {
            eventId: 3,
            tagIds: [2, 4],
        },
        {
            eventId: 9,
            tagIds: [3, 5],
        },
        {
            eventId: 10,
            tagIds: [1, 3, 5],
        },
    ];

    for (const item of eventTags) {
        await prisma.event.update({
            where: {
                id: item.eventId,
            },
            data: {
                tags: {
                    connect: item.tagIds.map((tagId) => ({
                        id: tagId,
                    })),
                },
            },
        });
    }

    // Inscripciones
    await prisma.registration.createMany({
        data: [
            { eventId: 1, userId: 3, statusId: 1 },
            { eventId: 2, userId: 2, statusId: 1 },
            { eventId: 3, userId: 1, statusId: 1 },
            { eventId: 4, userId: 2, statusId: 1 },
            { eventId: 6, userId: 3, statusId: 1 },
            { eventId: 9, userId: 2, statusId: 1 },
            { eventId: 10, userId: 1, statusId: 1 },
            { eventId: 10, userId: 2, statusId: 1 },
        ],
    });

    console.log("Seeder ejecutado correctamente.");
}

main()
    .catch((e) => {
        console.error("Error en seed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });