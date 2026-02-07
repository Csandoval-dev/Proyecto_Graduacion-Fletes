import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// 1. Importamos las funciones sociales del service
import { iniciarSesion, loginConGoogle, loginConGitHub } from "../../services/authService";
// 2. Importamos Firestore para verificar/crear el perfil del usuario
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

        // VERIFICACIÓN: ¿El usuario ya tiene documento en Firestore?
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
   * MANEJADOR DE LOGIN TRADICIONAL
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
    <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center p-4">
      
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl min-h-[550px]">
        
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="w-full md:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Fletes App</h1>
            <p className="text-slate-500 mt-2">Ingresa tus datos para gestionar tus traslados.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                placeholder="ejemplo@correo.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-black py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? "Cargando..." : "Login"}
            </button>
          </form>

          {/* SECCIÓN DE LOGIN SOCIAL */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-full border-t border-slate-200"></div>
              <span className="absolute bg-white px-4 text-xs text-slate-400 uppercase tracking-wider">O continuar con</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Botón Google */}
              <button 
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
                Google
              </button>

              {/* Botón GitHub */}
              <button 
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-600">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">Crea una aquí</Link>
          </div>
        </div>

        {/* COLUMNA DERECHA: Panel Informativo */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 text-white flex-col justify-center">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6 leading-tight">Control total de tu logística en un solo lugar.</h2>
            <div className="space-y-4">
              <p className="flex items-center gap-3 text-blue-100">
                <span className="h-2 w-2 bg-blue-300 rounded-full"></span> Rastreo de unidades en tiempo real.
              </p>
              <p className="flex items-center gap-3 text-blue-100">
                <span className="h-2 w-2 bg-blue-300 rounded-full"></span> Gestión de documentación digital.
              </p>
              <p className="flex items-center gap-3 text-blue-100">
                <span className="h-2 w-2 bg-blue-300 rounded-full"></span> Comunicación directa con transportistas.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Login;