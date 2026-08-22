const CR_OFFSET = "-06:00";

/* ============================================================
 * 1) Columnas @db.Time (HorarioAtencion, RestriccionHorario, Cita)
 *    TIME no tiene zona horaria: el valor se guarda LITERAL.
 *    "08:00" que envia React debe quedar guardado como "08:00:00",
 *    sin sumar ni restar nada. Usar "Z" (UTC) al construir el Date
 *    evita depender de la zona horaria configurada en la maquina
 *    donde corre Node .
 * ============================================================ */

export function horaParaTimeColumn(hora: string | Date): Date {
    let horaCompleta: string;

    if (hora instanceof Date) {
        const horas = String(hora.getUTCHours()).padStart(2, "0");
        const minutos = String(hora.getUTCMinutes()).padStart(2, "0");
        const segundos = String(hora.getUTCSeconds()).padStart(2, "0");
        horaCompleta = `${horas}:${minutos}:${segundos}`;
    } else {
        horaCompleta = hora.length === 5 ? `${hora}:00` : hora;
    }
    return new Date(`1970-01-01T${horaCompleta}Z`);
}

/**
 * Convierte el Date que devuelve Prisma para una columna TIME
 * a un string "HH:mm", literal (sin fecha, sin conversion de tz).
 */
export function timeColumnAString(fecha: Date): string {
    const horas = String(fecha.getUTCHours()).padStart(2, "0");
    const minutos = String(fecha.getUTCMinutes()).padStart(2, "0");
    return `${horas}:${minutos}`;
}

/* ============================================================
 * 2) Columnas @db.Date (RestriccionHorario.fecha, Cita.fecha)
 *    DATE tampoco tiene zona horaria: se guarda literal.
 * ============================================================ */

export function fechaParaDateColumn(fecha: string | Date): Date {
    let fechaCompleta: string;

    if (fecha instanceof Date) {
        const y = fecha.getUTCFullYear();
        const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
        const d = String(fecha.getUTCDate()).padStart(2, "0");
        fechaCompleta = `${y}-${m}-${d}`;
    } else {
        fechaCompleta = fecha; // "2026-08-04"
    }

    return new Date(`${fechaCompleta}T00:00:00Z`);
}

/**
 * Convierte el Date que devuelve Prisma para una columna DATE
 * a un string "YYYY-MM-DD", literal.
 */
export function dateColumnAString(fecha: Date): string {
    const y = fecha.getUTCFullYear();
    const m = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const d = String(fecha.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Calcula el numero de dia de la semana (lunes = 1 ... domingo = 7)
 * a partir de una fecha "YYYY-MM-DD", SIN depender de la zona horaria
 * configurada en la maquina donde corre Node. Construir el Date con
 * Date.UTC() evita el bug de "new Date(`${fecha}T12:00:00`)", que si
 * dependia del reloj/tz local del equipo del estudiante.
 */
export function diaSemanaDesdeFecha(fecha: string): number {
    const [year, month, day] = fecha.split("-").map(Number);
    const fechaUTC = new Date(Date.UTC(year, month - 1, day));
    const diaJS = fechaUTC.getUTCDay(); // domingo = 0 ... sabado = 6
    return diaJS === 0 ? 7 : diaJS;
}

/* ============================================================
 * 3) Columnas DateTime reales con fecha+hora .
 * ============================================================ */

export function fechaCRaUTC(fechaHora: string | Date): Date {
    let isoLocal: string;

    if (fechaHora instanceof Date) {
        const y = fechaHora.getUTCFullYear();
        const m = String(fechaHora.getUTCMonth() + 1).padStart(2, "0");
        const d = String(fechaHora.getUTCDate()).padStart(2, "0");
        const h = String(fechaHora.getUTCHours()).padStart(2, "0");
        const min = String(fechaHora.getUTCMinutes()).padStart(2, "0");
        const s = String(fechaHora.getUTCSeconds()).padStart(2, "0");
        isoLocal = `${y}-${m}-${d}T${h}:${min}:${s}`;
    } else {
        isoLocal = fechaHora.includes("T")
            ? fechaHora
            : fechaHora.replace(" ", "T");
        if (isoLocal.length === 16) isoLocal += ":00";
    }

    return new Date(`${isoLocal}${CR_OFFSET}`);
}

export function utcAFechaCR(fecha: Date): string {
    const partes = new Intl.DateTimeFormat("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Costa_Rica",
    }).formatToParts(fecha);

    const get = (tipo: string) =>
        partes.find((p) => p.type === tipo)?.value ?? "";

    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

export function utcAHoraCR(fecha: Date): string {
    return new Intl.DateTimeFormat("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Costa_Rica",
    }).format(fecha);
}

/** HorarioAtencion: horaInicio y horaFin (ambos DateTime @db.Time, requeridos). */
export function mapHorarioAtencionOutput<
    T extends { horaInicio: Date; horaFin: Date }
>(horario: T) {
    return {
        ...horario,
        horaInicio: timeColumnAString(horario.horaInicio),
        horaFin: timeColumnAString(horario.horaFin),
    };
}

/** RestriccionHorario: fecha (requerida), horaInicio/horaFin (nullable). */
export function mapRestriccionOutput<
    T extends {
        fecha: Date;
        horaInicio: Date | null;
        horaFin: Date | null;
    }
>(restriccion: T) {
    return {
        ...restriccion,
        fecha: dateColumnAString(restriccion.fecha),
        horaInicio: restriccion.horaInicio
            ? timeColumnAString(restriccion.horaInicio)
            : null,
        horaFin: restriccion.horaFin
            ? timeColumnAString(restriccion.horaFin)
            : null,
    };
}

/** Cita: fecha, horaInicio y horaFin (todos requeridos). */
export function mapCitaOutput<
    T extends { fecha: Date; horaInicio: Date; horaFin: Date }
>(cita: T) {
    return {
        ...cita,
        fecha: dateColumnAString(cita.fecha),
        horaInicio: timeColumnAString(cita.horaInicio),
        horaFin: timeColumnAString(cita.horaFin),
    };
}