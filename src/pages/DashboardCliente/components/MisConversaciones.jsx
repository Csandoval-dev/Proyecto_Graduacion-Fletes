// src/pages/DashboardCliente/components/MisConversaciones.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const IconChat = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

function MisConversaciones({ usuario }) {
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario?.uid) {
      cargarConversaciones();
    }
  }, [usuario]);

  const cargarConversaciones = async () => {
    try {
      setLoading(true);
      
      const q = query(
        collection(db, "conversaciones"),
        where("participantes", "array-contains", usuario.uid)
      );
      
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar por fecha más reciente
      lista.sort((a, b) => {
        const dateA = a.ultimoMensajeTimestamp?.toDate() || new Date(0);
        const dateB = b.ultimoMensajeTimestamp?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setConversaciones(lista);
    } catch (error) {
      console.error("Error al cargar conversaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirChat = (conversacion) => {
    alert(`Próximamente: Chat con ${conversacion.nombreTransportista}`);
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    
    const fecha = timestamp.toDate();
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    
    return fecha.toLocaleDateString('es-HN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Lista de conversaciones */}
      {conversaciones.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconChat />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No tienes conversaciones</h3>
          <p className="text-slate-600">
            Cuando contactes a un transportista, la conversación aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {conversaciones.map((conv) => (
              <div
                key={conv.id}
                onClick={() => abrirChat(conv)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="bg-slate-200 rounded-full p-3 text-slate-600">
                    <IconUser />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 truncate">
                        {conv.nombreTransportista}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap ml-2">
                        {formatearFecha(conv.ultimoMensajeTimestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {conv.ultimoMensaje || "Sin mensajes"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MisConversaciones;