/**
 * Script de datos iniciales para la clínica DentiCare.
 *
 * Ejecutar con el backend en marcha:
 *   node scripts/seed-clinica.mjs
 *
 * Requiere que primero se haya ejecutado el seed de base
 * (npm run reset dentro de api-citas-main/api), que crea roles,
 * estados de cita, días, tipos de restricción, especialidades,
 * usuarios administrador/empleado/cliente.
 *
 * Este script consume SOLO el API REST (respetando sus validaciones):
 *   1. Login del administrador.
 *   2. Registro de pacientes (si no existen).
 *   3. Tratamientos (servicios) por especialidad.
 *   4. Servicios adicionales (mínimo 8).
 *   5. Fichas de especialistas con sus tratamientos (mínimo 3 c/u).
 *   6. Horarios de atención (lunes a sábado).
 *   7. Restricciones de horario (2 generales, 3 de empleado,
 *      2 parciales por horas, 1 día completo).
 *   8. Citas: 4 pendientes, 4 confirmadas, 3 finalizadas y 2
 *      canceladas, validando disponibilidad antes de crearlas.
 *
 * El script es idempotente: puede ejecutarse varias veces sin
 * duplicar datos.
 */

const BASE_URL = process.env.API_URL ?? "http://localhost:3000"

let token = null

/* ---------------- Utilidades HTTP ---------------- */

async function api(ruta, { metodo = "GET", cuerpo } = {}) {
    const respuesta = await fetch(`${BASE_URL}${ruta}`, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
    const datos = await respuesta.json().catch(() => null)
    if (!respuesta.ok || datos?.success === false) {
        throw new Error(datos?.message || `Error ${respuesta.status} en ${ruta}`)
    }
    return datos?.data !== undefined ? datos.data : datos
}

async function intentar(fn, etiqueta) {
    try {
        return await fn()
    } catch (error) {
        console.warn(`  ⚠ ${etiqueta}: ${error.message}`)
        return null
    }
}

/* ---------------- Fechas ---------------- */

function fechaEn(offsetDias) {
    const base = new Date()
    base.setDate(base.getDate() + offsetDias)
    // La clínica no abre domingos: se pasa al lunes
    if (base.getDay() === 0) {
        base.setDate(base.getDate() + 1)
    }
    return [
        base.getFullYear(),
        String(base.getMonth() + 1).padStart(2, "0"),
        String(base.getDate()).padStart(2, "0"),
    ].join("-")
}

function sumarMinutosAHora(hora, minutos) {
    const [h, m] = hora.split(":").map(Number)
    const total = h * 60 + m + minutos
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

/* ---------------- Programa principal ---------------- */

const SERVICIOS = [
    // General
    { nombre: "Consulta y diagnóstico", especialidad: "General", precioBase: 12000, duracionMinutos: 30, descripcion: "Evaluación clínica completa, revisión de radiografías y plan de tratamiento personalizado." },
    { nombre: "Limpieza dental (profilaxis)", especialidad: "General", precioBase: 18000, duracionMinutos: 45, descripcion: "Eliminación de placa y sarro, pulido dental y recomendaciones de higiene oral." },
    { nombre: "Resina/Obturación", especialidad: "General", precioBase: 22000, duracionMinutos: 45, descripcion: "Restauración estética de dientes con caries utilizando resina compuesta del color del diente." },
    { nombre: "Corona dental", especialidad: "General", precioBase: 110000, duracionMinutos: 60, descripcion: "Reconstrucción total del diente dañado mediante una corona de porcelana a medida." },
    // Ortodoncia
    { nombre: "Ajuste de brackets", especialidad: "Ortodoncia", precioBase: 15000, duracionMinutos: 30, descripcion: "Control mensual del tratamiento ortodóntico con cambio de ligas y ajustes de fuerza." },
    { nombre: "Instalación de frenos metálicos", especialidad: "Ortodoncia", precioBase: 250000, duracionMinutos: 90, descripcion: "Colocación completa del aparato ortodóntico metálico con indicaciones de cuidado." },
    // Estética Dental
    { nombre: "Blanqueamiento dental", especialidad: "Estética Dental", precioBase: 65000, duracionMinutos: 60, descripcion: "Aclarado profesional de los dientes en una sesión con lámpara de luz LED." },
    // Odontopediatría
    { nombre: "Aplicación de flúor", especialidad: "Odontopediatría", precioBase: 10000, duracionMinutos: 30, descripcion: "Aplicación tópica de flúor para fortalecer el esmalte y prevenir caries en los más pequeños." },
    { nombre: "Consulta odontopediátrica", especialidad: "Odontopediatría", precioBase: 9000, duracionMinutos: 30, descripcion: "Primera valoración dental infantil con técnicas de manejo conductual amigables." },
    // Cirugía Oral y Maxilofacial
    { nombre: "Extracción simple", especialidad: "Cirugía Oral y Maxilofacial", precioBase: 35000, duracionMinutos: 45, descripcion: "Remoción de un diente no recuperable con anestesia local y control postoperatorio." },
    { nombre: "Extracción de tercer molar", especialidad: "Cirugía Oral y Maxilofacial", precioBase: 85000, duracionMinutos: 90, descripcion: "Cirugía de muelas del juicio retenidas o impactadas con sutura y seguimiento." },
    // Endodoncia
    { nombre: "Endodoncia (tratamiento de conducto)", especialidad: "Endodoncia", precioBase: 120000, duracionMinutos: 90, descripcion: "Tratamiento de conducto para salvar el diente cuando la pulpa se encuentra afectada." },
]

const ADICIONALES = [
    { nombre: "Radiografía panorámica", precio: 12000, descripcion: "Estudio de imagen que muestra toda la estructura bucal en una sola placa." },
    { nombre: "Anestesia adicional", precio: 5000, descripcion: "Dosis extra de anestesia local para procedimientos prolongados o sensibles." },
    { nombre: "Kit de higiene dental", precio: 4000, descripcion: "Cepillo, pasta e hilo dental de uso profesional para llevar a casa." },
    { nombre: "Gel desensibilizante", precio: 3500, descripcion: "Aplicación de gel para reducir la sensibilidad dental después del tratamiento." },
    { nombre: "Protector bucal personalizado", precio: 25000, descripcion: "Férula moldeada a medida para bruxismo o práctica deportiva." },
    { nombre: "Sedación consciente leve", precio: 40000, descripcion: "Sedación suave supervisada para pacientes con ansiedad dental." },
    { nombre: "Pulido con flúor extra", precio: 6000, descripcion: "Pulido adicional con pastas profesionales y sellado de flúor." },
    { nombre: "Cargo por atención de urgencia", precio: 10000, descripcion: "Recargo aplicado a citas atendidas fuera de agenda por emergencia." },
]

const ESPECIALISTAS = [
    {
        codigoEmpleado: "DR-001",
        correoUsuario: "carlos.mora@dentcare.com",
        especialidad: "General",
        descripcion: "Odontólogo general con más de 10 años de experiencia en odontología integral.",
        servicios: ["Consulta y diagnóstico", "Limpieza dental (profilaxis)", "Resina/Obturación", "Corona dental"],
    },
    {
        codigoEmpleado: "DR-002",
        correoUsuario: "fernanda.solis@dentcare.com",
        especialidad: "Ortodoncia",
        descripcion: "Ortodoncista certificada en frenos metálicos y estética de la sonrisa.",
        servicios: ["Ajuste de brackets", "Instalación de frenos metálicos", "Blanqueamiento dental"],
    },
    {
        codigoEmpleado: "HIG-001",
        correoUsuario: "sofia.herrera@dentcare.com",
        especialidad: "Estética Dental",
        descripcion: "Higienista dental enfocada en prevención, profilaxis y educación de higiene oral.",
        servicios: ["Limpieza dental (profilaxis)", "Aplicación de flúor", "Blanqueamiento dental"],
    },
]

const HORARIOS = [
    ...[1, 2, 3, 4, 5].map((numeroOrden) => ({ numeroOrden, horaInicio: "08:00", horaFin: "17:00" })),
    { numeroOrden: 6, horaInicio: "08:00", horaFin: "12:00" },
]

const CITAS_PLAN = [
    // [estadoFinal, especialistaIdx, servicio, pacienteIdx, offsetDias, hora]
    ["Pendiente", 0, "Limpieza dental (profilaxis)", 0, 1, "09:00"],
    ["Pendiente", 1, "Ajuste de brackets", 1, 1, "10:30"],
    ["Pendiente", 2, "Blanqueamiento dental", 0, 2, "09:00"],
    ["Pendiente", 0, "Resina/Obturación", 1, 2, "14:00"],
    ["Confirmada", 0, "Consulta y diagnóstico", 0, 3, "08:30"],
    ["Confirmada", 1, "Instalación de frenos metálicos", 1, 4, "09:00"],
    ["Confirmada", 2, "Limpieza dental (profilaxis)", 1, 5, "10:00"],
    ["Confirmada", 0, "Corona dental", 0, 6, "11:00"],
    ["Finalizada", 0, "Consulta y diagnóstico", 0, 7, "09:00"],
    ["Finalizada", 2, "Aplicación de flúor", 1, 8, "08:30"],
    ["Finalizada", 1, "Ajuste de brackets", 0, 9, "15:00"],
    ["Cancelada", 0, "Consulta y diagnóstico", 1, 10, "16:00"],
    ["Cancelada", 1, "Blanqueamiento dental", 0, 11, "13:00"],
]

const MOTIVOS_CANCELACION = [
    "El paciente informó que no podrá asistir por razones laborales.",
    "La paciente solicitó reprogramar la cita por un viaje inesperado.",
]

async function main() {
    console.log(`\n🦷 Sembrando datos de DentiCare contra ${BASE_URL}\n`)

    /* 1. Login administrador */
    const login = await api("/usuarios/login", {
        metodo: "POST",
        cuerpo: { correo: "admin@citas.com", password: "Admin12345" },
    })
    token = login.token
    console.log("✓ Sesión iniciada como administrador")

    /* 2. Pacientes (registro público; ignora duplicados) */
    await intentar(
        () =>
            api("/usuarios/registro", {
                metodo: "POST",
                cuerpo: {
                    nombre: "María",
                    primerApellido: "López",
                    segundoApellido: "Jiménez",
                    correo: "maria.lopez@example.com",
                    telefono: "88111222",
                    password: "Cliente123",
                },
            }),
        "Registro de María López omitido"
    )
    await intentar(
        () =>
            api("/usuarios/registro", {
                metodo: "POST",
                cuerpo: {
                    nombre: "Ana",
                    primerApellido: "Rojas",
                    correo: "ana.rojas@example.com",
                    telefono: "88222333",
                    password: "Cliente123",
                },
            }),
        "Registro de Ana Rojas omitido"
    )

    const pacientes = await api("/usuarios?rol=Cliente")
    const pacientePorIndice = [
        pacientes.find((p) => p.correo === "maria.lopez@example.com"),
        pacientes.find((p) => p.correo === "ana.rojas@example.com"),
    ]
    if (!pacientePorIndice[0] || !pacientePorIndice[1]) {
        throw new Error("No se encontraron los pacientes sembrados.")
    }
    console.log("✓ Pacientes verificados")

    /* 3. Tratamientos */
    const especialidades = await api("/especialidades")
    const especialidadPorNombre = new Map(especialidades.map((e) => [e.nombre, e]))
    const serviciosExistentes = await api("/servicios")
    const servicioPorNombre = new Map(serviciosExistentes.map((s) => [s.nombre, s]))

    for (const servicio of SERVICIOS) {
        if (servicioPorNombre.has(servicio.nombre)) continue
        const especialidad = especialidadPorNombre.get(servicio.especialidad)
        if (!especialidad) throw new Error(`Especialidad faltante: ${servicio.especialidad}`)
        const creado = await api("/servicios", {
            metodo: "POST",
            cuerpo: {
                nombre: servicio.nombre,
                descripcion: servicio.descripcion,
                precioBase: servicio.precioBase,
                duracionMinutos: servicio.duracionMinutos,
                especialidadId: especialidad.id,
                imagen: null,
            },
        })
        servicioPorNombre.set(servicio.nombre, creado)
    }
    console.log(`✓ Tratamientos disponibles (${servicioPorNombre.size})`)

    /* 4. Servicios adicionales */
    const adicionalesExistentes = await api("/servicios-adicionales")
    const adicionalPorNombre = new Map(adicionalesExistentes.map((a) => [a.nombre, a]))
    for (const adicional of ADICIONALES) {
        if (adicionalPorNombre.has(adicional.nombre)) continue
        const creado = await api("/servicios-adicionales", {
            metodo: "POST",
            cuerpo: adicional,
        })
        adicionalPorNombre.set(adicional.nombre, creado)
    }
    console.log(`✓ Servicios adicionales disponibles (${adicionalPorNombre.size})`)

    /* 5. Especialistas */
    const usuariosEmpleado = await api("/usuarios?rol=Empleado")
    const empleadosExistentes = await api("/empleados")
    const empleadoPorCodigo = new Map(empleadosExistentes.map((e) => [e.codigoEmpleado, e]))

    for (const especialista of ESPECIALISTAS) {
        if (empleadoPorCodigo.has(especialista.codigoEmpleado)) continue
        const usuario = usuariosEmpleado.find((u) => u.correo === especialista.correoUsuario)
        if (!usuario) throw new Error(`Usuario Empleado faltante: ${especialista.correoUsuario}`)
        const especialidad = especialidadPorNombre.get(especialista.especialidad)
        if (!especialidad) throw new Error(`Especialidad faltante: ${especialista.especialidad}`)

        const servicioIds = especialista.servicios
            .map((nombre) => servicioPorNombre.get(nombre)?.id)
            .filter(Boolean)
        if (servicioIds.length < 3) {
            throw new Error(`El especialista ${especialista.codigoEmpleado} requiere al menos 3 tratamientos.`)
        }

        const creado = await api("/empleados", {
            metodo: "POST",
            cuerpo: {
                usuarioId: usuario.id,
                especialidadId: especialidad.id,
                codigoEmpleado: especialista.codigoEmpleado,
                descripcion: especialista.descripcion,
                servicioIds,
            },
        })
        empleadoPorCodigo.set(especialista.codigoEmpleado, creado)
    }
    console.log("✓ Especialistas verificados")

    /* 6. Horarios de atención */
    const diasSemana = await api("/dias-semana")
    const diaPorOrden = new Map(diasSemana.map((d) => [d.numeroOrden, d]))
    const horariosExistentes = await api("/horarios-atencion")

    for (const horario of HORARIOS) {
        const dia = diaPorOrden.get(horario.numeroOrden)
        if (!dia) throw new Error(`Día de semana faltante: orden ${horario.numeroOrden}`)
        const existe = horariosExistentes.some(
            (h) => h.diaSemanaId === dia.id && h.horaInicio === horario.horaInicio && h.horaFin === horario.horaFin
        )
        if (existe) continue
        await api("/horarios-atencion", {
            metodo: "POST",
            cuerpo: { diaSemanaId: dia.id, horaInicio: horario.horaInicio, horaFin: horario.horaFin, activo: true },
        })
    }
    console.log("✓ Horarios de atención configurados (lunes a sábado)")

    /* 7. Restricciones de horario */
    const tiposRestriccion = await api("/tipos-restriccion-horario")
    const tipoPorNombre = new Map(tiposRestriccion.map((t) => [t.nombre, t]))
    const restriccionesExistentes = await api("/restricciones-horario")
    const motivoExistente = new Set(restriccionesExistentes.map((r) => r.motivo))

    async function crearRestriccion({ tipo, motivo, fecha, empleadoCodigo = null, todoElDia = true, horaInicio = null, horaFin = null }) {
        if (motivoExistente.has(motivo)) return
        const tipoRestriccion = tipoPorNombre.get(tipo)
        if (!tipoRestriccion) throw new Error(`Tipo de restricción faltante: ${tipo}`)
        const empleado = empleadoCodigo ? empleadoPorCodigo.get(empleadoCodigo) : null
        await api("/restricciones-horario", {
            metodo: "POST",
            cuerpo: {
                tipoRestriccionId: tipoRestriccion.id,
                empleadoId: empleado?.id ?? null,
                fecha,
                horaInicio,
                horaFin,
                todoElDia,
                motivo,
            },
        })
        motivoExistente.add(motivo)
    }

    // Generales del establecimiento (2)
    await crearRestriccion({ tipo: "General del establecimiento", motivo: "Feriado nacional: clínica cerrada", fecha: fechaEn(20) })
    await crearRestriccion({ tipo: "General del establecimiento", motivo: "Capacitación general del equipo DentiCare", fecha: fechaEn(27) })

    // Específicas de empleado (3)
    await crearRestriccion({
        tipo: "Específica de empleado",
        motivo: "Congreso odontológico del Dr. Mora",
        fecha: fechaEn(14),
        empleadoCodigo: "DR-001",
    })
    await crearRestriccion({
        tipo: "Específica de empleado",
        motivo: "Incapacidad médica de la Dra. Solís",
        fecha: fechaEn(21),
        empleadoCodigo: "DR-002",
    })
    await crearRestriccion({
        tipo: "Específica de empleado",
        motivo: "Capacitación de la higienista Herrera",
        fecha: fechaEn(28),
        empleadoCodigo: "HIG-001",
    })

    // Parciales por horas (2)
    await crearRestriccion({
        tipo: "Parcial por horas",
        motivo: "Almuerzo y limpieza de instrumental del Dr. Mora",
        fecha: fechaEn(15),
        empleadoCodigo: "DR-001",
        todoElDia: false,
        horaInicio: "12:00",
        horaFin: "13:00",
    })
    await crearRestriccion({
        tipo: "Parcial por horas",
        motivo: "Mantenimiento de sillón dental de la HIG-001",
        fecha: fechaEn(22),
        empleadoCodigo: "HIG-001",
        todoElDia: false,
        horaInicio: "12:00",
        horaFin: "13:00",
    })

    // Día completo (1)
    await crearRestriccion({
        tipo: "Día completo",
        motivo: "Mantenimiento del equipo de rayos X",
        fecha: fechaEn(35),
    })
    console.log("✓ Restricciones de horario registradas")

    /* 8. Citas */
    const estadosCita = await api("/estados-cita")
    const estadoPorNombre = new Map(estadosCita.map((e) => [e.nombre, e]))
    const especialistasPlan = ESPECIALISTAS.map((e) => empleadoPorCodigo.get(e.codigoEmpleado))
    const adicionalesDemo = [...adicionalPorNombre.values()].slice(0, 2)

    const contador = { Pendiente: 0, Confirmada: 0, Finalizada: 0, Cancelada: 0 }
    const MOTIVOS = MOTIVOS_CANCELACION

    for (let i = 0; i < CITAS_PLAN.length; i++) {
        const [estadoFinal, idxEmpleado, nombreServicio, idxPaciente, offsetDias, hora] = CITAS_PLAN[i]
        const empleado = especialistasPlan[idxEmpleado]
        const servicio = servicioPorNombre.get(nombreServicio)
        const paciente = pacientePorIndice[idxPaciente]
        const fecha = fechaEn(offsetDias)

        const conAdicionales = i % 3 === 1 // cada tercera cita lleva 2 adicionales
        const adicionalesCita = conAdicionales ? adicionalesDemo : []
        const costoAdicionales = adicionalesCita.reduce((total, a) => total + Number(a.precio), 0)
        const costoTotal = Number(servicio.precioBase) + costoAdicionales

        const cuerpoBase = {
            clienteId: paciente.id,
            empleadoId: empleado.id,
            servicioId: servicio.id,
            fecha,
            horaInicio: hora,
            horaFin: sumarMinutosAHora(hora, servicio.duracionMinutos),
            duracionMinutos: servicio.duracionMinutos,
            precioServicio: Number(servicio.precioBase),
            costoAdicionales,
            costoTotal,
            observaciones: i % 2 === 0 ? "Paciente solicita atención puntual." : null,
            adicionalIds: adicionalesCita.map((a) => a.id),
        }

        // Validar disponibilidad antes de crear (obligatorio según enunciado).
        // El endpoint valida con un esquema estricto: solo acepta estos campos.
        const disponibilidad = await api("/citas/disponibilidad", {
            metodo: "POST",
            cuerpo: {
                empleadoId: cuerpoBase.empleadoId,
                servicioId: cuerpoBase.servicioId,
                fecha: cuerpoBase.fecha,
                horaInicio: cuerpoBase.horaInicio,
                horaFin: cuerpoBase.horaFin,
            },
        })
        if (!disponibilidad.disponible) {
            throw new Error(
                `Disponibilidad rechazada para cita #${i + 1} (${empleado.codigoEmpleado} ${fecha} ${hora}): ${disponibilidad.motivo}`
            )
        }

        const creada = await api("/citas", {
            metodo: "POST",
            cuerpo: {
                ...cuerpoBase,
                estadoCitaId: estadoPorNombre.get("Pendiente").id,
                creadoPorUsuarioId: 1,
            },
        })

        if (estadoFinal === "Finalizada") {
            await api(`/citas/${creada.id}/estado`, {
                metodo: "PATCH",
                cuerpo: { estadoCitaId: estadoPorNombre.get(estadoFinal).id },
            })
        } else if (estadoFinal === "Cancelada") {
            await api(`/citas/${creada.id}/cancelar`, {
                metodo: "PATCH",
                cuerpo: { motivoCancelacion: MOTIVOS[i % MOTIVOS.length] },
            })
        }
        contador[estadoFinal]++
    }

    console.log(
        `\n✅ Citas creadas: ${contador.Pendiente} pendientes, ${contador.Confirmada} confirmadas, ${contador.Finalizada} finalizadas, ${contador.Cancelada} canceladas`
    )
    console.log("\n🎉 Siembra de DentiCare completada con éxito.\n")
}

main().catch((error) => {
    console.error("\n❌ Error durante la siembra:", error.message)
    process.exit(1)
})
