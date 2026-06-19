import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { getEstadoInfo } from "../../../constants/estadosFlete";

const IconTruck = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
  </svg>
);

// Recibe onAbrirDetalle del DashboardCliente
function MisFletes({ usuario, onAbrirDetalle }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('activos');

  useEffect(() => {
    if (!usuario?.uid) return;
    let q;
    if (filtro === 'activos') {
      q = query(
        collection(db, "solicitudes"),
        where("usuarioId", "==", usuario.uid),
        where("estado", "in", ["pendiente", "aceptada", "en_camino", "recogido", "entregado"]),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "solicitudes"),
        where("usuarioId", "==", usuario.uid),
        where("estado", "==", "finalizado"),
        orderBy("createdAt", "desc")
      );
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSolicitudes(lista);
      setLoading(false);
    }, (error) => {
      console.error("Error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [filtro, usuario?.uid]);

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    try {
      return timestamp.toDate().toLocaleDateString('es-HN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return ""; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold">Cargando tus fletes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600">Seguimiento y gestión de tus solicitudes</p>

      <div className="flex gap-2">
        {['activos', 'completados'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filtro === f ? 'bg-black text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f === 'activos' ? 'Solicitudes Activas' : 'Historial de Fletes'}
          </button>
        ))}
      </div>

      {solicitudes.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconTruck />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            No tienes fletes {filtro === 'activos' ? 'activos' : 'completados'}
          </h3>
          <p className="text-slate-600">
            {filtro === 'activos'
              ? 'Busca un transportista para crear tu primera solicitud'
              : 'Tus fletes completados aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {solicitudes.map((sol) => {
            const estadoInfo = getEstadoInfo(sol.estado);
            return (
              <div
                key={sol.id}
                onClick={() => onAbrirDetalle(sol)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{sol.nombreTransportista}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${estadoInfo.bgColor} ${estadoInfo.textColor} ${estadoInfo.borderColor}`}>
                          {estadoInfo.icono} {estadoInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{sol.descripcionCarga}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Distancia</p>
                      <p className="text-sm text-slate-900">{sol.distanciaKm} km</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fecha</p>
                      <p className="text-sm text-slate-900">{formatearFecha(sol.fechaSolicitada)}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Descripción</p>
                      <p className="text-sm text-slate-900 truncate">{estadoInfo.descripcion}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MisFletes;