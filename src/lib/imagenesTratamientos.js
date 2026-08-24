// Imágenes locales del catálogo de tratamientos.
// Se comparte entre el listado y el detalle de tratamientos.
import ajusteBracketsImg from "@/assets/images/ajusteBrackets.jpg"
import aplicacionFluorImg from "@/assets/images/aplicacionFluor.jpg"
import blanqueamientoDentalImg from "@/assets/images/blanqueamientoDental.jpg"
import carillaResinaImg from "@/assets/images/carillaResina.jpg"
import consultaDiagnosticoImg from "@/assets/images/consultaDiagnostico.jpg"
import consultaOdontopediatricaImg from "@/assets/images/consultaOdontopediatrica.jpg"
import coronaDentalImg from "@/assets/images/coronaDental.jpg"
import disennoSonrisaImg from "@/assets/images/disennoSonrisa.jpg"
import endodonciaImg from "@/assets/images/endodonciaTratamientoConducto.jpg"
import extraccionSimpleImg from "@/assets/images/extraccionSimple.jpg"
import extraccionTercerMolarImg from "@/assets/images/extraccionTercerMolar.jpg"
import instalacionFrenosImg from "@/assets/images/instalacionFrenosMetalicos.jpg"
import limpiezaDentalImg from "@/assets/images/limpiezaDentalProfilaxis.jpg"
import resinaObturacionImg from "@/assets/images/resinaObturacion.jpg"
import retiroBracketsImg from "@/assets/images/retiroBracketsRetenedor.jpg"

/**
 * Asocia cada tratamiento con su imagen local según palabras clave
 * del nombre (sin acentos ni signos). El orden importa: primero las
 * coincidencias más específicas.
 */
const IMAGENES_TRATAMIENTOS = [
    { claves: ["odontopediatrica", "odontopediatria"], imagen: consultaOdontopediatricaImg },
    { claves: ["consultadiagnostico", "diagnostico"], imagen: consultaDiagnosticoImg },
    { claves: ["profilaxis", "limpieza"], imagen: limpiezaDentalImg },
    { claves: ["fluor"], imagen: aplicacionFluorImg },
    { claves: ["carilla"], imagen: carillaResinaImg },
    { claves: ["resina", "obturacion", "empaste"], imagen: resinaObturacionImg },
    { claves: ["conducto", "endodoncia"], imagen: endodonciaImg },
    { claves: ["tercermolar", "molar", "cordal"], imagen: extraccionTercerMolarImg },
    { claves: ["extraccion"], imagen: extraccionSimpleImg },
    { claves: ["frenos"], imagen: instalacionFrenosImg },
    { claves: ["retirodebrackets", "retirobrackets", "retiro", "retenedor"], imagen: retiroBracketsImg },
    { claves: ["ajustedebrackets", "ajustebrackets", "ajuste"], imagen: ajusteBracketsImg },
    { claves: ["blanqueamiento"], imagen: blanqueamientoDentalImg },
    { claves: ["corona"], imagen: coronaDentalImg },
    { claves: ["diseno", "disenno"], imagen: disennoSonrisaImg },
]

/**
 * Devuelve la imagen local que corresponde al nombre del tratamiento,
 * o null si ninguna coincide.
 *
 * @param {string} nombre - Nombre del servicio/tratamiento.
 * @returns {string|null} URL de la imagen importada o null.
 */
export function imagenTratamiento(nombre) {
    const texto = (nombre ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
    if (!texto) return null
    const coincidencia = IMAGENES_TRATAMIENTOS.find(({ claves }) =>
        claves.some((clave) => texto.includes(clave))
    )
    return coincidencia?.imagen ?? null
}
