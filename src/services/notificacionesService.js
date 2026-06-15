import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db, getMessagingInstance, getMessagingServiceWorkerRegistration } from '../firebase/firebase';

const VAPID_KEY = 'BNZDYKYgu2CmN0-no0xg5Aqzvx6lczSESmJgFerYpybSGZL2BNGz7I08xjXLW1ItnU5fuvPpDGpvb51OmVVS0Sc';

const esSafari = () => {
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
};

const getContenidoNotificacion = (payload) => {
  const titulo = payload?.notification?.title || payload?.data?.titulo || 'Fletia HND';
  const mensaje = payload?.notification?.body || payload?.data?.mensaje || 'Nueva notificación';
  return { titulo, mensaje };
};

// Funcion para Solicitar permiso de notifiaciones y obtenr el token FCM
export const solicitarPermisoNotificaciones = async (usuarioId) => {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

    if (esSafari()) {
      console.warn('Safari (macOS/iOS) no es totalmente compatible con FCM Web. Usa Chrome/Edge/Firefox para pruebas de FCM.');
    }

// Obtener instancia de messaging
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) return null;

    const registration = await getMessagingServiceWorkerRegistration();
    if (!registration) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
//Guardar token en Firestore
    if (token) {
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        fcmToken: token,
        fcmTokenActualizado: new Date()
      });
      console.log(' Token FCM guardado');
      return token;
    }
    return null;
  } catch (error) {
    console.error(' Error:', error);
    return null;
  }
};
// Funcio para escuchar notificaciones en primer plano
export const escucharNotificaciones = async (callback) => {
  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) return;

  onMessage(messagingInstance, async (payload) => {
    console.log(' Notificación primer plano:', payload);

    const { titulo, mensaje } = getContenidoNotificacion(payload);

    if (Notification.permission === 'granted') {
      try {
        const registration = await getMessagingServiceWorkerRegistration();
        if (registration) {
          await registration.showNotification(titulo, {
            body: mensaje,
            tag: 'fletia-' + Date.now(), //  tag único siempre
            requireInteraction: true,   //  se queda visible
          });
          console.log(' Notificación mostrada');
        }
      } catch(error) {
        console.error(' Error:', error);
      }
    }

    if (callback) callback(payload);
  });

  console.log(' Escuchando notificaciones');
};