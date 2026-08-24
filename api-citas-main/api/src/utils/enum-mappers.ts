export interface EnumOption {
    value: string;
    label: string;
}

//Estado de las Órdenes
export const EstadoOrdenMap: Record<string, string> = {
    PENDIENTE: "Pendiente de Pago",
    PAGADA: "Pagada",
    ENVIADA: "Enviada",
    CANCELADA: "Cancelada"
};

// Roles
export const RoleMap: Record<string, string> = {
    USER: "Cliente",
    ADMIN: "Administrador"
};

/**
 * Convierte un diccionario de mapas en un array de opciones
 */
export function getEnumOptions<T extends string>(map: Record<T, string>): EnumOption[] {
    return Object.entries(map).map(([value, label]) => ({
        value,
        label: label as string
    }));
}
