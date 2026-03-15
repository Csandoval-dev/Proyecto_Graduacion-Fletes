
import { useState } from 'react';

// Icono Chat
const IconChat = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

// Icono X
const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Icono Send
const IconSend = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// Base de datos de preguntas frecuentes
const FAQ_DATABASE = [
  {
    id: 1,
    pregunta: "¿Qué servicios ofrece Fletia?",
    respuesta: "Fletia conecta clientes que necesitan transportar carga con transportistas verificados. Ofrecemos servicios de mudanzas, transporte de mercancía, entregas y fletes en general dentro de San Pedro Sula y zonas cercanas.",
    keywords: ["servicios", "ofrece", "que hace", "mudanzas", "transporte"]
  },
  {
    id: 2,
    pregunta: "¿Cómo me registro en la plataforma?",
    respuesta: "Para registrarte, haz clic en 'Registrarse' en la página principal. Selecciona si eres Cliente o Transportista. Llena el formulario con tus datos y sigue las instrucciones. Si eres transportista, necesitarás verificar tu vehículo y documentos.",
    keywords: ["registro", "registrar", "cuenta", "crear", "inscribirse", "sign up"]
  },
  {
    id: 3,
    pregunta: "¿Cuánto cobra Fletia de comisión?",
    respuesta: "Fletia cobra una comisión del 15% sobre el monto total del flete. Esta comisión se deduce automáticamente del pago que recibe el transportista. El cliente paga el precio acordado completo.",
    keywords: ["comision", "cobra", "porcentaje", "costo", "tarifa", "precio", "15%"]
  },
  {
    id: 4,
    pregunta: "¿Cómo funciona el pago?",
    respuesta: "El cliente paga de forma segura con tarjeta a través de Stripe cuando acepta la oferta del transportista. El pago se procesa inmediatamente y el transportista puede iniciar el servicio. El transportista recibe su pago (menos la comisión del 15%) al finalizar el servicio.",
    keywords: ["pago", "pagar", "tarjeta", "stripe", "cobro", "dinero"]
  },
  {
    id: 5,
    pregunta: "¿Puedo cancelar un servicio?",
    respuesta: "Sí, puedes cancelar un servicio antes de que el transportista lo inicie. Una vez que el servicio está 'En Camino' o en estados posteriores, contacta directamente con el transportista a través del chat para coordinar la cancelación. Las políticas de reembolso dependen del estado del servicio.",
    keywords: ["cancelar", "cancelacion", "anular", "reembolso", "devolucion"]
  }
];

function ChatBot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      tipo: 'bot',
      texto: '¡Hola! Soy el asistente virtual de Fletia. ¿En qué puedo ayudarte?'
    }
  ]);
  const [inputUsuario, setInputUsuario] = useState('');

  // Buscar respuesta basada en keywords
  const buscarRespuesta = (preguntaUsuario) => {
    const preguntaLower = preguntaUsuario.toLowerCase();
    
    // Buscar coincidencia en keywords
    const respuestaEncontrada = FAQ_DATABASE.find(faq => 
      faq.keywords.some(keyword => preguntaLower.includes(keyword))
    );

    return respuestaEncontrada 
      ? respuestaEncontrada.respuesta 
      : "Lo siento, no tengo información sobre eso. Por favor contacta con nuestro equipo de soporte o revisa las preguntas frecuentes.";
  };

  // Manejar envío de mensaje
  const handleEnviar = (e) => {
    e.preventDefault();
    
    if (!inputUsuario.trim()) return;

    // Agregar mensaje del usuario
    const nuevosMensajes = [
      ...mensajes,
      { tipo: 'usuario', texto: inputUsuario }
    ];

    // Buscar respuesta
    const respuesta = buscarRespuesta(inputUsuario);

    // Agregar respuesta del bot (con delay para simular escritura)
    setTimeout(() => {
      setMensajes([
        ...nuevosMensajes,
        { tipo: 'bot', texto: respuesta }
      ]);
    }, 500);

    setMensajes(nuevosMensajes);
    setInputUsuario('');
  };

  // Manejar clic en pregunta frecuente
  const handlePreguntaFrecuente = (faq) => {
    const nuevosMensajes = [
      ...mensajes,
      { tipo: 'usuario', texto: faq.pregunta },
      { tipo: 'bot', texto: faq.respuesta }
    ];
    setMensajes(nuevosMensajes);
  };

  return (
    <>
      {/* Botón flotante */}
      {!abierto && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <span className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-2xl shadow-lg whitespace-nowrap animate-bounce">
            ¿Necesitas ayuda? 
          </span>
          <button
            onClick={() => setAbierto(true)}
            className="w-16 h-16 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center flex-shrink-0"
            aria-label="Abrir chat de ayuda"
          >
            <IconChat />
          </button>
        </div>
      )}

      {/* Ventana del chat */}
      {abierto && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200">
          
          {/* Header */}
          <div className="bg-black text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm">Asistente Fletia</p>
                <p className="text-xs opacity-80">En línea</p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar chat"
            >
              <IconX />
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {mensajes.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.tipo === 'usuario'
                      ? 'bg-black text-white rounded-br-none'
                      : 'bg-white text-black border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}

            {/* Preguntas frecuentes  */}
            {mensajes.length <= 1 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold text-slate-500 uppercase">Preguntas Frecuentes:</p>
                {FAQ_DATABASE.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handlePreguntaFrecuente(faq)}
                    className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-black transition-all text-sm"
                  >
                    {faq.pregunta}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <input
                type="text"
                value={inputUsuario}
                onChange={(e) => setInputUsuario(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!inputUsuario.trim()}
                className="p-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
              >
                <IconSend />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatBot;