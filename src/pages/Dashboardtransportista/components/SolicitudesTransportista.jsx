// src/pages/Dashboardtransportista/components/SolicitudesTransportista.jsx
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import ChatTransportista from './ChatTransportista';

const IconClock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function SolicitudesTransportista({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente'); // pendiente, asignada, todas
  const [chatAbierto, setChatAbierto] = useState(null);

  useEffect(() => {
    cargarSolicitudes();
  }, [usuario, filtro]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      
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

  const aceptarSolicitud = async (solicitudId) => {
    if (!confirm('¿Aceptar esta solicitud?')) return;
    
    try {
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        estado: 'asignada'
      });
      alert('✅ Solicitud aceptada');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al aceptar solicitud');
    }
  };

  const iniciarServicio = async (solicitudId) => {
    if (!confirm('¿Iniciar el servicio?')) return;
    
    try {
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        estado: 'en_proceso'
      });
      alert('✅ Servicio iniciado');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al iniciar servicio');
    }
  };

  const finalizarServicio = async (solicitudId) => {
    if (!confirm('¿Finalizar el servicio?')) return;
    
    try {
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        estado: 'finalizado'
      });
      alert('✅ Servicio finalizado');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al finalizar servicio');
    }
  };

  const abrirChat = (solicitud) => {
    setChatAbierto(solicitud);
  };

  const getBadgeEstado = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      asignada: 'bg-blue-100 text-blue-700 border-blue-200',
      en_proceso: 'bg-purple-100 text-purple-700 border-purple-200',
      finalizado: 'bg-green-100 text-green-700 border-green-200',
      cancelado: 'bg-red-100 text-red-700 border-red-200'
    };
    return badges[estado] || badges.pendiente;
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
        <h1 className="text-3xl font-black text-slate-900">Mis Solicitudes</h1>
        <p className="text-slate-600 mt-1">Gestiona las solicitudes de flete</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['pendiente', 'asignada', 'en_proceso', 'finalizado', 'todas'].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filtro === f
                ? 'bg-black text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f === 'todas' ? 'Todas' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-600">No hay solicitudes {filtro !== 'todas' ? filtro : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {sol.nombreUsuario}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeEstado(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{sol.descripcionCarga}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Origen</p>
                    <p className="text-sm text-slate-900">{sol.origen?.direccion}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Destino</p>
                    <p className="text-sm text-slate-900">{sol.destino?.direccion}</p>
                  </div>
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
                    onClick={() => abrirChat(sol)}
                    className="flex-1 px-4 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all"
                  >
                    💬 Chat
                  </button>

                  {sol.estado === 'pendiente' && (
                    <button
                      onClick={() => aceptarSolicitud(sol.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                    >
                      ✓ Aceptar
                    </button>
                  )}

                  {sol.estado === 'asignada' && (
                    <button
                      onClick={() => iniciarServicio(sol.id)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all"
                    >
                      🚀 Iniciar
                    </button>
                  )}

                  {sol.estado === 'en_proceso' && (
                    <button
                      onClick={() => finalizarServicio(sol.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                    >
                      ✓ Finalizar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}

export default SolicitudesTransportista;