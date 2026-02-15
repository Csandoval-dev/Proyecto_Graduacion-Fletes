import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

function DashboardTransportista() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Lógica de búsqueda 
          const directRef = doc(db, "transportistas", user.uid);
          const directSnap = await getDoc(directRef);

          if (directSnap.exists()) {
            setPerfil(directSnap.data());
          } else {
            const transCol = collection(db, "transportistas");
            const q = query(transCol, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              setPerfil(querySnapshot.docs[0].data());
            } else {
              const userSnap = await getDoc(doc(db, "usuarios", user.uid));
              if (userSnap.exists()) setPerfil(userSnap.data());
            }
          }
        } catch (error) {
          console.error("Error cargando perfil:", error);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-600 text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR SIMPLE */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-xl font-bold text-black">Fletia</span>
            </div>
            
            {/* Botón salir */}
            <button 
              onClick={cerrarSesion}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Saludo con nombre completo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Bienvenido, {perfil?.nombre || "Transportista"}
          </h1>
          <p className="text-gray-600">Panel de control</p>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Información del perfil - 2 columnas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-black">Información del Perfil</h2>
                {/* Estado en línea */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${perfil?.disponible ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>
                  {perfil?.disponible ? '● Disponible' : '○ No disponible'}
                </span>
              </div>

              {/* Datos en grid */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Nombre Completo</label>
                  <p className="text-base font-semibold text-black mt-1">{perfil?.nombre || "No registrado"}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Zona de Trabajo</label>
                    <p className="text-base font-semibold text-black mt-1">{perfil?.zona || "Honduras"}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Teléfono</label>
                    <p className="text-base font-semibold text-black mt-1">{perfil?.telefono || "No registrado"}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Correo Electrónico</label>
                  <p className="text-base font-semibold text-black mt-1">{perfil?.email}</p>
                </div>
              </div>

              {/* Botón editar */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => navigate("/perfil-transportista")}
                  className="w-full sm:w-auto px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all"
                >
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Tarjetas laterales - 1 columna */}
          <div className="space-y-6">
            
            {/* Verificación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${perfil?.verificado ? 'bg-black' : 'bg-gray-300'}`}>
                  <span className="text-white text-xl">{perfil?.verificado ? '✓' : '!'}</span>
                </div>
                <div>
                  <h3 className="font-bold text-black mb-1">
                    {perfil?.verificado ? 'Cuenta Verificada' : 'En Revisión'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {perfil?.verificado 
                      ? 'Tu identidad ha sido verificada' 
                      : 'Validando documentos...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Estado de cuenta */}
            <div className="bg-black rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">Estado</span>
              </div>
              <p className="text-2xl font-bold">Cuenta Activa</p>
            </div>

            {/* Soporte */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-black mb-3">¿Necesitas ayuda?</h3>
              <button className="w-full py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg border border-gray-200 transition-all">
                Contactar Soporte
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardTransportista;