const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const gmailEmail = defineSecret("GMAIL_EMAIL");
const gmailPassword = defineSecret("GMAIL_PASSWORD");

/**
 * FUNCIÓN: APROBAR TRANSPORTISTA
 * Actualizada para crear perfil en colección 'usuarios' y 'transportistas'
 */
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

      // 1. Crear/Actualizar usuario en Firebase Authentication
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

      // 2. Asignar rol en Custom Claims (Seguridad de Token)
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: "transportista" });

      // 3. ACTUALIZACIÓN EN COLECCIÓN 'TRANSPORTISTAS'
      await transportistaRef.update({
        verificado: true,
        usuarioId: userRecord.uid,
        rol: "transportista", // Agregamos el campo rol aquí también
        fechaAprobacion: admin.firestore.FieldValue.serverTimestamp(),
        estadoVerificacion: "aprobado",
      });

      // 4. NUEVO: CREAR/ACTUALIZAR EN COLECCIÓN 'USUARIOS' (Para el Login y Gestión)
      // Esto es lo que evita que el login falle por no encontrar el documento
      await admin.firestore().collection("usuarios").doc(userRecord.uid).set({
        uid: userRecord.uid,
        nombre: nombre,
        email: email,
        telefono: telefono || "",
        rol: "transportista",
        activo: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true }); // 'merge' evita borrar datos si el usuario ya existía

      // 5. ENVÍO DE CORREO
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

/**
 * FUNCIÓN: RECHAZAR TRANSPORTISTA
 */
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