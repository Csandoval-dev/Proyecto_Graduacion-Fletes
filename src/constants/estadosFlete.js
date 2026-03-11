
export const ESTADOS_FLETE = {
  pendiente: {
    label: "Pendiente",
    descripcion: "Esperando respuesta del transportista",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    icono: "",
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
    icono: "",
    siguienteEstado: "pagado",
    accionTransportista: "Aceptar esta solicitud",
    accionCliente: null,
    notificar: ["cliente"]
  },

  pagado: {
    label: "Pagado",
    descripcion: "Pago confirmado - Listo para iniciar",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icono: "",
    siguienteEstado: "en_camino",
    accionTransportista: "Iniciar Servicio",
    accionCliente: null,
    notificar: ["transportista"]
  },
  
  en_camino: {
    label: "En Camino",
    descripcion: "El transportista va hacia el origen",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icono: "",
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
    icono: "",
    siguienteEstado: "entregado",
    accionTransportista: "Marcar Entregado",
    accionCliente: null,
    notificar: ["cliente"]
  },
  
  // ==========================================
  // MODIFICADO: Ahora el CLIENTE finaliza
  // ==========================================
  entregado: {
    label: "Entregado",
    descripcion: "La carga fue entregada",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icono: "",
    siguienteEstado: "finalizado",
    accionTransportista: null, // CAMBIO: Transportista ya no puede finalizar
    accionCliente: "Confirmar y Calificar", // CAMBIO: Cliente finaliza con calificación
    notificar: ["cliente"]
  },
  
  finalizado: {
    label: "Finalizado",
    descripcion: "Servicio completado",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    icono: "",
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
    icono: "",
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
    titulo: "Solicitud Aceptada",
    mensaje: "El transportista aceptó tu solicitud de flete"
  },
  pagado: { 
    titulo: "Pago Confirmado",
    mensaje: "El pago fue confirmado. El servicio iniciará pronto"
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
    mensaje: "Tu carga fue entregada"
  },
  
  calificacion_recibida: {
    titulo: "Nueva Calificación",
    mensaje: "Has recibido una nueva calificación de un cliente"
  },
  finalizado: {
    titulo: "Servicio Finalizado",
    mensaje: "Gracias por usar Fletia. El servicio ha sido completado"
  },
  cancelado: {
    titulo: "Servicio Cancelado",
    mensaje: "El servicio ha sido cancelado"
  }
};