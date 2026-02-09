// src/services/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  signInWithPopup,      // Login con proveedores sociales
  GoogleAuthProvider,   // Proveedor de Google
  GithubAuthProvider    // Proveedor de GitHub
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

/**
 * REGISTRAR NUEVO USUARIO
 * 
 * 
 * 
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @param {Object} datosUsuario - Datos adicionales del usuario
 * @param {string} datosUsuario.nombre - Nombre completo
 * @param {string} datosUsuario.telefono - Número de teléfono
 * @param {string} datosUsuario.rol - Rol: "cliente" o "transportista"
 * @param {string} [datosUsuario.zona] - Zona de trabajo (solo transportistas)
 * 
 * @returns {Object} 
 */
export const registrarUsuario = async (email, password, datosUsuario) => {
  try {
    // 1. Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    //  Crear documento en Firestore - colección "usuarios
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      nombre: datosUsuario.nombre,
      telefono: datosUsuario.telefono,
      rol: datosUsuario.rol, // cliente", transportista o administrador
      fotoPerfil: "",
      createdAt: serverTimestamp(),
      activo: true
    });

    // Si es transportista, crear documento en colección "transportistas"
    if (datosUsuario.rol === "transportista") {
      await setDoc(doc(db, "transportistas", user.uid), {
        usuarioId: user.uid,
        nombre: datosUsuario.nombre,
        email: email,
        telefono: datosUsuario.telefono,
        zona: datosUsuario.zona || "",
        descripcion: "",
        disponible: false,
        verificado: false,
        vehiculo: {
          tipo: "",
          marca: "",
          modelo: "",
          anio: null,
          placa: "",
          capacidadKg: null,
          fotos: []
        },
        documentos: {
          licencia: "",
          tarjetaCirculacion: ""
        },
        calificacionPromedio: 0,
        totalCalificaciones: 0,
        serviciosCompletados: 0,
        createdAt: serverTimestamp()
      });
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error: error.message };
  }
};

/**
 * INICIAR SESIÓN CON EMAIL Y CONTRASEÑA
 * 
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña
 * @returns {Object} { success: boolean, user?: User, error?: string }
 */
export const iniciarSesion = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { success: false, error: error.message };
  }
};

/**
 * INICIAR SESIÓN CON GOOGLE
 * 
 * Abre ventana emergente para autenticación con Google
 * Si es un usuario nuevo, crea su perfil automáticamente como cliente
 * 
 * @returns {Object} 
 */
export const loginConGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  try {
    const resultado = await signInWithPopup(auth, provider);
    return { success: true, user: resultado.user };
  } catch (error) {
    console.error("Error en Google Auth:", error);
    return { success: false, error: error.message };
  }
};

/**
 * INICIAR SESIÓN CON GITHUB
 * 
 * A
 * 
 * @returns {Object} { success: boolean, user?: User, error?: string }
 */
export const loginConGitHub = async () => {
  const provider = new GithubAuthProvider();
  
  try {
    const resultado = await signInWithPopup(auth, provider);
    return { success: true, user: resultado.user };
  } catch (error) {
    console.error("Error en GitHub Auth:", error);
    return { success: false, error: error.message };
  }
};

/**
 * OBTENER ROL DEL USUARIO
 * 
 * Consulta Firestore para obtener el rol del usuario actual
 * Útil para redirecciones y control de acceso
 * 
 * @param {string} uid - ID del usuario en Firebase Auth
 * @returns {Object} { success: boolean, rol?: string, error?: string }
 */
export const obtenerRolUsuario = async (uid) => {
  try {
    const docRef = doc(db, "usuarios", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return { 
        success: true, 
        rol: userData.rol // cliente, transportista o administrador
      };
    } else {
      return { 
        success: false, 
        error: "Documento de usuario no encontrado en Firestore" 
      };
    }
  } catch (error) {
    console.error("Error al obtener rol del usuario:", error);
    return { success: false, error: error.message };
  }
};

/**
 * CERRAR SESIÓN
 * 
 * Cierra la sesión del usuario actual en Firebase
 * 
 * @returns {Object} { success: boolean, error?: string }
 */
export const cerrarSesion = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false, error: error.message };
  }
};