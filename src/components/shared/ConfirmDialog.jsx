import PropTypes from "prop-types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

/** Diálogo de confirmación reutilizable (activar/desactivar, eliminar, etc.). */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmText = "Confirmar", destructive = false, onConfirm }) {
    return (
        // Controlado desde el padre: open/onOpenChange; la acción real
        // la ejecuta el padre vía onConfirm.
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    {/* En acciones peligrosas (destructive) el botón va en rojo. */}
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={destructive ? "bg-destructive text-white hover:bg-destructive/90" : ""}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    confirmText: PropTypes.string,
    destructive: PropTypes.bool,
    onConfirm: PropTypes.func.isRequired,
}
