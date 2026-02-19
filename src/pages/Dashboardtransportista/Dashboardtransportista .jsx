// src/pages/Dashboardtransportista/Dashboardtransportista.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";
import SolicitudesTransportista from "./components/SolicitudesTransportista";

// ========== ICONOS ==========
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconClipboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconMenu = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconX = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

function DashboardTransportista() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const directRef = doc(db, "transportistas", user.uid);
          const directSnap = await getDoc(directRef);

          if (directSnap.exists()) {
            setPerfil({ uid: user.uid, nombre: user.displayName || 'Transportista', ...directSnap.data() });
          } else {
            const transCol = collection(db, "transportistas");
            const q = query(transCol, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              setPerfil({ uid: user.uid, nombre: user.displayName || 'Transportista', ...querySnapshot.docs[0].data() });
            } else {
              const userSnap = await getDoc(doc(db, "usuarios", user.uid));
              if (userSnap.exists()) setPerfil({ uid: user.uid, nombre: user.displayName || 'Transportista', ...userSnap.data() });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "inicio", label: "Inicio", icon: <IconHome /> },
    { id: "solicitudes", label: "Mis Solicitudes", icon: <IconClipboard /> },
    { id: "perfil", label: "Mi Perfil", icon: <IconUser /> }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* ========== SIDEBAR ========== */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-black">Fletia</span>
          </div>
          
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-600 hover:text-black"
          >
            <IconX />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                font-medium text-sm transition-all
                ${activeTab === item.id 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transportista</p>
            <p className="text-sm font-bold text-slate-900 truncate">{perfil?.nombre}</p>
            <p className="text-xs text-slate-500 truncate">{perfil?.email}</p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========== CONTENIDO ========== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-black"
          >
            <IconMenu />
          </button>

          <h2 className="text-slate-800 font-bold text-lg capitalize hidden lg:block">
            {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
          </h2>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-900">{perfil?.nombre}</p>
              <p className="text-xs text-slate-500">Transportista</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <IconLogout />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === "inicio" && <VistaInicio perfil={perfil} navigate={navigate} />}
              {activeTab === "solicitudes" && <SolicitudesTransportista usuario={perfil} />}
              {activeTab === "perfil" && <VistaPerfil perfil={perfil} navigate={navigate} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Vista Inicio
function VistaInicio({ perfil }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">¡Hola, {perfil?.nombre?.split(' ')[0]}! 👋</h1>
        <p className="text-slate-600 mt-1">Bienvenido a tu panel de transportista</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase">Verificación</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{perfil?.verificado ? '✓ Verificado' : '⏳ Pendiente'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase">Estado</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{perfil?.disponible ? '🟢 Disponible' : '🔴 No disponible'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase">Calificación</p>
          <p className="text-2xl font-black text-slate-900 mt-2">⭐ {perfil?.calificacionPromedio?.toFixed(1) || '0.0'}</p>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="font-bold text-orange-900 mb-2">💡 Consejo</h3>
        <p className="text-sm text-orange-800">Mantén tu perfil actualizado y responde rápido a las solicitudes.</p>
      </div>
    </div>
  );
}

// Vista Perfil
function VistaPerfil({ perfil, navigate }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-slate-900">Mi Perfil</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase mb-2">Nombre</p>
            <p className="text-lg font-bold text-slate-900">{perfil?.nombre}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase mb-2">Email</p>
            <p className="text-lg font-bold text-slate-900">{perfil?.email}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase mb-2">Teléfono</p>
            <p className="text-lg font-bold text-slate-900">{perfil?.telefono || 'No registrado'}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase mb-2">Zona</p>
            <p className="text-lg font-bold text-slate-900">{perfil?.zona || 'No especificada'}</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t">
          <button
            onClick={() => navigate("/perfil-transportista")}
            className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all"
          >
            Editar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardTransportista;