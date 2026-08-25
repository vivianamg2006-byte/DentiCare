import { useMemo } from "react"
import PropTypes from "prop-types"
import { Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    horaAMinutos,
    minutosAHora,
    hoyISO,
    rangosSeTraslapan,
} from "@/lib/format"

const PASO_MINUTOS = 30

/**
 * Cuadrícula de bloques de 30 minutos para elegir la hora de
 * una cita. Combina el horario de atención del día, las citas
 * existentes y las restricciones para marcar cada bloque como:
 * disponible / ocupado (cita) / bloqueado (restricción) /
 * fuera de horario.
 *
 * Un bloque solo es seleccionable si toda la duración del
 * tratamiento cabe sin traslapar citas ni restricciones y sin
 * pasar del cierre de la clínica.
 * 
 * HORAS
 */
export function SlotGrid({
    fecha,
    duracionMinutos,
    horarios = [],
    citas = [],
    restricciones = [],
    value,
    onChange,
}) {
    const slots = useMemo(() => {
        // Minutos actuales solo si la fecha consultada es hoy (para bloquear el pasado)
        const esHoy = fecha === hoyISO()
        const minutosAhora = esHoy
            ? new Date().getHours() * 60 + new Date().getMinutes()
            : Infinity

        const lista = []
        for (const horario of horarios) {
            const inicioJornada = horaAMinutos(horario.horaInicio)
            const finJornada = horaAMinutos(horario.horaFin)
            for (
                let minutos = inicioJornada;
                minutos + duracionMinutos <= finJornada;
                minutos += PASO_MINUTOS
            ) {
                const inicio = minutosAHora(minutos)
                const fin = minutosAHora(minutos + duracionMinutos)

                const citaQueTraslapa = citas.find((c) =>
                    rangosSeTraslapan(inicio, fin, c.horaInicio, c.horaFin)
                )
                const restriccionQueTraslapa = restricciones.find((r) => {
                    if (r.todoElDia) return true
                    return rangosSeTraslapan(inicio, fin, r.horaInicio, r.horaFin)
                })

                let estado = "disponible"
                if (citaQueTraslapa) estado = "ocupado"
                else if (restriccionQueTraslapa) estado = "bloqueado"

                // Bloques que ya pasaron hoy no son seleccionables
                if (esHoy && minutos <= minutosAhora && estado === "disponible") {
                    estado = "pasado"
                }

                lista.push({ inicio, fin, estado })
            }
        }
        return lista.sort((a, b) => a.inicio.localeCompare(b.inicio))
    }, [horarios, citas, restricciones, duracionMinutos, fecha])

    if (!fecha || duracionMinutos <= 0) {
        return null
    }
    if (horarios.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                La clínica no atiende en la fecha seleccionada.
            </p>
        )
    }
    if (slots.length === 0) {
        return (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No hay huecos con la duración del tratamiento dentro del horario de atención.
            </p>
        )
    }

    const clases = {
        disponible: "border-green-500/40 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400",
        ocupado: "border-red-500/40 bg-red-500/10 text-red-700 cursor-not-allowed dark:text-red-400",
        bloqueado: "border-orange-500/40 bg-orange-500/10 text-orange-700 cursor-not-allowed dark:text-orange-400",
        pasado: "border-border bg-muted/40 text-muted-foreground cursor-not-allowed",
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {slots.map((slot) => {
                    const seleccionado = value === slot.inicio
                    return (
                        <button
                            key={slot.inicio}
                            type="button"
                            disabled={slot.estado !== "disponible"}
                            onClick={() => onChange?.(slot.inicio, slot.fin)}
                            title={
                                slot.estado === "ocupado"
                                    ? "Ocupado por otra cita"
                                    : slot.estado === "bloqueado"
                                      ? "Bloqueado por restricción"
                                      : slot.estado === "pasado"
                                        ? "Hora ya transcurrida"
                                        : `Disponible: ${slot.inicio} – ${slot.fin}`
                            }
                            className={cn(
                                "rounded-lg border px-1 py-2 text-center text-xs font-medium transition-colors",
                                clases[slot.estado],
                                seleccionado && "ring-2 ring-primary bg-primary text-primary-foreground hover:bg-primary"
                            )}
                        >
                            {slot.inicio}
                        </button>
                    )
                })}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded border border-green-500/50 bg-green-500/20" /> Disponible
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded border border-red-500/50 bg-red-500/20" /> Ocupado
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded border border-orange-500/50 bg-orange-500/20" /> Restringido
                </span>
                <span className="inline-flex items-center gap-1">
                    <Ban className="h-3 w-3" /> Los ocupados/restringidos no se pueden seleccionar
                </span>
            </div>
        </div>
    )
}

SlotGrid.propTypes = {
    fecha: PropTypes.string,
    duracionMinutos: PropTypes.number,
    horarios: PropTypes.array,
    citas: PropTypes.array,
    restricciones: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func,
}
