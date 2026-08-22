import PropTypes from "prop-types";

/**
 * Mensaje de error en rojo para mostrar bajo un campo de formulario.
 * Patrón de uso: se pasa el mensaje del estado de error y si es
 * falsy (vacío/null) no renderiza nada, así se puede montar siempre.
 */
export function FormError({ message }) {
    if (!message) return null;

    return (
        <p className="mt-1 text-sm font-medium text-destructive">
            {message}
        </p>
    );
}

FormError.propTypes = {
    message: PropTypes.string
}
