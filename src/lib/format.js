// Utilidades puras de formato para la UI (moneda, fechas, horas, nombres).
// Convención del proyecto: las fechas viajan como "YYYY-MM-DD" y las horas
// como "HH:mm" en strings. Importante: evitamos new Date("YYYY-MM-DD")
// porque lo interpreta en UTC y puede correr la fecha un día según zona horaria;
// por eso el parseo manual con split donde importa el día exacto.

const currencyFormatter = new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
})

/**
 * Formatea un monto como moneda costarricense usando es-CR.
 *
 * @param {number|string} value - Monto a formatear.
 * @returns {string} Monto con formato CRC (ej. "₡12 500,00") o "—" si no es numérico.
 */
export function formatCurrency(value) {
    const amount = Number(value)
    if (Number.isNaN(amount)) return "—"
    return currencyFormatter.format(amount)
}

// Nombres de mes en español para armar fechas legibles sin depender de Date
const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

/**
 * Formatea una fecha "YYYY-MM-DD" como "dd de mes de yyyy"
 * sin usar Date para evitar desfases de zona horaria.
 */
export function formatFecha(fecha) {
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha ?? "—"
    const [y, m, d] = fecha.split("-").map(Number)
    return `${String(d).padStart(2, "0")} de ${MESES[m - 1]} de ${y}`
}

/**
 * Formatea "YYYY-MM-DD" de forma compacta "DD/MM/YYYY".
 * También con parse manual para no sufrir desfases horarios.
 *
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD".
 * @returns {string} Fecha formateada, el mismo string si es inválida, o "—" si es null.
 */
export function formatFechaCorta(fecha) {
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha ?? "—"
    const [y, m, d] = fecha.split("-")
    return `${d}/${m}/${y}`
}

/**
 * Muestra la hora tal cual llega del API ("HH:mm").
 * Solo existe como helper para centralizar el caso de valor vacío.
 *
 * @param {string|null} hora
 * @returns {string} La hora original o "—" si no viene.
 */
export function formatHora(hora) {
    if (!hora) return "—"
    return hora
}

/**
 * Convierte una duración en minutos a texto legible.
 *
 * @param {number|string} minutos - Duración total en minutos.
 * @returns {string} "45 min", "1 h" o "1 h 30 min"; "—" si no es un número válido.
 */
export function formatDuracion(minutos) {
    const total = Number(minutos)
    if (!Number.isFinite(total)) return "—"
    if (total < 60) return `${total} min`
    // A partir de la hora mostramos horas y, si sobran, los minutos restantes
    const horas = Math.floor(total / 60)
    const resto = total % 60
    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

/**
 * Une nombre y apellidos de una persona, saltando los campos vacíos.
 *
 * @param {object|null} persona - Objeto con { nombre, primerApellido, segundoApellido }.
 * @returns {string} Nombre completo o "—" si no hay persona.
 */
export function nombreCompleto(persona) {
    if (!persona) return "—"
    return [
        persona.nombre,
        persona.primerApellido,
        persona.segundoApellido,
    ]
        .filter(Boolean)
        .join(" ")
}

/**
 * Obtiene las iniciales de una persona (nombre + primer apellido)
 * para mostrarlas en avatares o chips.
 *
 * @param {object|null} persona - Objeto con { nombre, primerApellido }.
 * @returns {string} Iniciales en mayúscula (ej. "MP") o "?" si no hay nombre.
 */
export function iniciales(persona) {
    if (!persona?.nombre) return "?"
    const parts = [persona.nombre, persona.primerApellido].filter(Boolean)
    return parts.map((p) => p[0]).join("").toUpperCase()
}

/** Convierte "HH:mm" a minutos desde medianoche. */
export function horaAMinutos(hora) {
    const [h, m] = hora.split(":").map(Number)
    return h * 60 + m
}

/** Convierte minutos desde medianoche a "HH:mm". */
export function minutosAHora(minutos) {
    const h = Math.floor(minutos / 60)
    const m = minutos % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** Suma una duración en minutos a una hora "HH:mm". */
export function sumarMinutos(hora, duracion) {
    return minutosAHora(horaAMinutos(hora) + Number(duracion))
}

/** Devuelve la fecha de hoy local como "YYYY-MM-DD". */
export function hoyISO() {
    const ahora = new Date()
    const y = ahora.getFullYear()
    const m = String(ahora.getMonth() + 1).padStart(2, "0")
    const d = String(ahora.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

/** Suma días a una fecha "YYYY-MM-DD" sin desfase horario. */
export function agregarDias(fecha, dias) {
    const [y, m, d] = fecha.split("-").map(Number)
    const base = new Date(y, m - 1, d)
    base.setDate(base.getDate() + dias)
    return [
        base.getFullYear(),
        String(base.getMonth() + 1).padStart(2, "0"),
        String(base.getDate()).padStart(2, "0"),
    ].join("-")
}

/** Número de día de semana ISO (1=Lunes … 7=Domingo) para "YYYY-MM-DD". */
export function numeroDiaSemana(fecha) {
    const [y, m, d] = fecha.split("-").map(Number)
    const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
    return jsDay === 0 ? 7 : jsDay
}

/** Indica si dos rangos ["inicio","fin") se traslapan. */
export function rangosSeTraslapan(inicioA, finA, inicioB, finB) {
    return (
        horaAMinutos(inicioA) < horaAMinutos(finB) &&
        horaAMinutos(inicioB) < horaAMinutos(finA)
    )
}
