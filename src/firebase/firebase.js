// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

// Configuración usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Auth, Firestore, Analytics y Functions
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app, "us-central1");

let messaging = null;
let swRegistration = null;

export const getMessagingServiceWorkerRegistration = async () => {
  if (swRegistration) return swRegistration;

  if (!("serviceWorker" in navigator)) return null;

  try {
    swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    console.log('Service Worker de FCM registrado');
  } catch (error) {
    console.error('Error registrando Service Worker de FCM:', error);
    swRegistration = null;
  }

  return swRegistration;
};
// Función para obtener instancia de Messaging
export const getMessagingInstance = async () => {
  if (messaging) return messaging;
  
  try {
    if (typeof window === "undefined") return null;

    const supported = await isMessagingSupported();
    if (supported) {
      await getMessagingServiceWorkerRegistration();
      
      messaging = getMessaging(app);
      console.log('Firebase Messaging inicializado');
    } else {
      console.warn('Firebase Messaging no soportado en este navegador/dispositivo');
    }
  } catch (error) {
    console.error('Error al inicializar Messaging:', error);
  }
  
  return messaging;
};

export { messaging };