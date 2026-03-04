import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import ChatTransportista from './ChatTransportista';
import MapaRuta from '../../../components/MapaRuta';
import { ESTADOS_FLETE, getEstadoInfo } from '../../../constants/estadosFlete';

const IconClipboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

function SolicitudesTransportista({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente');
  const [chatAbierto, setChatAbierto] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(null);
//Cargar solicitudes al montar y cuando cabe el usuario o el filtro cambie
  useEffect(() => {
    cargarSolicitudes();
  }, [usuario, filtro]);
//Funcion para cargar solicitudes  desde firebase con filtros y odenados por fecha de creacion
  const cargarSolicitudes = async () => {
    try {
      setLoading(true)
      //Contruir consulta con filtros
      let q;
      if (filtro === 'todas') {
        q = query(
          collection(db, 'solicitudes'),
          where('transportistaId', '==', usuario.uid),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'solicitudes'),
          where('transportistaId', '==', usuario.uid),
          where('estado', '==', filtro),
          orderBy('createdAt', 'desc')
        );
      }
//Ejecutamos la consulta y mapeamos los resultados
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSolicitudes(lista);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };
//Funcion para cambiar estado de la solicitud
  const cambiarEstado = async (solicitudId, nuevoEstado) => {
    const estadoInfo = getEstadoInfo(nuevoEstado);
    
    if (!confirm(`¿${estadoInfo.accionTransportista}?`)) return;
    
    try {
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        estado: nuevoEstado,
        historial: arrayUnion({
          estado: nuevoEstado,
          fecha: new Date(),
          descripcion: estadoInfo.descripcion
        })
      });
      
      alert(` Estado actualizado a: ${estadoInfo.label}`);
      setDetalleAbierto(null);
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert(' Error al cambiar estado');
    }
  };

  const abrirChat = (solicitud) => {
    setChatAbierto(solicitud);
  };

  const verDetalle = (solicitud) => {
    setDetalleAbierto(solicitud);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <p className="text-slate-600 mt-1">Gestiona las solicitudes de flete</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['pendiente', 'aceptada', 'en_camino', 'recogido', 'entregado', 'finalizado', 'todas'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filtro === f
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f === 'todas' ? 'Todas' : getEstadoInfo(f).label}
          </button>
        ))}
      </div>

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-600">No hay solicitudes {filtro !== 'todas' ? getEstadoInfo(filtro).label.toLowerCase() : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {solicitudes.map((sol) => {
            const estadoInfo = getEstadoInfo(sol.estado);
            
            return (
              <div key={sol.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {sol.nombreUsuario}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${estadoInfo.bgColor} ${estadoInfo.textColor} ${estadoInfo.borderColor}`}>
                          {estadoInfo.icono} {estadoInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{sol.descripcionCarga}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Distancia</p>
                      <p className="text-sm text-slate-900">{sol.distanciaKm} km</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fecha</p>
                      <p className="text-sm text-slate-900">
                        {sol.fechaSolicitada?.toDate?.()?.toLocaleDateString('es-HN')}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => verDetalle(sol)}
                      className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-all"
                    >
                       Ver Detalle
                    </button>
                    
                    <button
                      onClick={() => abrirChat(sol)}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all"
                    >
                       Chat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chat Modal */}
      {chatAbierto && (
        <ChatTransportista
          solicitud={chatAbierto}
          usuario={usuario}
          onClose={() => setChatAbierto(null)}
        />
      )}

      {/* Modal Detalle con Mapa */}
      {detalleAbierto && <ModalDetalleSolicitud />}
    </div>
  );

  //  Model detalle de mapa
  function ModalDetalleSolicitud() {
    const estadoInfo = getEstadoInfo(detalleAbierto.estado);
    const siguienteEstado = estadoInfo.siguienteEstado;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Solicitud de {detalleAbierto.nombreUsuario}
              </h2>
              <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                {estadoInfo.icono} {estadoInfo.label}
              </span>
            </div>
            <button
              onClick={() => setDetalleAbierto(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            
            {/* Mapa con Ruta */}
            <MapaRuta 
              origen={detalleAbierto.origen}
              destino={detalleAbierto.destino}
              height="400px"
            />

            {/* Info de la solicitud */}
            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Descripción de Carga</p>
                <p className="text-lg text-slate-900">{detalleAbierto.descripcionCarga}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-1">Distancia</p>
                  <p className="text-xl font-bold text-slate-900">{detalleAbierto.distanciaKm} km</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-1">Tipo Vehículo</p>
                  <p className="text-xl font-bold text-slate-900 capitalize">{detalleAbierto.tipoVehiculo}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-1">Fecha Solicitada</p>
                  <p className="text-xl font-bold text-slate-900">
                    {detalleAbierto.fechaSolicitada?.toDate?.()?.toLocaleDateString('es-HN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  abrirChat(detalleAbierto);
                  setDetalleAbierto(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                 Abrir Chat
              </button>

              {siguienteEstado && estadoInfo.accionTransportista && (
                <button
                  onClick={() => cambiarEstado(detalleAbierto.id, siguienteEstado)}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all text-lg shadow-lg"
                >
                  {estadoInfo.accionTransportista}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SolicitudesTransportista;