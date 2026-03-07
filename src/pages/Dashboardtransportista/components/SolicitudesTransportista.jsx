import { useState, useEffect } from 'react';
import { 
  collection, query, where, doc, updateDoc, 
  orderBy, arrayUnion, onSnapshot 
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import ChatTransportista from './ChatTransportista';
import MapaRuta from '../../../components/MapaRuta';
import { ESTADOS_FLETE, getEstadoInfo } from '../../../constants/estadosFlete';

//Componente principal de la seccion de solicitudes del transportista
function SolicitudesTransportista({ usuario }) {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendiente');
  const [chatAbierto, setChatAbierto] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(null);

//Escuchar SOlicitu en tiempor real 
  useEffect(() => {
    if (!usuario?.uid) return;
    setLoading(true);

    //contruir consulta con filtro dinamico
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

    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSolicitudes(lista);
      setLoading(false);

      // Mantener el detalle actualizado si está abierto
      setDetalleAbierto(prev => {
        if (!prev) return null;
        return lista.find(s => s.id === prev.id) || prev;
      });
    }, (error) => {
      console.error('Error al escuchar solicitudes:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [usuario, filtro]);

  // Función para cambiar estado de la solicitud
  const cambiarEstado = async (solicitudId, nuevoEstado) => {
    const estadoInfo = getEstadoInfo(nuevoEstado);
    
    if (!confirm(`${estadoInfo.accionTransportista}?`)) return;
    
    try {
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        estado: nuevoEstado,
        historial: arrayUnion({
          estado: nuevoEstado,
          fecha: new Date(),
          descripcion: estadoInfo.descripcion
        })
      });
      //Si el detalle de la solicitud se acaba de abrir, se cierra para evitar mostrar informacion desactualizada
      setDetalleAbierto(null);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado');
    }
  };

  // Funcion para abrir el chat de la solicitud
  const abrirChat = (solicitud) => {
    setChatAbierto(solicitud);
  };
// FUncion para abrir el modal de detalle de la solicitud
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

      {/* Filtros - AGREGADO: filtro "pagado" del primer código */}
      <div className="flex gap-2 flex-wrap">
        {['pendiente', 'aceptada', 'pagado', 'en_camino', 'recogido', 'entregado', 'finalizado', 'todas'].map((f) => (
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
                      
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
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

  // Componenete modal para mostrar detalla de la solicitud, con mapa y acciones y dependiendo del estado
  function ModalDetalleSolicitud() {
    // Obtener solicitud actualizada en tiempo real
    const sol = solicitudes.find(s => s.id === detalleAbierto.id) || detalleAbierto;
    const estadoInfo = getEstadoInfo(sol.estado);
    const siguienteEstado = estadoInfo.siguienteEstado;
    
    //  Verificaciones de pago del primer código
    const esperandoPago = sol.oferta?.estado === 'pendiente_cliente';

    //Funcion para determinar si el transportista puede acciona el cambio de estado, esto depende del estado actual de la solicitud
    const puedeAccionar = () => {
      if (sol.estado === 'pendiente') return true;// puede aceptar la solicitud
      if (sol.estado === 'aceptada') return false;//No puede comenzar el servicio si el cliente no ha pagado
      if (sol.estado === 'pagado') return sol.pagado === true;//Solo se puede iniciar el servicio si el pago ha sido confirmado
      return true;
    };

    //No mostrar el boton de accion si no hay un siguiente estado definido, si la accion del transportista es nula  o vacio, o si la solicitud ya fue aceptada
    const mostrarBoton = siguienteEstado && estadoInfo.accionTransportista && sol.estado !== 'aceptada';

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Solicitud de {sol.nombreUsuario}
              </h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                  {estadoInfo.icono} {estadoInfo.label}
                </span>
              </div>
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
              origen={sol.origen}
              destino={sol.destino}
              height="400px"
            />

            {/* Info de la solicitud */}
            <div className="bg-slate-50 rounded-xl p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-2">Descripción de Carga</p>
                <p className="text-lg text-slate-900">{sol.descripcionCarga}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-1">Distancia</p>
                  <p className="text-xl font-bold text-slate-900">{sol.distanciaKm} km</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-1">Tipo Vehículo</p>
                  <p className="text-xl font-bold text-slate-900 capitalize">{sol.tipoVehiculo}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase mb-1">Fecha Solicitada</p>
                  <p className="text-xl font-bold text-slate-900">
                    {sol.fechaSolicitada?.toDate?.()?.toLocaleDateString('es-HN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Banners de estados de pago */}
            
            {/* Banner estado "pendiente" */}
            {sol.estado === 'pendiente' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-bold text-yellow-900 mb-1">Solicitud pendiente</p>
                <p className="text-sm text-yellow-700">Acepta la solicitud para iniciar la negociación con el cliente</p>
              </div>
            )}

            {/* ==========================================
                NUEVO: Banner estado "entregado"
                Transportista espera confirmación del cliente
                ========================================== */}
            {sol.estado === 'entregado' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-bold text-purple-900 mb-1">Carga entregada - Esperando confirmación del cliente</p>
                <p className="text-sm text-purple-700">
                  El cliente debe confirmar la entrega y calificar el servicio para finalizar
                </p>
              </div>
            )}

            {/* Banner estado "aceptada" sin pago */}
            {sol.estado === 'aceptada' && !sol.pagado && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-bold text-blue-900 mb-1">
                  {esperandoPago ? 'Esperando pago del cliente' : 'Solicitud aceptada'}
                </p>
                <p className="text-sm text-blue-700">
                  {esperandoPago
                    ? `Oferta enviada: L. ${sol.oferta.monto} — esperando que el cliente pague`
                    : 'Abre el chat para enviarle tu oferta de precio al cliente'
                  }
                </p>
              </div>
            )}

           {/* Banner pago confirmado - solo mostrar en estado "pagado" */}
{sol.estado === 'pagado' && sol.pagado && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <p className="font-bold text-green-900 mb-1">Pago confirmado - puedes iniciar el servicio</p>
    <p className="text-sm text-green-700">
      Monto pagado: L. {sol.pago?.montoPagado || sol.precioAcordado}
    </p>
    {sol.oferta?.desglose && (
      <p className="text-sm font-bold text-green-700 mt-1">
        Recibirás: L. {sol.oferta.desglose.pagoTransportista}
      </p>
    )}
  </div>
)}

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  abrirChat(sol);
                  setDetalleAbierto(null);
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Abrir Chat
              </button>

              {/*
                   Boton de accion principal,su texto y disponibilidad dependen del estado actual de la solicitud  y de si el pago ha sido confirmado o no,esto se maneja con la funcio puede acciona y con la varible mostrarboton.
                  */}
              {mostrarBoton && (
                <button
                  onClick={() => cambiarEstado(sol.id, siguienteEstado)}
                  disabled={!puedeAccionar()}
                  className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all text-lg ${
                    puedeAccionar()
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
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