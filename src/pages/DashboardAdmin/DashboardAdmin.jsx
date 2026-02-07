// src/pages/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

// Iconos rápidos (puedes luego cambiarlos por Lucide o FontAwesome)
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().rol === "administrador") {
            setUsuario({ uid: user.uid, email: user.email, ...docSnap.data() });
          } else {
            navigate("/home");
          }
        } catch (error) {
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* --- SIDEBAR IZQUIERDA --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Fletes <span className="text-indigo-400">Pro</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setActiveTab("inicio")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "inicio" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "hover:bg-slate-800"}`}
          >
            <IconDashboard /> <span className="font-medium text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab("usuarios")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "usuarios" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "hover:bg-slate-800"}`}
          >
            <IconUsers /> <span className="font-medium text-sm">Usuarios</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-800 p-3 rounded-lg">
            <p className="text-slate-500 mb-1 font-semibold uppercase">Admin Logged</p>
            <p className="text-slate-300 truncate">{usuario?.nombre}</p>
          </div>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-slate-800 font-semibold text-lg capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-xs font-bold text-slate-800 leading-none">{usuario?.nombre}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Super Admin</p>
            </div>
            <button 
              onClick={cerrarSesion}
              className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 p-2 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Mensaje de Bienvenida */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900">Hola de nuevo, {usuario?.nombre?.split(' ')[0]} </h1>
              <p className="text-slate-500 mt-1 text-sm">Aquí tienes el resumen de lo que está pasando hoy.</p>
            </div>

            {/* Grid de Contenido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Tarjetas de estado */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4 font-bold">
                  {/* Icono pequeño */}
                  <IconUsers />
                </div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transportistas Esperando</h3>
                <p className="text-3xl font-black text-slate-900 mt-1"></p>
                <button className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline">Revisar solicitudes</button>
              </div>

              {/* Aquí puedes meter más tarjetas siguiendo el mismo estilo */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center border-dashed border-2">
                 <p className="text-slate-400 text-sm italic font-medium">Sección de reportes en desarrollo...</p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;