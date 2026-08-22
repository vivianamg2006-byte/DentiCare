
import { prisma } from "../src/config/prisma";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Iniciando seed...");
     // Roles
    const administrador = await prisma.rol.upsert({
        where: { nombre: "Administrador" },
        update: {},
        create: {
            nombre: "Administrador",
            descripcion: "Usuario con acceso completo al sistema.",
            activo: true,
        },
    });

    await prisma.rol.upsert({
        where: { nombre: "Empleado" },
        update: {},
        create: {
            nombre: "Empleado",
            descripcion: "Usuario encargado de atender citas asignadas.",
            activo: true,
        },
    });

    await prisma.rol.upsert({
        where: { nombre: "Cliente" },
        update: {},
        create: {
            nombre: "Cliente",
            descripcion: "Usuario que puede consultar sus citas y cancelarlas cuando corresponda.",
            activo: true,
        },
    });

    // Estados de cita
    await prisma.estadoCita.upsert({
        where: { nombre: "Pendiente" },
        update: {},
        create: {
            nombre: "Pendiente",
            descripcion: "Cita registrada, pendiente de confirmación.",
            bloqueaDisponibilidad: true,
            permiteCancelacionCliente: true,
            permiteEdicion: true,
            color: "amarillo",
            orden: 1,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "Confirmada" },
        update: {},
        create: {
            nombre: "Confirmada",
            descripcion: "Cita confirmada por el establecimiento.",
            bloqueaDisponibilidad: true,
            permiteCancelacionCliente: false,
            permiteEdicion: true,
            color: "azul",
            orden: 2,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "En proceso" },
        update: {},
        create: {
            nombre: "En proceso",
            descripcion: "Cita que se encuentra siendo atendida.",
            bloqueaDisponibilidad: true,
            permiteCancelacionCliente: false,
            permiteEdicion: false,
            color: "morado",
            orden: 3,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "Finalizada" },
        update: {},
        create: {
            nombre: "Finalizada",
            descripcion: "Cita atendida y finalizada.",
            bloqueaDisponibilidad: false,
            permiteCancelacionCliente: false,
            permiteEdicion: false,
            color: "verde",
            orden: 4,
            activo: true,
        },
    });

    await prisma.estadoCita.upsert({
        where: { nombre: "Cancelada" },
        update: {},
        create: {
            nombre: "Cancelada",
            descripcion: "Cita cancelada. No bloquea disponibilidad.",
            bloqueaDisponibilidad: false,
            permiteCancelacionCliente: false,
            permiteEdicion: false,
            color: "rojo",
            orden: 5,
            activo: true,
        },
    });

    // Días de semana
    const dias = [
        { nombre: "Lunes", numeroOrden: 1 },
        { nombre: "Martes", numeroOrden: 2 },
        { nombre: "Miércoles", numeroOrden: 3 },
        { nombre: "Jueves", numeroOrden: 4 },
        { nombre: "Viernes", numeroOrden: 5 },
        { nombre: "Sábado", numeroOrden: 6 },
        { nombre: "Domingo", numeroOrden: 7 },
    ];

    for (const dia of dias) {
        await prisma.diaSemana.upsert({
            where: { nombre: dia.nombre },
            update: {},
            create: dia,
        });
    }

    // Tipos de restricción
    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "General del establecimiento" },
        update: {},
        create: {
            nombre: "General del establecimiento",
            descripcion: "Restricción que afecta a todos los empleados del establecimiento.",
        },
    });

    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "Específica de empleado" },
        update: {},
        create: {
            nombre: "Específica de empleado",
            descripcion: "Restricción que afecta únicamente a un empleado específico.",
        },
    });

    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "Parcial por horas" },
        update: {},
        create: {
            nombre: "Parcial por horas",
            descripcion: "Restricción aplicada a un rango específico de horas.",
        },
    });

    await prisma.tipoRestriccionHorario.upsert({
        where: { nombre: "Día completo" },
        update: {},
        create: {
            nombre: "Día completo",
            descripcion: "Restricción que bloquea todo el día seleccionado.",
        },
    });

    // Especialidad base
    await prisma.especialidad.upsert({
        where: { nombre: "General" },
        update: {},
        create: {
            nombre: "General",
            descripcion: "Especialidad base para servicios y empleados generales.",
            activo: true,
        },
    });

    // Especialidades odontológicas adicionales de DentiCare
    const especialidadesDentales = [
        {
            nombre: "Ortodoncia",
            descripcion: "Corrección de la posición de los dientes y la mandíbula mediante frenos y alineadores.",
        },
        {
            nombre: "Endodoncia",
            descripcion: "Tratamientos de conducto y patologías de la pulpa dental.",
        },
        {
            nombre: "Odontopediatría",
            descripcion: "Atención dental especializada para niños y adolescentes.",
        },
        {
            nombre: "Cirugía Oral y Maxilofacial",
            descripcion: "Procedimientos quirúrgicos de extracción y cirugía bucal.",
        },
        {
            nombre: "Estética Dental",
            descripcion: "Blanqueamientos, carillas y mejora estética de la sonrisa.",
        },
    ];

    for (const especialidad of especialidadesDentales) {
        await prisma.especialidad.upsert({
            where: { nombre: especialidad.nombre },
            update: {},
            create: { ...especialidad, activo: true },
        });
    }

    // Roles para usuarios de la clínica
    const rolEmpleado = await prisma.rol.findUnique({ where: { nombre: "Empleado" } });
    const rolCliente = await prisma.rol.findUnique({ where: { nombre: "Cliente" } });

    if (!rolEmpleado || !rolCliente) {
        throw new Error("Los roles base deben existir antes de sembrar los usuarios.");
    }

    // Especialistas / odontólogos(as) de DentiCare
    const passwordEmpleados = await bcrypt.hash("Odonto123", 10);
    const empleadosSeed = [
        {
            nombre: "Carlos",
            primerApellido: "Mora",
            segundoApellido: "Vargas",
            correo: "carlos.mora@dentcare.com",
            telefono: "87123456",
        },
        {
            nombre: "Fernanda",
            primerApellido: "Solís",
            segundoApellido: "Castro",
            correo: "fernanda.solis@dentcare.com",
            telefono: "87234567",
        },
        {
            nombre: "Sofía",
            primerApellido: "Herrera",
            segundoApellido: "Ramírez",
            correo: "sofia.herrera@dentcare.com",
            telefono: "87345678",
        },
    ];

    for (const empleado of empleadosSeed) {
        await prisma.usuario.upsert({
            where: { correo: empleado.correo },
            update: {},
            create: {
                ...empleado,
                passwordHash: passwordEmpleados,
                activo: true,
                rolId: rolEmpleado.id,
            },
        });
    }

    // Pacientes iniciales de DentiCare
    const passwordClientes = await bcrypt.hash("Cliente123", 10);
    const clientesSeed = [
        {
            nombre: "María",
            primerApellido: "López",
            segundoApellido: "Jiménez",
            correo: "maria.lopez@example.com",
            telefono: "88111222",
        },
        {
            nombre: "Ana",
            primerApellido: "Rojas",
            segundoApellido: null,
            correo: "ana.rojas@example.com",
            telefono: "88222333",
        },
    ];

    for (const cliente of clientesSeed) {
        await prisma.usuario.upsert({
            where: { correo: cliente.correo },
            update: {},
            create: {
                nombre: cliente.nombre,
                primerApellido: cliente.primerApellido,
                segundoApellido: cliente.segundoApellido,
                correo: cliente.correo,
                telefono: cliente.telefono,
                passwordHash: passwordClientes,
                activo: true,
                rolId: rolCliente.id,
            },
        });
    }

    // Usuario administrador
    const passwordHash = await bcrypt.hash("Admin12345", 10);

    await prisma.usuario.upsert({
        where: { correo: "admin@citas.com" },
        update: {},
        create: {
            nombre: "Administrador",
            primerApellido: "Sistema",
            segundoApellido: null,
            correo: "admin@citas.com",
            telefono: "88888888",
            passwordHash,
            activo: true,
            rolId: administrador.id,
        },
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