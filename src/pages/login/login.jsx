import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// Importamos las funciones sociales del service
import { iniciarSesion, loginConGoogle, loginConGitHub } from "../../services/authService";
//  Importamos Firestore para verificar/crear el perfil del usuario
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * MANEJADOR DE LOGIN SOCIAL (Google/GitHub)
   */
  const handleSocialLogin = async (metodo) => {
    setError("");
    setLoading(true);
    
    try {
      // Ejecutamos el login según el método seleccionado
      const resultado = metodo === 'google' ? await loginConGoogle() : await loginConGitHub();

      if (resultado.success) {
        const user = resultado.user;

        // Verificamos El usuario ya tiene documento en Firestore
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // SI ES NUEVO: Creamos su perfil base como 'cliente'
          await setDoc(doc(db, "usuarios", user.uid), {
            email: user.email,
            nombre: user.displayName || "Usuario Nuevo",
            telefono: user.phoneNumber || "",
            rol: "cliente", // Rol por defecto
            fotoPerfil: user.photoURL || "",
            createdAt: serverTimestamp(),
            activo: true
          });
        }

        navigate("/home");
      } else {
        setError(`Error al entrar con ${metodo}`);
      }
    } catch (err) {
      console.error(err);
      setError("Error en la autenticación social.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * MANEJADOR DE LOGIN 
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    const resultado = await iniciarSesion(email, password);
    
    if (resultado.success) {
      navigate("/home");
    } else {
      setError("Email o contraseña incorrectos");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-4">
      
      {/* Tarjeta central simplificada */}
      <div className="bg-white shadow-xl rounded-3xl p-8 md:p-12 w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Fletia HND</h1>
          <p className="text-gray-500 mt-2">Gestiona tus traslados con facilidad.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
              placeholder="ejemplo@correo.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-xs font-semibold text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 shadow-lg"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* SECCIÓN SOCIAL CON COLORES OFICIALES CORREGIDOS */}
<div className="mt-8">
  <div className="relative flex items-center justify-center mb-6">
    <div className="w-full border-t border-gray-200"></div>
    <span className="absolute bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      O continuar con
    </span>
  </div>

  <div className="grid grid-cols-2 gap-4">
    {/* Botón Google: Fondo blanco para que el logo brille */}
    <button 
      type="button"
      onClick={() => handleSocialLogin('google')}
      disabled={loading}
      className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 text-sm shadow-sm active:scale-95"
    >
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Google
    </button>

    {/* Botón GitHub: Color corporativo oscuro oficial */}
    <button 
      type="button"
      onClick={() => handleSocialLogin('github')}
      disabled={loading}
      className="flex items-center justify-center gap-2 py-3 bg-[#24292e] text-white rounded-xl hover:bg-[#1b1f23] transition-all font-bold text-sm shadow-md active:scale-95"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    </button>
  </div>
</div>
        <div className="mt-10 text-center text-sm font-medium text-gray-500">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="text-black font-black hover:underline decoration-2 underline-offset-4 transition-all">Crea una aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;