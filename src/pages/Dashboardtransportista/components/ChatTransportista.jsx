// src/pages/DashboardCliente/components/ChatTransportista.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, updateDoc, doc
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  // --- Mis Estados ---
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conversacionId, setConversacionId] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. BUSCAR LA CONVERSACIÓN: Uso el id de la solicitud para encontrar el chat
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

  // 2. ESCUCHAR LOS MENSAJES: Una vez tengo el ID del chat, escucho los mensajes
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

  // 3. ENVIAR MENSAJE: Guardo el mensaje y actualizo la previsualización
  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !conversacionId) return;

    try {
      setEnviando(true);
      const textoMensaje = nuevoMensaje.trim();

      // A. Meto el mensaje en la subcolección de la conversación
      await addDoc(collection(db, `conversaciones/${conversacionId}/mensajes`), {
        emisorId: usuario.uid,
        nombreEmisor: usuario.nombre,
        contenido: textoMensaje,
        leido: false,
        createdAt: serverTimestamp()
      });

      // B. Actualizo el documento de la conversación (para que el cliente vea el texto rápido)
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

  const formatearFecha = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'HH:mm', { locale: es });
    } catch { return ''; }
  };

  // Pantalla de carga mientras se sincroniza el chat
  if (!conversacionId) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-10 max-w-sm text-center shadow-2xl border border-gray-100">
          <div className="h-8 w-8 border-2 border-black border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Sincronizando Chat</p>
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
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Chat con Cliente</p>
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sin mensajes aún</p>
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
                    <p className="text-[9px] mt-1.5 font-bold text-gray-300 uppercase tracking-widest">
                      {formatearFecha(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
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