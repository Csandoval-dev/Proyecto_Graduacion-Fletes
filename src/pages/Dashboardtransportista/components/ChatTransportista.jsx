import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where,
  orderBy, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Iconos
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
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conversacionId, setConversacionId] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. BUSCAR CONVERSACIÓN (Escucha activa con onSnapshot)
  useEffect(() => {
    if (!solicitud?.id) return;

    // Buscamos la conversación que pertenezca a esta solicitud específica
    const q = query(
      collection(db, 'conversaciones'),
      where('solicitudId', '==', solicitud.id)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Tomamos el ID del primer documento que coincida
        setConversacionId(snapshot.docs[0].id);
      } else {
        console.warn("Esperando a que se cree la conversación...");
      }
    }, (error) => {
      console.error("Error al buscar conversación:", error);
    });

    return () => unsubscribe();
  }, [solicitud]);

  // 2. ESCUCHAR MENSAJES EN TIEMPO REAL
  useEffect(() => {
    if (!conversacionId) return;

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
      
      // Auto-scroll al final
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [conversacionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3. ENVIAR MENSAJE Y ACTUALIZAR PADRE
  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !conversacionId) return;

    try {
      setEnviando(true);
      const textoMensaje = nuevoMensaje.trim();

      // A. Guardar mensaje en la subcolección
      await addDoc(collection(db, `conversaciones/${conversacionId}/mensajes`), {
        emisorId: usuario.uid,
        nombreEmisor: usuario.nombre,
        contenido: textoMensaje,
        leido: false,
        createdAt: serverTimestamp()
      });

      // B. Actualizar info en la conversación (para la lista del cliente)
      const convRef = doc(db, 'conversaciones', conversacionId);
      await updateDoc(convRef, {
        ultimoMensaje: textoMensaje,
        ultimoMensajeTimestamp: serverTimestamp()
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

  // UI de carga inicial mientras se encuentra la conversación
  if (!conversacionId) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Sincronizando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header con estilo de transportista */}
        <div className="bg-orange-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{solicitud.nombreUsuario} (Cliente)</h3>
            <p className="text-sm text-orange-100 italic">
              Solicitud: {solicitud.descripcionCarga.substring(0, 40)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <IconX />
          </button>
        </div>

        {/* Resumen de la Solicitud */}
        <div className="bg-orange-50 border-b border-orange-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase">📍 Origen</p>
              <p className="text-slate-900 font-medium truncate">{solicitud.origen?.direccion}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase">🏁 Destino</p>
              <p className="text-slate-900 font-medium truncate">{solicitud.destino?.direccion}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase">📏 Distancia</p>
              <p className="text-slate-900 font-medium">{solicitud.distanciaKm} km</p>
            </div>
            <div>
              <p className="text-xs font-bold text-orange-700 uppercase">Status</p>
              <span className="inline-block px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs font-black">
                {solicitud.estado.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="text-4xl mb-2">🚛</span>
              <p>Inicia la conversación con el cliente</p>
            </div>
          ) : (
            mensajes.map((msg) => {
              const esMio = msg.emisorId === usuario.uid;
              return (
                <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${esMio ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                      esMio 
                        ? 'bg-orange-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                    }`}>
                      {!esMio && (
                        <p className="text-[10px] font-black mb-1 uppercase opacity-70">
                          {msg.nombreEmisor}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed break-words font-medium">
                        {msg.contenido}
                      </p>
                      <p className={`text-[10px] mt-1 text-right ${esMio ? 'text-orange-100' : 'text-slate-500'}`}>
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

        {/* Input Form */}
        <form onSubmit={handleEnviar} className="bg-white border-t border-slate-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 font-medium"
              disabled={enviando}
            />
            <button
              type="submit"
              disabled={enviando || !nuevoMensaje.trim()}
              className="px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {enviando ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <IconSend />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatTransportista;