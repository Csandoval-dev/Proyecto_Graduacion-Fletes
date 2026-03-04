import { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, getDoc 
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

function Chat({ conversacionId, usuario, onClose }) {
  // --- Mis Estados ---
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [conversacion, setConversacion] = useState(null);
  const messagesEndRef = useRef(null);

  // Traigo solo la info básica de la conversación nombres de los usuarios
  useEffect(() => {
    const cargarInfoChat = async () => {
      try {
        const convRef = doc(db, 'conversaciones', conversacionId);
        const convSnap = await getDoc(convRef);
        if (convSnap.exists()) {
          setConversacion(convSnap.data());
        }
      } catch (error) {
        console.error('Error al cargar info:', error);
      }
    };
    cargarInfoChat();
  }, [conversacionId]);

  // Listener de mensajes en tiempo real
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
      console.error('Error:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="h-6 w-6 border-2 border-black border-t-transparent animate-spin rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden rounded-3xl">
        
        {/* Header - Limpio y centrado en el nombre */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {(conversacion?.nombreTransportista || conversacion?.nombreCliente || "U").charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-xl text-black tracking-tight leading-none mb-1">
                {conversacion?.nombreTransportista || conversacion?.nombreCliente}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">En línea</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-black"
          >
            <IconX />
          </button>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sin actividad</p>
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

        {/* Input Final */}
        <form onSubmit={handleEnviar} className="p-6 bg-white">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-black transition-all border border-transparent focus-within:border-transparent shadow-inner">
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
              <IconSend />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;