// src/pages/DashboardCliente/components/Inicio.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const IconTruck = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
  </svg>
);

const IconChat = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconClock = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function Inicio({ usuario }) {
  const [stats, setStats] = useState({
    solicitudesActivas: 0,
    solicitudesCompletadas: 0,
    conversacionesActivas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario?.uid) {
      cargarEstadisticas();
    }
  }, [usuario]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);

      // Solicitudes activas
      const qActivas = query(
        collection(db, "solicitudes"),
        where("usuarioId", "==", usuario.uid),
        where("estado", "in", ["pendiente", "asignada", "en_proceso"])
      );
      const snapActivas = await getDocs(qActivas);

      // Solicitudes completadas
      const qCompletadas = query(
        collection(db, "solicitudes"),
        where("usuarioId", "==", usuario.uid),
        where("estado", "==", "finalizado")
      );
      const snapCompletadas = await getDocs(qCompletadas);

      // Conversaciones activas
      const qConversaciones = query(
        collection(db, "conversaciones"),
        where("participantes", "array-contains", usuario.uid)
      );
      const snapConversaciones = await getDocs(qConversaciones);

      setStats({
        solicitudesActivas: snapActivas.size,
        solicitudesCompletadas: snapCompletadas.size,
        conversacionesActivas: snapConversaciones.size
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header de bienvenida */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          ¡Hola, {usuario?.nombre?.split(' ')[0] || 'Cliente'}! 👋
        </h1>
        <p className="text-slate-600 mt-1">
          Bienvenido de nuevo a tu panel de control
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
              <IconClock />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Solicitudes Activas
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {stats.solicitudesActivas}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-600 p-4 rounded-xl">
              <IconCheck />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Servicios Completados
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {stats.solicitudesCompletadas}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 text-purple-600 p-4 rounded-xl">
              <IconChat />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Conversaciones
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {stats.conversacionesActivas}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-gradient-to-br from-black to-gray-800 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <IconTruck />
              </div>
              <div>
                <h3 className="font-bold text-lg">Buscar Transportista</h3>
                <p className="text-sm text-white/80">Encuentra el ideal para tu carga</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 p-3 rounded-xl text-slate-700">
                <IconChat />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Mis Conversaciones</h3>
                <p className="text-sm text-slate-600">Ver chats activos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 ¿Necesitas ayuda?</h3>
        <p className="text-sm text-blue-800 mb-4">
          Estamos aquí para ayudarte. Si tienes alguna pregunta o problema, no dudes en contactarnos.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Contactar Soporte
        </button>
      </div>
    </div>
  );
}

export default Inicio;