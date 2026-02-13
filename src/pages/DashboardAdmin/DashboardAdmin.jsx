import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

// Importar componentes
import GestionUsuarios from "./components/GestionUsuarios";
import AprobarTransportistas from "./components/AprobarTransportistas";

// Iconos mejorados con trazos más finos
const IconDashboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const IconTruck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>;
const IconClipboard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

function DashboardAdmin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inicio");
  
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
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
      const totalUsuarios = usuariosSnapshot.size;
      
      let totalClientes = 0;
      let totalTransportistas = 0;
      usuariosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.rol === "cliente") totalClientes++;
        if (data.rol === "transportista") totalTransportistas++;
      });

      const transportistasPendientesQuery = query(
        collection(db, "transportistas"),
        where("verificado", "==", false)
      );
      const transportistasPendientesSnapshot = await getDocs(transportistasPendientesQuery);
      
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
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="text-slate-500 font-medium text-sm animate-pulse">Cargando panel...</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* --- SIDEBAR IZQUIERDA --- */}
      <aside className="w-72 bg-slate-900 text-slate-400 flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <IconTruck />
            </div>
            <span className="text-xl font-black text-white tracking-tight italic">FLETIA<span className="text-indigo-500">HND</span></span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4 mb-4">Menú Principal</p>
          
          {[
            { id: "inicio", label: "Dashboard", icon: <IconDashboard /> },
            { id: "usuarios", label: "Gestión de Usuarios", icon: <IconUsers /> },
            { id: "transportistas", label: "Aprobar Transportistas", icon: <IconTruck />, badge: stats.transportistasPendientes },
            { id: "solicitudes", label: "Solicitudes", icon: <IconClipboard /> },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`${activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`}>{item.icon}</span>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-4 ring-slate-900">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {usuario?.nombre?.charAt(0)}
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-xs font-bold text-white truncate">{usuario?.nombre}</p>
               <p className="text-[10px] text-indigo-400 font-medium">Administrador</p>
             </div>
          </div>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header Superior */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div>
            <h2 className="text-slate-400 text-[9px] uppercase tracking-[0.15em] font-black">Panel de Control</h2>
            <p className="text-slate-900 font-extrabold text-xl capitalize">{activeTab}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <button 
              onClick={cerrarSesion}
              className="group flex items-center gap-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 px-4 py-2 rounded-xl transition-all border border-slate-200 hover:border-red-100"
            >
              <span className="text-xs font-bold">Salir</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="p-10">
          <div className="max-w-7xl mx-auto">
            
            {activeTab === "inicio" && (
              <>
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">¡Hola, {usuario?.nombre?.split(' ')[0]}! </h1>
                    <p className="text-slate-500 mt-2 font-medium">Esto es lo que ha pasado en <span className="text-indigo-600 font-bold">Fletia</span> desde tu última visita.</p>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sistema Online</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  
                  {/* Card: Total Usuarios */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconUsers />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Usuarios</p>
                    <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalUsuarios}</p>
                  </div>

                  {/* Card: Clientes */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconUsers />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Clientes</p>
                    <p className="text-4xl font-black text-emerald-600 mt-1">{stats.totalClientes}</p>
                  </div>

                  {/* Card: Transportistas */}
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconTruck />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Transportistas</p>
                    <p className="text-4xl font-black text-indigo-600 mt-1">{stats.totalTransportistas}</p>
                  </div>

                   {/* Card: Solicitudes */}
                   <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-slate-50 text-slate-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconClipboard />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Solicitudes</p>
                    <p className="text-4xl font-black text-slate-900 mt-1">{stats.solicitudesActivas}</p>
                  </div>

                  {/* Card: Especial - Aprobación */}
                  <div 
                    onClick={() => setActiveTab("transportistas")}
                    className="bg-indigo-600 p-6 rounded-[2rem] shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group col-span-1 md:col-span-2 xl:col-span-1"
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="bg-white/20 text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                      <IconTruck />
                    </div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest relative z-10">Por Verificar</p>
                    <p className="text-5xl font-black text-white mt-1 relative z-10">{stats.transportistasPendientes}</p>
                    <p className="mt-4 text-[10px] font-bold text-indigo-100 underline decoration-2 underline-offset-4 relative z-10">Gestionar ahora →</p>
                  </div>

                </div>
              </>
            )}

            <div className="mt-4">
               {activeTab === "usuarios" && <GestionUsuarios />}
               {activeTab === "transportistas" && <AprobarTransportistas />}
               {activeTab === "solicitudes" && (
                 <div className="bg-white p-20 rounded-[3rem] border border-slate-200 text-center shadow-sm">
                   <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                     <IconClipboard />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-2">Módulo de Solicitudes</h3>
                   <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium leading-relaxed">Estamos trabajando para traerte el historial completo de viajes y fletes.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardAdmin;