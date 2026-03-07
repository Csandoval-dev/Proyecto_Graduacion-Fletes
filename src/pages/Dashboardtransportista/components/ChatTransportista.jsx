import { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, updateDoc, doc
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calcularDesglosePago } from '../../../utils/calcularComision';

// Iconos minimalistas
const IconSend = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const IconX = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function ChatTransportista({ solicitud, usuario, onClose }) {
  // Estados existentes para mensajes
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conversacionId, setConversacionId] = useState(null);
  const messagesEndRef = useRef(null);

//Estados del flete para mostrar boton de enviar precio formal, solo cuando la solicitud este aceptada
  const [mostrarFormPrecio, setMostrarFormPrecio] = useState(false);
  const [montoPrecio, setMontoPrecio] = useState('');
  const [enviandoPrecio, setEnviandoPrecio] = useState(false);

  //  BUSCAR LA CONVERSACIÓN: Uso el id de la solicitud para encontrar el chat
  useEffect(() => {
    if (!solicitud?.id) return;

    // Hago una consulta a la colección de conversaciones buscando el solicitudId
    const q = query(
      collection(db, 'conversaciones'),
      where('solicitudId', '==', solicitud.id)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Si existe, guardo el ID de la conversación para cargar los mensajes después
        setConversacionId(snapshot.docs[0].id);
      }
    }, (error) => {
      console.error("Error al buscar conversación:", error);
    });

    return () => unsubscribe();
  }, [solicitud]);

  //  ESCUCHAR LOS MENSAJES: Una vez tengo el ID del chat, escucho los mensajes
  useEffect(() => {
    if (!conversacionId) return;

    const q = query(
      collection(db, `conversaciones/${conversacionId}/mensajes`),
      orderBy('createdAt', 'asc') // Siempre del más antiguo al más nuevo
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMensajes(msgs);
      setLoading(false);
      
      // Auto-scroll al final para ver el último mensaje
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [conversacionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  //  ENVIAR MENSAJE: Guardo el mensaje y actualizo la previsualización
  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !conversacionId) return;

    try {
      setEnviando(true);
      const textoMensaje = nuevoMensaje.trim();

      // Meto el mensaje en la subcolección de la conversación
      await addDoc(collection(db, `conversaciones/${conversacionId}/mensajes`), {
        emisorId: usuario.uid,
        nombreEmisor: usuario.nombre,
        contenido: textoMensaje,
        leido: false,
        createdAt: serverTimestamp()
      });

      //  Actualizo el documento de la conversación (para que el cliente vea el texto rápido)
      const convRef = doc(db, 'conversaciones', conversacionId);
      await updateDoc(convRef, {
        ultimoMensaje: textoMensaje,
        ultimoMensajeTimestamp: serverTimestamp()
      });

      setNuevoMensaje('');
      scrollToBottom();
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  //Funcion para enviar oferta de precio formal al cliente, solo se muestra si la solicitud esta aceptada y no hay oferta previa
  const handleEnviarPrecio = async () => {
    if (!montoPrecio || parseFloat(montoPrecio) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (!confirm(`Enviar oferta de L. ${montoPrecio}?`)) return;

    try {
      setEnviandoPrecio(true);
      
      const monto = parseFloat(montoPrecio);
      
      // Calcular el desglose con la comisión del 15%
      const desglose = calcularDesglosePago(monto);

      // Actualizar la solicitud con la oferta
      const solicitudRef = doc(db, 'solicitudes', solicitud.id);
      await updateDoc(solicitudRef, {
        oferta: {
          monto: monto,
          estado: 'pendiente_cliente', // Cliente debe aceptar
          fechaEnviada: serverTimestamp(),
          desglose: desglose // Guardar desglose completo
        }
      });

      alert('Oferta enviada al cliente');
      setMostrarFormPrecio(false);
      setMontoPrecio('');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar oferta');
    } finally {
      setEnviandoPrecio(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'HH:mm', { locale: es });
    } catch { return ''; }
  };

  //  Calcular desglose en tiempo real mientras el transportista escribe
  const desglose = montoPrecio && parseFloat(montoPrecio) > 0
    ? calcularDesglosePago(parseFloat(montoPrecio))
    : null;

  // Pantalla de carga mientras se sincroniza el chat
  if (!conversacionId) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-10 max-w-sm text-center shadow-2xl border border-gray-100">
          <div className="h-8 w-8 border-2 border-black border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-xs font-black uppercase tracking-wide text-black">Sincronizando Chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        
        {/* Header - Identidad visual limpia */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar del Cliente */}
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {solicitud.nombreUsuario?.charAt(0) || "C"}
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Chat con Cliente</p>
              <h3 className="font-black text-xl text-black tracking-tight leading-none">
                {solicitud.nombreUsuario}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-black"
          >
            <IconX />
          </button>
        </div>

        {/* Área de Mensajes - Fondo Ultra Limpio */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-xs font-black uppercase tracking-wide">Sin mensajes aún</p>
            </div>
          ) : (
            mensajes.map((msg) => {
              const esMio = msg.emisorId === usuario.uid;
              return (
                <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-3.5 shadow-sm text-sm font-medium leading-relaxed ${
                      esMio 
                        ? 'bg-black text-white rounded-2xl rounded-tr-none' 
                        : 'bg-gray-100 text-black rounded-2xl rounded-tl-none'
                    }`}>
                      {msg.contenido}
                    </div>
                    <p className="text-xs mt-1.5 font-bold text-gray-300 uppercase tracking-widest">
                      {formatearFecha(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 
             SECCIÓN: BOTÓN Y FORMULARIO DE PRECIO
            Solo se muestra si la solicitud está "aceptada" y no hay oferta aún
            */}
        <div className="px-6 pb-2">
          
          {/* Si ya hay oferta pendiente - mostrar estado */}
          {solicitud.oferta?.estado === 'pendiente_cliente' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
              <p className="text-xs font-bold text-yellow-900">
                Oferta enviada: L. {solicitud.oferta.monto}
              </p>
              <p className="text-xs text-yellow-700">
                Esperando respuesta del cliente
              </p>
            </div>
          )}

          {/* Si no hay oferta y solicitud está aceptada - permitir enviar precio */}
          {!solicitud.oferta && solicitud.estado === 'aceptada' && (
            <>
              {/* Mostrar botón para abrir formulario */}
              {!mostrarFormPrecio ? (
                <button
                  onClick={() => setMostrarFormPrecio(true)}
                  className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all mb-2"
                >
                  Enviar Precio Formal
                </button>
              ) : (
                // Formulario para ingresar precio
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-2 space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-orange-900 mb-2">
                      Monto a cobrar:
                    </label>
                    <input
                      type="number"
                      value={montoPrecio}
                      onChange={(e) => setMontoPrecio(e.target.value)}
                      placeholder="Ej: 120"
                      className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Mostrar desglose automático mientras escribe */}
                  {desglose && (
                    <div className="bg-white rounded-lg p-3 text-sm">
                      <p className="font-bold text-slate-900 mb-2">Desglose:</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-bold">L. {desglose.montoPagado}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Comisión Fletia ({desglose.porcentajeComision}%):</span>
                          <span>- L. {desglose.comisionFletia}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-bold text-green-700">Recibirás:</span>
                          <span className="font-bold text-green-700">L. {desglose.pagoTransportista}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMostrarFormPrecio(false);
                        setMontoPrecio('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 font-bold rounded-lg hover:bg-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEnviarPrecio}
                      disabled={!montoPrecio || enviandoPrecio}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {enviandoPrecio ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Form - Minimalista */}
        <form onSubmit={handleEnviar} className="p-6 bg-white">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-5 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-black transition-all border border-transparent shadow-inner">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe una respuesta..."
              className="flex-1 bg-transparent py-3 text-sm focus:outline-none text-black font-medium"
              disabled={enviando}
            />
            <button
              type="submit"
              disabled={enviando || !nuevoMensaje.trim()}
              className="p-2 text-black hover:scale-110 transition-transform disabled:opacity-10"
            >
              {enviando ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
              ) : (
                <IconSend />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatTransportista;