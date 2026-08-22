import { useState } from "react"
import { toast } from "react-hot-toast"
import PropTypes from "prop-types"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cambiarEstadoCita } from "@/services/citasService"

/**
 * Diálogo para cambiar el estado de una cita (solo
 * Administrador y Empleado). El API valida las transiciones.
 */
export function CambiarEstadoDialog({ open, onOpenChange, cita, estados = [], onConfirmado }) {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState("")
    const [enviando, setEnviando] = useState(false)

    if (!cita) return null

    async function confirmar() {
        if (!estadoSeleccionado) {
            toast.error("Debe seleccionar un estado.")
            return
        }
        setEnviando(true)
        try {
            await cambiarEstadoCita(cita.id, Number(estadoSeleccionado))
            toast.success("Estado de la cita actualizado correctamente.")
            setEstadoSeleccionado("")
            onOpenChange(false)
            onConfirmado?.()
        } catch (e) {
            toast.error(e.message || "No se pudo cambiar el estado de la cita.")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar estado de la cita</DialogTitle>
                    <DialogDescription>
                        Estado actual: {cita.estadoCita?.nombre}. Seleccione el nuevo estado; el
                        sistema validará que la transición sea permitida.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label>Nuevo estado *</Label>
                    <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione un estado…" />
                        </SelectTrigger>
                        <SelectContent>
                            {estados
                                .filter((e) => e.id !== cita.estadoCitaId)
                                .map((estado) => (
                                    <SelectItem key={estado.id} value={String(estado.id)}>
                                        {estado.nombre}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                        Volver
                    </Button>
                    <Button type="button" onClick={confirmar} disabled={enviando || !estadoSeleccionado}>
                        {enviando ? "Actualizando…" : "Actualizar estado"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

CambiarEstadoDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    cita: PropTypes.object,
    estados: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            nombre: PropTypes.string,
        })
    ),
    onConfirmado: PropTypes.func,
}
