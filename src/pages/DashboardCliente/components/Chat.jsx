
import { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc 
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ProcesarPagoStripe from '../../../components/ProcesarPagoStripe';

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
// Componente principal del chat
function Chat({ conversacionId, usuario, onClose }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conversacion, setConversacion] = useState(null);
  const messagesEndRef = useRef(null);
  const [mostrarBannerConfirmacion, setMostrarBannerConfirmacion] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [procesandoOferta, setProcesandoOferta] = useState(false);

  //  Escuchar conversación en tiempo real 
  useEffect(() => {
    const convRef = doc(db, 'conversaciones', conversacionId);
    const unsubscribe = onSnapshot(convRef, (snap) => {
      if (snap.exists()) {
        setConversacion(snap.data());
      }
    });
    return () => unsubscribe();
  }, [conversacionId]);

  // Escuchar solicitud en tiempo real 
  // Depende de conversacion.solicitudId que llega por onSnapshot
  useEffect(() => {
    if (!conversacion?.solicitudId) return;

    const solRef = doc(db, 'solicitudes', conversacion.solicitudId);
    const unsubscribe = onSnapshot(solRef, (snap) => {
      if (snap.exists()) {
        setSolicitud({ id: snap.id, ...snap.data() });
      }
    });
    return () => unsubscribe();
  }, [conversacion?.solicitudId]);

  //  Escuchar mensajes en tiempo real 
  useEffect(() => {
    const q = query(
      collection(db, `conversaciones/${conversacionId}/mensajes`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMensajes(msgs);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });
    return () => unsubscribe();
  }, [conversacionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hay oferta pendiente , bloquea mensajes hasta que pague o rechace
  const hayOfertaPendiente = solicitud?.oferta?.estado === 'pendiente_cliente' && !solicitud?.pagado;

  //  Enviar mensaje 
  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || hayOfertaPendiente) return;

    try {
      setEnviando(true);
      await addDoc(collection(db, `conversaciones/${conversacionId}/mensajes`), {
        emisorId: usuario.uid,
        nombreEmisor: usuario.nombre,
        contenido: nuevoMensaje.trim(),
        leido: false,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'conversaciones', conversacionId), {
        ultimoMensaje: nuevoMensaje.trim(),
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

  //  Rechazat oferta y seguir chateando o aceptar oferta y mostrar modal de pago
  const handleRechazarOferta = async () => {
    if (!confirm('¿Rechazar esta oferta?')) return;
    try {
      setProcesandoOferta(true);
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        'oferta.estado': 'rechazada_cliente'
      });
    } catch (error) {
      alert('Error al rechazar oferta');
    } finally {
      setProcesandoOferta(false);
    }
  };

  //  Aceptar oferta  y mostrar modal de pago
  const handleAceptarOferta = async () => {
    if (!confirm(`¿Aceptar oferta de L. ${solicitud.oferta.monto} y proceder al pago?`)) return;
    try {
      setProcesandoOferta(true);
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        'oferta.estado': 'aceptada_cliente',
        precioAcordado: solicitud.oferta.monto
      });
      setMostrarPago(true);
    } catch (error) {
      alert('Error al aceptar oferta');
    } finally {
      setProcesandoOferta(false);
    }
  };

  //Confirma pago exitoso y actualiza estado a pagado para que transportista inici servicio
  const handlePagoExitoso = async () => {
    try {
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        estado: 'pagado',
        pagado: true,
        pago: {
          montoPagado: solicitud.oferta.monto,
          fechaPago: serverTimestamp(),
          metodo: 'stripe'
        }
      });
      setMostrarPago(false);
      // ACTIVAR EL BANNER TEMPORAL
    setMostrarBannerConfirmacion(true);
    
    // OCULTARLO DESPUÉS DE 5 SEGUNDOS
    setTimeout(() => {
      setMostrarBannerConfirmacion(false);
    }, 6000);
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      alert('Pago realizado, pero hubo un error al actualizar. Contacta soporte.');
    }
  };
// Formatear fecha de mensajes
  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'HH:mm', { locale: es });
    } catch { return ''; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="h-6 w-6 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }// Renderizar chat
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-200 shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden rounded-3xl">

          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {(conversacion?.nombreTransportista || 'T').charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-xl text-black tracking-tight leading-none mb-1">
                  {conversacion?.nombreTransportista}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">En línea</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <IconX />
            </button>
          </div>

          {/* Mensajes */}
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
                      <div className={`px-5 py-3 shadow-sm text-sm font-medium leading-relaxed ${
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

          {/* ─Banner oferta pendiente*/}
          {hayOfertaPendiente && (
            <div className="px-6 pb-2">
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-green-900 mb-2"> Oferta Recibida</p>
                  <p className="text-4xl font-black text-green-900 mb-1">L. {solicitud.oferta.monto}</p>
                  <p className="text-xs text-green-700">Por el servicio de flete</p>
                </div>

                {solicitud.oferta.desglose && (
                  <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-bold text-slate-900 mb-3">Desglose del Pago:</p>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Servicio de flete:</span>
                      <span className="font-bold">L. {solicitud.oferta.desglose.montoPagado}</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded p-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-900">TOTAL A PAGAR:</span>
                      <span className="text-2xl font-black text-slate-900">L. {solicitud.oferta.monto}</span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    ℹ️ Al aceptar, podrás pagar de forma segura con Stripe. El servicio inicia una vez confirmado el pago.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRechazarOferta}
                    disabled={procesandoOferta}
                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-300 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={handleAceptarOferta}
                    disabled={procesandoOferta}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 text-lg"
                  >
                    {procesandoOferta ? 'Procesando...' : ' Aceptar y Pagar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/*  Banner pago confirmado */}
          {mostrarBannerConfirmacion && (
            <div className="px-6 pb-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="font-bold text-green-900 mb-1"> Pago confirmado</p>
                <p className="text-sm text-green-700">El transportista iniciará el servicio en breve</p>
              </div>
            </div>
          )}

          {/* Input mensaje */}
          {/*  Se oculta completamente cuando hay oferta pendiente */}
          {!hayOfertaPendiente && (
            <form onSubmit={handleEnviar} className="p-6 bg-white">
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-black transition-all border border-transparent shadow-inner">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent py-3 text-sm focus:outline-none text-black font-medium"
                  disabled={enviando}
                />
                <button
                  type="submit"
                  disabled={enviando || !nuevoMensaje.trim()}
                  className="p-2 text-black hover:scale-110 transition-transform disabled:opacity-10"
                >
                  {enviando
                    ? <div className="h-5 w-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                    : <IconSend />
                  }
                </button>
              </div>
            </form>
          )}

          {/* Aviso cuando el input está bloqueado por oferta */}
          {hayOfertaPendiente && (
            <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200 text-center">
              <p className="text-xs font-bold text-yellow-800">
                ⏸ Chat pausado — Acepta o rechaza la oferta para continuar
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Modal Stripe */}
      {mostrarPago && solicitud && (
        <ProcesarPagoStripe
          solicitud={{ ...solicitud, monto: solicitud.oferta.monto }}
          onExito={handlePagoExitoso}
          onCancelar={() => setMostrarPago(false)}
        />
      )}
    </>
  );
}

export default Chat;