import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/FormError"
import { cancelarCitaSchema } from "@/schemas/citaSchema"
import { cancelarCita } from "@/services/citasService"
import { useAuth } from "@/auth/useAuth"

/**
 * Diálogo para cancelar una cita con motivo obligatorio
 * (5 a 255 caracteres, igual que el DTO del API).
 *
 * Revalidación de seguridad antes de llamar al API (no basta con que el
 * botón esté oculto): un Cliente solo puede cancelar SUS propias citas y
 * únicamente cuando están en estado Pendiente; administradores y empleados
 * asignados pueden cancelar siempre que el estado no lo bloquee.
 */
export function CancelarCitaDialog({ open, onOpenChange, cita, onConfirmada }) {
    const { rol, user } = useAuth()
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(cancelarCitaSchema),
        defaultValues: { motivoCancelacion: "" },
    })

    if (!cita) return null

    async function onSubmit(data) {
        // Doble verificación de permisos: si alguna regla no se cumple,
        // NO se ejecuta la solicitud al API.
        if (rol === "Cliente") {
            const esPropia = cita.clienteId === user.id
            const esPendiente = cita.estadoCita?.nombre === "Pendiente"
            if (!esPropia || !esPendiente) {
                toast.error(
                    "Solo puede cancelar sus propias citas cuando están en estado Pendiente."
                )
                onOpenChange(false)
                return
            }
        }
        try {
            await cancelarCita(cita.id, data.motivoCancelacion.trim())
            toast.success("La cita fue cancelada correctamente.")
            reset()
            onOpenChange(false)
            onConfirmada?.()
        } catch (e) {
            toast.error(e.message || "No se pudo cancelar la cita.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar cita</DialogTitle>
                    <DialogDescription>
                        ¿Está seguro de que desea cancelar esta cita? Esta acción no se puede
                        deshacer. Indique el motivo de la cita del {String(cita.fecha).slice(0, 10)}{" "}
                        a las {cita.horaInicio}; quedará registrado en el sistema.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
                    <div className="grid gap-2">
                        <Label htmlFor="motivoCancelacion">Motivo de cancelación *</Label>
                        <Textarea
                            id="motivoCancelacion"
                            rows={3}
                            placeholder="El paciente informó que no podrá asistir…"
                            {...register("motivoCancelacion")}
                        />
                        <FormError message={errors.motivoCancelacion?.message} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Volver
                        </Button>
                        <Button type="submit" variant="destructive" disabled={isSubmitting}>
                            {isSubmitting ? "Cancelando…" : "Cancelar cita"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

CancelarCitaDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    cita: PropTypes.object,
    onConfirmada: PropTypes.func,
}
