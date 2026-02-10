// src/pages/DashboardAdmin/DashboardAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

// Importar componentes
import GestionUsuarios from "./components/GestionUsuarios";
import AprobarTransportistas from "./components/AprobarTransportistas";

// Iconos
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconTruck = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" /></svg>;
const IconClipboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalClientes: 0,
    totalTransportistas: 0,
    transportistasPendientes: 0,
    solicitudesActivas: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().rol === "administrador") {
            setUsuario({ uid: user.uid, email: user.email, ...docSnap.data() });
            cargarEstadisticas();
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

  const cargarEstadisticas = async () => {
    try {
      // Total de usuarios
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
      const totalUsuarios = usuariosSnapshot.size;
      
      // Contar por roles
      let totalClientes = 0;
      let totalTransportistas = 0;
      usuariosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.rol === "cliente") totalClientes++;
        if (data.rol === "transportista") totalTransportistas++;
      });

      // Transportistas pendientes de verificación
      const transportistasPendientesQuery = query(
        collection(db, "transportistas"),
        where("verificado", "==", false)
      );
      const transportistasPendientesSnapshot = await getDocs(transportistasPendientesQuery);
      
      // Solicitudes activas
      const solicitudesActivasQuery = query(
        collection(db, "solicitudes"),
        where("estado", "in", ["pendiente", "asignada", "en_proceso"])
      );
      const solicitudesActivasSnapshot = await getDocs(solicitudesActivasQuery);

      setStats({
        totalUsuarios,
        totalClientes,
        totalTransportistas,
        transportistasPendientes: transportistasPendientesSnapshot.size,
        solicitudesActivas: solicitudesActivasSnapshot.size
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

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
            <span className="text-xl font-bold tracking-tight">Fletia <span className="text-indigo-400">HND</span></span>
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

          <button 
            onClick={() => setActiveTab("transportistas")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${activeTab === "transportistas" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "hover:bg-slate-800"}`}
          >
            <IconTruck /> 
            <span className="font-medium text-sm">Aprobar Transportistas</span>
            {stats.transportistasPendientes > 0 && (
              <span className="absolute right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.transportistasPendientes}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("solicitudes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "solicitudes" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" : "hover:bg-slate-800"}`}
          >
            <IconClipboard /> <span className="font-medium text-sm">Solicitudes</span>
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
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Admin</p>
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
          <div className="max-w-7xl mx-auto">
            
            {/* VISTA INICIO */}
            {activeTab === "inicio" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-slate-900">Hola de nuevo, {usuario?.nombre?.split(' ')[0]} 👋</h1>
                  <p className="text-slate-500 mt-1 text-sm">Aquí tienes el resumen de lo que está pasando hoy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <IconUsers />
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Usuarios</h3>
                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalUsuarios}</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-green-100 text-green-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <IconUsers />
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Clientes</h3>
                    <p className="text-3xl font-black text-green-600 mt-1">{stats.totalClientes}</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <IconTruck />
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Transportistas</h3>
                    <p className="text-3xl font-black text-purple-600 mt-1">{stats.totalTransportistas}</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab("transportistas")}
                    className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="bg-white/20 text-white w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <IconTruck />
                    </div>
                    <h3 className="text-white/90 text-xs font-bold uppercase tracking-wider">Esperando Aprobación</h3>
                    <p className="text-4xl font-black text-white mt-1">{stats.transportistasPendientes}</p>
                    <button className="mt-4 text-xs font-bold text-white hover:text-white/80 underline">
                      Revisar ahora →
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <IconClipboard />
                    </div>
                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Solicitudes Activas</h3>
                    <p className="text-3xl font-black text-indigo-600 mt-1">{stats.solicitudesActivas}</p>
                  </div>
                </div>
              </>
            )}

            {/* VISTA USUARIOS */}
            {activeTab === "usuarios" && <GestionUsuarios />}

            {/* VISTA APROBAR TRANSPORTISTAS */}
            {activeTab === "transportistas" && <AprobarTransportistas />}

            {/* VISTA SOLICITUDES (placeholder) */}
            {activeTab === "solicitudes" && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconClipboard />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Gestión de Solicitudes</h3>
                <p className="text-slate-500 text-sm">Módulo en desarrollo...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;