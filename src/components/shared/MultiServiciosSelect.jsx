import { useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

/**
 * Selección múltiple de servicios mediante casillas de verificación
 * con filtro de búsqueda, para el formulario de especialistas.
 *
 * Trabaja con IDs: `seleccionados` es un array de ids y el padre
 * lo sincroniza vía onChange. La lista puede incluir servicios
 * inactivos (solo se muestran con la etiqueta "Inactivo").
 */
export function MultiServiciosSelect({ servicios = [], seleccionados = [], onChange }) {
    const [busqueda, setBusqueda] = useState("")

    // Filtra por nombre del servicio o por su especialidad asociada;
    // memoizado para no refiltrar en cada render del listado.
    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()
        if (!texto) return servicios
        return servicios.filter(
            (s) =>
                s.nombre.toLowerCase().includes(texto) ||
                s.especialidad?.nombre?.toLowerCase().includes(texto)
        )
    }, [servicios, busqueda])

    // Agrega o quita el id de la selección (inmutabilidad: nuevo array).
    function toggle(id) {
        const existe = seleccionados.includes(id)
        if (existe) {
            onChange(seleccionados.filter((s) => s !== id))
        } else {
            onChange([...seleccionados, id])
        }
    }

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Buscar tratamiento por nombre o especialidad…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9"
                />
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
                {filtrados.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        No se encontraron tratamientos.
                    </p>
                )}
                {filtrados.map((servicio) => (
                    <Label
                        key={servicio.id}
                        htmlFor={`servicio-${servicio.id}`}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-transparent p-2 hover:border-border hover:bg-muted/60"
                    >
                        <span className="flex items-center gap-3">
                            <Checkbox
                                id={`servicio-${servicio.id}`}
                                checked={seleccionados.includes(servicio.id)}
                                onCheckedChange={() => toggle(servicio.id)}
                            />
                            <span>
                                <span className="block text-sm font-medium">{servicio.nombre}</span>
                                <span className="block text-xs text-muted-foreground">
                                    {servicio.especialidad?.nombre ?? "—"}
                                </span>
                            </span>
                        </span>
                        {/* Solo informativo: un servicio inactivo sigue siendo seleccionable. */}
                        {!servicio.activo && (
                            <Badge variant="secondary">Inactivo</Badge>
                        )}
                    </Label>
                ))}
            </div>
            <p className="text-sm text-muted-foreground">
                {seleccionados.length} tratamiento(s) asignado(s). Debe asignar al menos uno.
            </p>
        </div>
    )
}

MultiServiciosSelect.propTypes = {
    servicios: PropTypes.array,
    seleccionados: PropTypes.array,
    onChange: PropTypes.func.isRequired,
}
