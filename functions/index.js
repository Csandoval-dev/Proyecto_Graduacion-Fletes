const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const gmailEmail = defineSecret("GMAIL_EMAIL");
const gmailPassword = defineSecret("GMAIL_PASSWORD");

//funcion para  aprobar transportita esa funcion es crucial realiza varias tareas:crea el usuario en firebase auth, le asigna el rol de transportista, actualiza su estado y envia un correo con sus credenciales
exports.aprobarTransportista = onCall(
  {
    cors: true,
    secrets: [gmailEmail, gmailPassword],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Debes estar autenticado para realizar esta acción.");
    }

    const { transportistaId } = request.data;
    if (!transportistaId) {
      throw new HttpsError("invalid-argument", "El ID del transportista es requerido.");
    }

    try {
      const transportistaRef = admin.firestore().collection("transportistas").doc(transportistaId);
      const doc = await transportistaRef.get();

      if (!doc.exists) {
        throw new HttpsError("not-found", "El transportista no existe en la base de datos.");
      }

      const { email, nombre, telefono } = doc.data();
      const passwordTemporal = Math.random().toString(36).slice(-10);

      //  Crear/Actualizar usuario en Firebase Authentication
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email: email,
          password: passwordTemporal,
          displayName: nombre,
        });
      } catch (authError) {
        if (authError.code === "auth/email-already-exists") {
          userRecord = await admin.auth().getUserByEmail(email);
          await admin.auth().updateUser(userRecord.uid, { password: passwordTemporal });
        } else {
          throw authError;
        }
      }

      //  Asignar rol en a firebase auth
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: "transportista" });

      //  ACTUALIZACIÓN EN COLECCIÓN 'TRANSPORTISTAS'
      await transportistaRef.update({
        verificado: true,
        usuarioId: userRecord.uid,
        rol: "transportista", // Agregamos el campo rol aquí también
        fechaAprobacion: admin.firestore.FieldValue.serverTimestamp(),
        estadoVerificacion: "aprobado",
      });

      // Sincroniza datos con la coleccion usuarios para facilitar consultas y gestion de perfiles
      await admin.firestore().collection("usuarios").doc(userRecord.uid).set({
        uid: userRecord.uid,
        nombre: nombre,
        email: email,
        telefono: telefono || "",
        rol: "transportista",
        activo: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true }); 
      //  ENVÍO DE CORREO
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailEmail.value(),
            pass: gmailPassword.value(),
          },
        });

        await transporter.sendMail({
          from: `"Fletia HND" <${gmailEmail.value()}>`,
          to: email,
          subject: "¡Bienvenido a Fletia! Tu cuenta ha sido aprobada",
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>¡Hola, ${nombre}!</h2>
              <p>Tu solicitud como transportista ha sido <strong>aprobada</strong> exitosamente.</p>
              <p>Ya puedes iniciar sesión en la aplicación con las siguientes credenciales:</p>
              <ul>
                <li><strong>Usuario:</strong> ${email}</li>
                <li><strong>Contraseña temporal:</strong> ${passwordTemporal}</li>
              </ul>
              <p>Te recomendamos cambiar tu contraseña al iniciar sesión por primera vez.</p>
              <br>
              <p>Saludos,<br>El equipo de Fletia HND</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Error al enviar correo:", mailError.message);
      }

      return {
        success: true,
        message: "Transportista aprobado y perfiles sincronizados correctamente.",
        uid: userRecord.uid,
      };

    } catch (error) {
      console.error("Error global en aprobarTransportista:", error);
      return {
        success: false,
        error: error.message || "Error interno del servidor",
      };
    }
  }
);

//FUNCIÓN: RECHAZAR TRANSPORTISTA
 
exports.rechazarTransportista = onCall(
  {
    cors: true,
    secrets: [gmailEmail, gmailPassword],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "No autorizado.");
    }

    const { transportistaId, motivo } = request.data;

    try {
      await admin.firestore().collection("transportistas").doc(transportistaId).update({
        verificado: false,
        estadoVerificacion: "rechazado",
        motivoRechazo: motivo || "No especificado",
        fechaRechazo: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, message: "Solicitud rechazada correctamente." };
    } catch (error) {
      console.error("Error al rechazar:", error);
      return { success: false, error: error.message };
    }
  }
);


//Funciones para Cloud Messaging
// Mensajes de notificación según el estado
const MENSAJES_NOTIFICACION = {
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
    mensaje: "Tu carga fue recogida y está en camino"
  },
  entregado: {
    titulo: "Carga Entregada",
    mensaje: "Tu carga fue entregada. Confirma la recepción"
  },
  finalizado: {
    titulo: "Servicio Finalizado",
    mensaje: "El servicio ha sido completado"
  }
};

// Función helper para enviar notificación push
async function enviarNotificacionPush(usuarioId, titulo, mensaje) {
  try {
    const userDoc = await admin.firestore().collection("usuarios").doc(usuarioId).get();
    
    if (!userDoc.exists) {
      console.log(`Usuario ${usuarioId} no existe`);
      return false;
    }

    const fcmToken = userDoc.data().fcmToken;

    if (!fcmToken) {
      console.log(`Usuario ${usuarioId} no tiene token FCM`);
      return false;
    }
    // Contruir el payload de la notificacion
const payload = {
  notification: {  
    title: titulo,  
    body: mensaje   
  },
  data: {  
    timestamp: new Date().toISOString()
  },
  webpush: {
    headers: { 
      Urgency: "high"
    },
    notification: {  
      icon: '/logo192.png',
      badge: '/logo192.png',
      requireInteraction: true,
      tag: 'fletia-notification'
    }
  },
  token: fcmToken
};
    const response = await admin.messaging().send(payload);
    console.log("Notificación enviada:", response);
    return true;

  } catch (error) {
    console.error("Error al enviar notificación:", error);
    
    // Si el token es inválido, eliminarlo
    if (error.code === "messaging/invalid-registration-token" || 
        error.code === "messaging/registration-token-not-registered") {
      await admin.firestore().collection("usuarios").doc(usuarioId).update({
        fcmToken: admin.firestore.FieldValue.delete()
      });
    }
    return false;
  }
}

// Trigger para notificar al transportista cuando se crea una nueva solicitu de flete
exports.notificarNuevaSolicitud = onDocumentCreated(
  "solicitudes/{solicitudId}",
  async (event) => {
    try {
      const solicitud = event.data.data();
      const transportistaId = solicitud.transportistaId;

      await enviarNotificacionPush(
        transportistaId,
        "¡Nueva Solicitud de Flete!",
        `${solicitud.nombreUsuario} necesita un flete`
      );

      console.log("Notificación de nueva solicitud enviada");
    } catch (error) {
      console.error("Error al notificar nueva solicitud:", error);
    }
  }
);

// trigger para notificar al cliente y transportista cuando hay un cambio  de estado en la solicitud de flete.
exports.notificarCambioEstado = onDocumentUpdated(
  "solicitudes/{solicitudId}",
  async (event) => {
    try {
      const estadoAnterior = event.data.before.data().estado;
      const estadoNuevo = event.data.after.data().estado;

      // Solo notificar si el estado cambió
      if (estadoAnterior === estadoNuevo) {
        return;
      }

      const solicitud = event.data.after.data();
      const mensaje = MENSAJES_NOTIFICACION[estadoNuevo];

      if (!mensaje) {
        console.log(`No hay mensaje para el estado: ${estadoNuevo}`);
        return;
      }

      // Notificar al cliente cuando el transportista hace cambios
      if (["aceptada", "en_camino", "recogido", "entregado"].includes(estadoNuevo)) {
        await enviarNotificacionPush(
          solicitud.usuarioId,
          mensaje.titulo,
          mensaje.mensaje
        );
      }

      // Notificar al transportista cuando se finaliza
      if (estadoNuevo === "finalizado") {
        await enviarNotificacionPush(
          solicitud.transportistaId,
          mensaje.titulo,
          mensaje.mensaje
        );
      }

      console.log(`Notificación de cambio de estado enviada: ${estadoNuevo}`);
    } catch (error) {
      console.error("Error al notificar cambio de estado:", error);
    }
  }
);

//Trigger para notificar a los participantes de una conversacion cuando se recibe un mensaje  nuevo.
exports.notificarNuevoMensaje = onDocumentCreated(
  "conversaciones/{conversacionId}/mensajes/{mensajeId}",
  async (event) => {
    try {
      const mensaje = event.data.data();
      const conversacionId = event.params.conversacionId;

      // Obtener info de la conversación
      const convDoc = await admin.firestore()
        .collection("conversaciones")
        .doc(conversacionId)
        .get();

      if (!convDoc.exists) {
        console.log("Conversación no encontrada");
        return;
      }

      const conversacion = convDoc.data();
      const participantes = conversacion.participantes || [];
      const emisorId = mensaje.emisorId;

      // Notificar a todos los participantes excepto al emisor
      for (const participanteId of participantes) {
        if (participanteId !== emisorId) {
          await enviarNotificacionPush(
            participanteId,
            `Mensaje de ${mensaje.nombreEmisor}`,
            mensaje.contenido.substring(0, 100)
          );
        }
      }

      console.log("Notificación de nuevo mensaje enviada");
    } catch (error) {
      console.error("Error al notificar nuevo mensaje:", error);
    }
  }
);