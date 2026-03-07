// src/pages/DashboardCliente/components/MisFletes.jsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import MapaRuta from "../../../components/MapaRuta";
import { getEstadoInfo } from "../../../constants/estadosFlete";
import ModalCalificacion from "../../../components/ModalCalificacion";


const IconTruck = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
  </svg>
);

const IconX = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function MisFletes({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('activos');
  const [detalleAbierto, setDetalleAbierto] = useState(null);

  const [calificacionAbierta, setCalificacionAbierta] = useState(null);

  useEffect(() => {
    if (usuario?.uid) {
      cargarSolicitudes();
    }
  }, [usuario, filtro]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      
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

      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSolicitudes(lista);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = (solicitud) => {
    setDetalleAbierto(solicitud);
  };

  // ==========================================
  // NUEVO: Función para abrir modal de calificación
  // ==========================================
  const abrirCalificacion = (solicitud) => {
    setCalificacionAbierta(solicitud);
    setDetalleAbierto(null); // Cerrar modal de detalle
  };

  // ==========================================
  // NUEVO: Callback después de calificar
  // ==========================================
  const handleCalificacionExitosa = () => {
    setCalificacionAbierta(null);
    cargarSolicitudes(); // Recargar lista
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "";
    try {
      return timestamp.toDate().toLocaleDateString('es-HN', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "";
    }
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
      
      {/* Header */}
      <div>
        <p className="text-slate-600 mt-1">Seguimiento y gestión de tus solicitudes</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('activos')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            filtro === 'activos'
              ? 'bg-black text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Solicitudes Activas
        </button>
        <button
          onClick={() => setFiltro('completados')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            filtro === 'completados'
              ? 'bg-black text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Historial de Fletes
        </button>
      </div>

      {/* Lista de solicitudes */}
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
              : 'Tus fletes completados aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {solicitudes.map((sol) => {
            const estadoInfo = getEstadoInfo(sol.estado);
            
            return (
              <div 
                key={sol.id} 
                onClick={() => abrirDetalle(sol)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {sol.nombreTransportista}
                        </h3>
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

      {/* Modal de Detalle con Pestañas */}
      {detalleAbierto && (
        <ModalDetalle 
          solicitud={detalleAbierto}
          usuario={usuario}
          onClose={() => setDetalleAbierto(null)}
          // ==========================================
          // NUEVO: Pasar función para abrir calificación
          // ==========================================
          onAbrirCalificacion={abrirCalificacion}
        />
      )}

      {/* ==========================================
          NUEVO: Modal de Calificación
          ========================================== */}
      {calificacionAbierta && (
        <ModalCalificacion
          solicitud={calificacionAbierta}
          onClose={() => setCalificacionAbierta(null)}
          onCalificar={handleCalificacionExitosa}
        />
      )}
    </div>
  );
}

// ========== MODAL CON PESTAÑAS ==========
function ModalDetalle({ solicitud, usuario, onClose, onAbrirCalificacion }) {
  const [pestanaActiva, setPestanaActiva] = useState('seguimiento');
  const [conversacionId, setConversacionId] = useState(null);
  
  const estadoInfo = getEstadoInfo(solicitud.estado);

  const pestanas = [
    { id: 'seguimiento', label: ' Seguimiento',},
    { id: 'info', label: ' Información', icono: '' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Flete con {solicitud.nombreTransportista}
              </h2>
              <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                {estadoInfo.icono} {estadoInfo.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <IconX />
            </button>
          </div>

          {/* Pestañas */}
          <div className="flex gap-2 border-b border-slate-200">
            {pestanas.map((pestana) => (
              <button
                key={pestana.id}
                onClick={() => setPestanaActiva(pestana.id)}
                className={`px-4 py-2 font-bold text-sm transition-all border-b-2 ${
                  pestanaActiva === pestana.id
                    ? 'border-black text-black'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {pestana.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido según pestaña */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* PESTAÑA: SEGUIMIENTO */}
          {pestanaActiva === 'seguimiento' && (
            <div className="space-y-6">
              {/* Mapa */}
              <MapaRuta 
                origen={solicitud.origen}
                destino={solicitud.destino}
                height="400px"
              />

              {/* ==========================================
                  NUEVO: Banner de estado "entregado"
                  ========================================== */}
              {solicitud.estado === 'entregado' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <p className="text-lg font-bold text-green-900 mb-2">
                    Tu carga fue entregada
                  </p>
                  <p className="text-sm text-green-700 mb-4">
                    ¿Cómo fue tu experiencia con {solicitud.nombreTransportista}?
                  </p>
                  <button
                    onClick={() => onAbrirCalificacion(solicitud)}
                    className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all text-lg"
                  >
                    Confirmar y Calificar Servicio
                  </button>
                </div>
              )}

              {/* Historial */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4"> Historial del Servicio</h3>
                
                {solicitud.historial && solicitud.historial.length > 0 ? (
                  <div className="space-y-4">
                    {solicitud.historial.map((item, idx) => {
                      const info = getEstadoInfo(item.estado);
                      return (
                        <div key={idx} className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${info.bgColor} flex-shrink-0`}>
                            <span className="text-2xl">{info.icono}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{info.label}</p>
                            <p className="text-sm text-slate-600">{info.descripcion}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {item.fecha?.toDate?.()?.toLocaleString('es-HN')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Aún no hay historial de cambios</p>
                  </div>
                )}
              </div>

              {/* Estado actual */}
              <div className={`rounded-xl p-6 ${estadoInfo.bgColor} border ${estadoInfo.borderColor}`}>
                <p className={`text-sm font-bold uppercase mb-2 ${estadoInfo.textColor}`}>
                  Estado Actual
                </p>
                <p className={`text-xl font-bold ${estadoInfo.textColor}`}>
                  {estadoInfo.icono} {estadoInfo.descripcion}
                </p>
              </div>
            </div>
          )}
        
          {/* PESTAÑA: INFORMACIÓN */}
          {pestanaActiva === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <p className="text-sm font-bold text-slate-500 uppercase mb-3">Origen</p>
                  <p className="text-lg text-slate-900">{solicitud.origen?.direccion}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-6">
                  <p className="text-sm font-bold text-slate-500 uppercase mb-3">Destino</p>
                  <p className="text-lg text-slate-900">{solicitud.destino?.direccion}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm font-bold text-slate-500 uppercase mb-3">Descripción de Carga</p>
                <p className="text-lg text-slate-900">{solicitud.descripcionCarga}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Distancia</p>
                  <p className="text-2xl font-bold text-slate-900">{solicitud.distanciaKm} km</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Vehículo</p>
                  <p className="text-2xl font-bold text-slate-900 capitalize">{solicitud.tipoVehiculo}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fecha Solicitada</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {solicitud.fechaSolicitada?.toDate?.()?.toLocaleDateString('es-HN')}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <p className="text-sm font-bold text-slate-500 uppercase mb-3">Transportista</p>
                <p className="text-lg font-bold text-slate-900">{solicitud.nombreTransportista}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MisFletes;