import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db, getMessagingInstance } from '../firebase/firebase';

const VAPID_KEY = 'BNZDYKYgu2CmN0-no0xg5Aqzvx6lczSESmJgFerYpybSGZL2BNGz7I08xjXLW1ItnU5fuvPpDGpvb51OmVVS0Sc';

export const solicitarPermisoNotificaciones = async (usuarioId) => {
  try {
    if (!('Notification' in window)) return null;

    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });

    if (token) {
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        fcmToken: token,
        fcmTokenActualizado: new Date()
      });
      console.log('✅ Token FCM guardado');
      return token;
    }
    return null;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

export const escucharNotificaciones = async (callback) => {
  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) return;

  onMessage(messagingInstance, async (payload) => {
    console.log('📩 Notificación primer plano:', payload);

    const titulo = payload.data?.titulo || 'Fletia HND';
    const mensaje = payload.data?.mensaje || 'Nueva notificación';

    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(titulo, {
            body: mensaje,
            tag: 'fletia-' + Date.now(), // ✅ tag único siempre
            requireInteraction: true,   // ✅ se queda visible
          });
          console.log('✅ Notificación mostrada');
        }
      } catch(error) {
        console.error('❌ Error:', error);
      }
    }

    if (callback) callback(payload);
  });

  console.log('✅ Escuchando notificaciones');
};