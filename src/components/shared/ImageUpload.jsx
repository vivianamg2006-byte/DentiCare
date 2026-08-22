import { useRef } from "react"
import PropTypes from "prop-types"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const FORMATOS_ACEPTADOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const TAMANIO_MAXIMO = 5 * 1024 * 1024 // 5 MB

/**
 * Selector de imagen con vista previa local y validación de
 * formato (jpg/jpeg/png/webp) y tamaño máximo antes de subir.
 *
 * Contrato con el padre: este componente SOLO elige/valida el archivo.
 * El formulario contenedor es quien lo envía como multipart al API
 * en el campo "image"; el API responde un fileName y la imagen guardada
 * llega después como `urlImagen` (que se pasa aquí como previewUrl).
 */
export function ImageUpload({ value, previewUrl, onChange, onError, disabled }) {
    const inputRef = useRef(null)

    function handleSelect(event) {
        const archivo = event.target.files?.[0]
        if (!archivo) return
        // Validaciones en cliente ANTES de gastar ancho de banda.
        if (!FORMATOS_ACEPTADOS.includes(archivo.type)) {
            onError("Formato no permitido. Use JPG, PNG o WEBP.")
            return
        }
        if (archivo.size > TAMANIO_MAXIMO) {
            onError("La imagen supera el tamaño máximo permitido (5 MB).")
            return
        }
        // Vista previa local con Blob URL (no requiere subir nada todavía).
        onChange({ archivo, vistaPrevia: URL.createObjectURL(archivo) })
        onError("")
    }

    function handleRemove() {
        onChange({ archivo: null, vistaPrevia: null })
        // Reseteamos el input para poder volver a elegir el MISMO archivo
        // (onChange no se dispara si el value no cambia).
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleSelect}
            />
            {/* Con preview mostramos la imagen (local o urlImagen ya guardada);
                sin preview, el botón punteado que abre el file input oculto. */}
            {previewUrl ? (
                <div className="relative w-fit overflow-hidden rounded-xl border border-border">
                    <img src={previewUrl} alt="Vista previa" className="h-40 w-auto object-cover" />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            aria-label="Quitar imagen"
                            className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white hover:bg-destructive/90"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className="flex h-40 w-full flex-col gap-2 border-dashed"
                >
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <span>Seleccionar imagen</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        JPG, PNG o WEBP · máx. 5 MB {value ? "(imagen actual guardada)" : "(opcional)"}
                    </span>
                </Button>
            )}
        </div>
    )
}

ImageUpload.propTypes = {
    value: PropTypes.string,
    previewUrl: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
}
