// src/pages/DashboardCliente.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

function DashboardCliente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.rol !== "cliente") {
              navigate("/dashboard");
              return;
            }
            setUsuario({
              uid: user.uid,
              email: user.email,
              ...userData
            });
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await cerrarSesion();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* NAVBAR CORREGIDO: Visibilidad y Alineación */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#16a34a"/>
                </svg>
              </div>
              <div className="flex flex-col">
                {/* CAMBIO: text-slate-900 para que se lea (estaba en 100) */}
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">Usuario</h1>
                <p className="text-sm text-slate-500">Fletia HND</p>
              </div>
            </div>

            {/* BOTÓN ESTILO NEGRO (Consistente con Login) */}
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 transition-all shadow-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <section aria-labelledby="profile-heading">
          <h3 id="profile-heading" className="text-3xl font-bold text-slate-900 mb-8">
            Información de tu Cuenta
          </h3>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Bloque: Datos Personales */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                  Datos Personales
                </h4>
                <dl className="space-y-5">
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Nombre completo</dt>
                    <dd className="text-xl text-slate-900 font-bold capitalize">{usuario?.nombre || "carlos sandoval"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Correo electrónico</dt>
                    <dd className="text-lg text-slate-900 break-all">{usuario?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Teléfono</dt>
                    <dd className="text-lg text-slate-900 font-medium">{usuario?.telefono || "No registrado"}</dd>
                  </div>
                </dl>
              </div>

              {/* Bloque: Estado de la cuenta */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                  Estado de la Cuenta
                </h4>
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-2">Tipo de cuenta</dt>
                    <dd className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Cliente
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-2">Estado</dt>
                    <dd className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                      Activo
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Miembro desde</dt>
                    <dd className="text-lg text-slate-900 font-bold italic">
                      {usuario?.createdAt?.toDate?.()?.toLocaleDateString('es-HN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) || "7 de febrero de 2026"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* BOTÓN EDITAR ESTILO NEGRO */}
            <div className="mt-10 pt-8 border-t border-slate-100">
              <button
                onClick={() => alert("Próximamente: Editar perfil")}
                className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardCliente;