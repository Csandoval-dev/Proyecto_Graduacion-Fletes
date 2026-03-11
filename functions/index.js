// functions/index.js
const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const gmailEmail = defineSecret("GMAIL_EMAIL");
const gmailPassword = defineSecret("GMAIL_PASSWORD");
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

const TASA_HNL_USD = 26; // L.26 = $1 USD

const convertirHNLaUSD = (montoHNL) => {
  const usd = montoHNL / TASA_HNL_USD;
  return Math.round(usd * 100); // Stripe usa centavos
};


exports.crearIntentoPago = onCall(
  { cors: true, secrets: [stripeSecretKey] },
  async (request) => {
    const stripe = require('stripe')(stripeSecretKey.value());

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Debes estar autenticado");
    }

    const { solicitudId, monto } = request.data;

    if (!solicitudId || !monto || monto <= 0) {
      throw new HttpsError("invalid-argument", "Datos de pago inválidos");
    }

    try {
      console.log(`Creando Payment Intent — Solicitud: ${solicitudId} | Monto: L.${monto}`);

      // Verificar solicitud en Firestore
      const solicitudDoc = await admin.firestore()
        .collection('solicitudes')
        .doc(solicitudId)
        .get();

      if (!solicitudDoc.exists) {
        throw new HttpsError("not-found", "La solicitud no existe");
      }

      const solicitud = solicitudDoc.data();

      if (solicitud.usuarioId !== request.auth.uid) {
        throw new HttpsError("permission-denied", "No tienes permiso para pagar esta solicitud");
      }

      
      const montoCentavosUSD = convertirHNLaUSD(monto);
      const montoUSD = (montoCentavosUSD / 100).toFixed(2);

      console.log(`Conversión: L.${monto} HNL → $${montoUSD} USD (${montoCentavosUSD} centavos)`);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: montoCentavosUSD,   // ✅ Centavos USD
        currency: 'usd',            // ✅ USD en lugar de HNL
        metadata: {
          solicitudId,
          usuarioId: request.auth.uid,
          transportistaId: solicitud.transportistaId,
          montoHNL: monto.toString(),         // Guardamos el monto original en HNL
          montoUSD: montoUSD.toString(),
          tasaCambio: TASA_HNL_USD.toString()
        },
        description: `Flete Fletia: ${solicitud.descripcionCarga?.substring(0, 50)}`,
        automatic_payment_methods: { enabled: true }
      });

      console.log(`Payment Intent creado: ${paymentIntent.id} | $${montoUSD} USD`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        montoHNL: monto,
        montoUSD: parseFloat(montoUSD),
        tasaCambio: TASA_HNL_USD
      };

    } catch (error) {
      console.error('Error al crear Payment Intent:', error.message);
      // ✅ Siempre retornar mensaje legible, nunca null
      throw new HttpsError("internal", error.message || "Error al procesar el pago");
    }
  }
);

// Webhook para confirmar el pago desde Stripe
exports.confirmarPago = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const stripe = require('stripe')(stripeSecretKey.value());
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error('Webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const { solicitudId, transportistaId, montoHNL, montoUSD, tasaCambio } = paymentIntent.metadata;

      console.log(`Pago exitoso — Solicitud: ${solicitudId} | $${montoUSD} USD | L.${montoHNL} HNL`);

      try {
        await admin.firestore().collection('solicitudes').doc(solicitudId).update({
          pagado: true,
          estado: 'pagado',
          pago: {
            stripePaymentId: paymentIntent.id,
            // ✅ Guardamos ambos montos en Firestore
            montoPagado: parseFloat(montoHNL),   // Lo que ve el cliente (HNL)
            montoUSD: parseFloat(montoUSD),       // Lo que procesó Stripe (USD)
            tasaCambio: parseFloat(tasaCambio),
            fechaPago: admin.firestore.FieldValue.serverTimestamp(),
            metodo: paymentIntent.payment_method_types[0],
            procesado: true
          }
        });

        console.log('Firestore actualizado tras pago exitoso');

        await enviarNotificacionPush(
          transportistaId,
          ' Pago Confirmado',
          'El cliente pagó el flete. Ya puedes iniciar el servicio.'
        );

      } catch (dbError) {
        console.error('Error actualizando Firestore tras pago:', dbError);
      }
    }

    res.json({ received: true });
  }
);
//Funcion para aprobar transportista
exports.aprobarTransportista = onCall(
  { cors: true, secrets: [gmailEmail, gmailPassword] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "No autorizado.");
    }

    const { transportistaId } = request.data;
    if (!transportistaId) {
      throw new HttpsError("invalid-argument", "ID del transportista requerido.");
    }

    const transportistaRef = admin.firestore().collection("transportistas").doc(transportistaId);
    const doc = await transportistaRef.get();

    if (!doc.exists) {
      throw new HttpsError("not-found", "Transportista no encontrado.");
    }

    const { email, nombre, telefono } = doc.data();
    const passwordTemporal = Math.random().toString(36).slice(-10);

    try {
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email,
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

      await admin.auth().setCustomUserClaims(userRecord.uid, { role: "transportista" });

      const batch = admin.firestore().batch();
      batch.update(transportistaRef, {
        verificado: true,
        usuarioId: userRecord.uid,
        rol: "transportista",
        estadoVerificacion: "aprobado",
        fechaAprobacion: admin.firestore.FieldValue.serverTimestamp()
      });

      batch.set(admin.firestore().collection("usuarios").doc(userRecord.uid), {
        uid: userRecord.uid,
        nombre,
        email,
        telefono: telefono || "",
        rol: "transportista",
        activo: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      await batch.commit();

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailEmail.value(),
            pass: gmailPassword.value()
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
              <p>Ya puedes iniciar sesión con:</p>
              <ul>
                <li><strong>Usuario:</strong> ${email}</li>
                <li><strong>Contraseña temporal:</strong> ${passwordTemporal}</li>
              </ul>
              <p>Te recomendamos cambiar tu contraseña al iniciar sesión.</p>
              <br>
              <p>Saludos,<br>El equipo de Fletia HND</p>
            </div>
          `,
        });
      } catch (mailError) {
        console.error("Error al enviar correo:", mailError);
      }

      return { success: true, message: "Transportista aprobado.", uid: userRecord.uid };

    } catch (error) {
      console.error("Error en aprobarTransportista:", error);
      return { success: false, error: error.message || "Error interno" };
    }
  }
);
//Funcion para rechaza transportista
exports.rechazarTransportista = onCall(
  { cors: true, secrets: [gmailEmail, gmailPassword] },
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

      return { success: true, message: "Solicitud rechazada." };
    } catch (error) {
      console.error("Error al rechazar:", error);
      return { success: false, error: error.message };
    }
  }
);

// Notidicaciones Push


const MENSAJES_NOTIFICACION = {
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
    mensaje: "Tu carga fue recogida y está en camino"
  },
  entregado: {
    titulo: "Carga Entregada",
    mensaje: "Tu carga fue entregada"
  },
  finalizado: {
    titulo: "Servicio Finalizado",
    mensaje: "El servicio ha sido completado"
  }
};

async function enviarNotificacionPush(usuarioId, titulo, mensaje) {
  try {
    const userDoc = await admin.firestore().collection("usuarios").doc(usuarioId).get();

    if (!userDoc.exists) {
      console.log(`Usuario ${usuarioId} no encontrado`);
      return false;
    }

    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) {
      console.log(`Usuario ${usuarioId} sin token FCM`);
      return false;
    }

    const response = await admin.messaging().send({
      notification: { title: titulo, body: mensaje },
      data: { timestamp: new Date().toISOString() },
      token: fcmToken
    });

    console.log("Notificación enviada:", response);
    return true;

  } catch (error) {
    console.error("Error al enviar notificación:", error);
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      await admin.firestore().collection("usuarios").doc(usuarioId).update({
        fcmToken: admin.firestore.FieldValue.delete()
      });
    }
    return false;
  }
}

exports.notificarNuevaSolicitud = onDocumentCreated(
  "solicitudes/{solicitudId}",
  async (event) => {
    try {
      const solicitud = event.data.data();
      await enviarNotificacionPush(
        solicitud.transportistaId,
        " Nueva Solicitud de Flete",
        `${solicitud.nombreUsuario} necesita un flete`
      );
    } catch (error) {
      console.error("Error notificarNuevaSolicitud:", error);
    }
  }
);
//
exports.notificarCambioEstado = onDocumentUpdated(
  "solicitudes/{solicitudId}",
  async (event) => {
    try {
      const estadoAnterior = event.data.before.data().estado;
      const estadoNuevo = event.data.after.data().estado;

      if (estadoAnterior === estadoNuevo) return;

      const solicitud = event.data.after.data();
      const mensaje = MENSAJES_NOTIFICACION[estadoNuevo];

      if (!mensaje) return;

      if (["aceptada", "pagado", "en_camino", "recogido", "entregado"].includes(estadoNuevo)) {
        await enviarNotificacionPush(solicitud.usuarioId, mensaje.titulo, mensaje.mensaje);
      }

      if (estadoNuevo === "finalizado") {
        await enviarNotificacionPush(solicitud.transportistaId, mensaje.titulo, mensaje.mensaje);
      }

    } catch (error) {
      console.error("Error notificarCambioEstado:", error);
    }
  }
);

exports.notificarNuevoMensaje = onDocumentCreated(
  "conversaciones/{conversacionId}/mensajes/{mensajeId}",
  async (event) => {
    try {
      const mensaje = event.data.data();
      const conversacionId = event.params.conversacionId;

      const convDoc = await admin.firestore()
        .collection("conversaciones")
        .doc(conversacionId)
        .get();

      if (!convDoc.exists) return;

      const conversacion = convDoc.data();
      const participantes = conversacion.participantes || [];

      for (const participanteId of participantes) {
        if (participanteId !== mensaje.emisorId) {
          await enviarNotificacionPush(
            participanteId,
            `💬 Mensaje de ${mensaje.nombreEmisor}`,
            mensaje.contenido.substring(0, 100)
          );
        }
      }
    } catch (error) {
      console.error("Error notificarNuevoMensaje:", error);
    }
  }
);