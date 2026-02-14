import { httpsCallable } from "firebase/functions";
// Importamos la instancia ya configurada con la región correcta
import { functions } from "../firebase/firebase"; 

/**
 * APROBAR TRANSPORTISTA
 */
export const aprobarTransportista = async (transportistaId) => {
  try {
    // Usamos la instancia centralizada functions
    const aprobarFunction = httpsCallable(functions, "aprobarTransportista");
    const result = await aprobarFunction({ transportistaId });
    
    return {
      success: true,
      message: result.data.message,
      uid: result.data.uid
    };
  } catch (error) {
    console.error("Error en Cloud Function (Aprobar):", error);
    // Capturamos el mensaje de error que viene desde Firebase
    return {
      success: false,
      error: error.message || "Error interno del servidor"
    };
  }
};

/**
 * RECHAZAR TRANSPORTISTA
 */
export const rechazarTransportista = async (transportistaId, motivo = "") => {
  try {
    const rechazarFunction = httpsCallable(functions, "rechazarTransportista");
    const result = await rechazarFunction({ transportistaId, motivo });
    
    return {
      success: true,
      message: result.data.message
    };
  } catch (error) {
    console.error("Error en Cloud Function (Rechazar):", error);
    return {
      success: false,
      error: error.message || "Error al rechazar transportista"
    };
  }
};