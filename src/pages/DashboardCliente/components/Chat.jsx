// src/pages/DashboardCliente/components/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

function Chat({ conversacionId, usuario, onClose }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conversacion, setConversacion] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const messagesEndRef = useRef(null);

  // Cargar información de la conversación y solicitud
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener conversación
        const convRef = doc(db, 'conversaciones', conversacionId);
        const convSnap = await getDoc(convRef);
        
        if (convSnap.exists()) {
          const convData = convSnap.data();
          setConversacion(convData);

          // Obtener solicitud relacionada
          if (convData.solicitudId) {
            const solRef = doc(db, 'solicitudes', convData.solicitudId);
            const solSnap = await getDoc(solRef);
            if (solSnap.exists()) {
              setSolicitud({ id: solSnap.id, ...solSnap.data() });
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, [conversacionId]);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, `conversaciones/${conversacionId}/mensajes`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMensajes(msgs);
      setLoading(false);
      
      // Scroll al final después de cargar mensajes
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [conversacionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim()) return;

    try {
      setEnviando(true);

      await addDoc(collection(db, `conversaciones/${conversacionId}/mensajes`), {
        emisorId: usuario.uid,
        nombreEmisor: usuario.nombre,
        contenido: nuevoMensaje.trim(),
        leido: false,
        createdAt: serverTimestamp()
      });

      setNuevoMensaje('');
      scrollToBottom();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('❌ Error al enviar mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'HH:mm', { locale: es });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col">
        
        {/* Header del Chat */}
        <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              {conversacion?.nombreTransportista || conversacion?.nombreCliente}
            </h3>
            <p className="text-sm text-slate-300">
              {solicitud ? `Flete: ${solicitud.descripcionCarga.substring(0, 40)}...` : 'Chat'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <IconX />
          </button>
        </div>

        {/* Info de la Solicitud */}
        {solicitud && (
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Origen</p>
                <p className="text-slate-900 font-medium truncate">{solicitud.origen?.direccion}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Destino</p>
                <p className="text-slate-900 font-medium truncate">{solicitud.destino?.direccion}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Distancia</p>
                <p className="text-slate-900 font-medium">{solicitud.distanciaKm} km</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Estado</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                  solicitud.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                  solicitud.estado === 'asignada' ? 'bg-blue-100 text-blue-700' :
                  solicitud.estado === 'en_proceso' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {solicitud.estado}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {mensajes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-500 mb-2">💬</p>
                <p className="text-slate-600">No hay mensajes aún</p>
                <p className="text-sm text-slate-500">Envía el primer mensaje</p>
              </div>
            </div>
          ) : (
            mensajes.map((msg) => {
              const esMio = msg.emisorId === usuario.uid;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md ${esMio ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-4 py-2 ${
                      esMio 
                        ? 'bg-black text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                    }`}>
                      {!esMio && (
                        <p className="text-xs font-bold mb-1 text-blue-600">
                    {msg.nombreEmisor || solicitud?.nombreTransportista || "Transportista"}
                   </p>
                      )}
                      <p className="text-sm leading-relaxed break-words">
                        {msg.contenido}
                      </p>
                      <p className={`text-xs mt-1 ${esMio ? 'text-white/70' : 'text-slate-500'}`}>
                        {formatearFecha(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensaje */}
        <form onSubmit={handleEnviar} className="bg-white border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              disabled={enviando}
            />
            <button
              type="submit"
              disabled={enviando || !nuevoMensaje.trim()}
              className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconSend />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;