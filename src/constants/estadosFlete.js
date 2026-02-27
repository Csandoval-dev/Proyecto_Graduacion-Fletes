export const ESTADOS_FLETE = {
  pendiente: {
    label: "Pendiente",
    descripcion: "Esperando respuesta del transportista",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",

    siguienteEstado: "aceptada",
    accionTransportista: "Aceptar Solicitud",  
    accionCliente: null,
    notificar: ["transportista"]
  },
  
  aceptada: {
    label: "Aceptada",
    descripcion: "El transportista aceptó tu solicitud",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icono: "✓",
    siguienteEstado: "en_camino",
    accionTransportista: "Iniciar Servicio",
    accionCliente: null,
    notificar: ["cliente"]
  },
  
  en_camino: {
    label: "En Camino",
    descripcion: "El transportista va hacia el origen",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    siguienteEstado: "recogido",
    accionTransportista: "Marcar Recogido",
    accionCliente: null,
    notificar: ["cliente"]
  },
  
  recogido: {
    label: "Carga Recogida",
    descripcion: "La carga fue recogida",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    siguienteEstado: "entregado",
    accionTransportista: "Marcar Entregado",
    accionCliente: null,
    notificar: ["cliente"]
  },
  
  entregado: {
    label: "Entregado",
    descripcion: "La carga fue entregada",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    siguienteEstado: "finalizado",
    accionTransportista: null,
    accionCliente: "Confirmar y Calificar",
    notificar: ["cliente"]
  },
  
  finalizado: {
    label: "Finalizado",
    descripcion: "Servicio completado",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    siguienteEstado: null,
    accionTransportista: null,
    accionCliente: null,
    notificar: ["transportista"]
  },
  
  cancelado: {
    label: "Cancelado",
    descripcion: "Servicio cancelado",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    siguienteEstado: null,
    accionTransportista: null,
    accionCliente: null,
    notificar: ["cliente", "transportista"]
  }
};

export const getEstadoInfo = (estado) => {
  return ESTADOS_FLETE[estado] || ESTADOS_FLETE.pendiente;
};

export const MENSAJES_NOTIFICACION = {
  aceptada: {
    titulo: "¡Solicitud Aceptada!",
    mensaje: "El transportista aceptó tu solicitud de flete"
  },
  en_camino: {
    titulo: "Transportista en Camino",
    mensaje: "El transportista va hacia el punto de recogida"
  },
  recogido: {
    titulo: "Carga Recogida",
    mensaje: "Tu carga fue recogida y está en camino al destino"
  },
  entregado: {
    titulo: "Carga Entregada",
    mensaje: "Tu carga fue entregada. Por favor confirma la recepción"
  },
  finalizado: {
    titulo: "Servicio Finalizado",
    mensaje: "El servicio ha sido completado exitosamente"
  },
  cancelado: {
    titulo: "Servicio Cancelado",
    mensaje: "El servicio ha sido cancelado"
  }
};