import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

// Importar componentes
import Inicio from "./components/Inicio";
import BuscarTransportistas from "./components/BuscarTransportistas";
import MisConversaciones from "./components/MisConversaciones";
import MiPerfil from "./components/MiPerfil";

// ICONOS SVG 
const IconHome = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconChat = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconBell = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

function DashboardCliente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Opciones del menú
  const menuItems = [
    { id: "inicio", label: "Inicio", icon: <IconHome /> },
    { id: "buscar", label: "Buscar Transportistas", icon: <IconSearch /> },
    { id: "conversaciones", label: "Mis Conversaciones", icon: <IconChat /> },
    { id: "perfil", label: "Mi Perfil", icon: <IconUser /> }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/*SIDEBAR LATERAL*/}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-black">Fletia</span>
          </div>
          
          {/* Botón cerrar en mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-600 hover:text-black"
          >
            <IconX />
          </button>
        </div>

        {/* Navegación */}
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
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Info usuario en sidebar */}
        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Usuario
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {usuario?.nombre || "Cliente"}
            </p>
            <p className="text-xs text-slate-500 truncate">{usuario?.email}</p>
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          
          {/* Botón menú mobile */}
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
            {/* Notificaciones */}
            <button className="relative p-2 text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition-colors">
              <IconBell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Avatar y logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900">{usuario?.nombre}</p>
                <p className="text-xs text-slate-500">Cliente</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </header>

        {/* Área de contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              
              {/* Renderizar componente según pestaña activa */}
              {activeTab === "inicio" && <Inicio usuario={usuario} />}
              {activeTab === "buscar" && <BuscarTransportistas usuario={usuario} />}
              {activeTab === "conversaciones" && <MisConversaciones usuario={usuario} />}
              {activeTab === "perfil" && <MiPerfil usuario={usuario} />}
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardCliente;