// src/components/ModalCalificacion.jsx
import { useState } from 'react';
import { doc, updateDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { calcularNuevasCalificaciones } from '../utils/calificaciones';

// Componente de estrella individual
function Estrella({ llena, onClick, onHover }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className="focus:outline-none transition-transform hover:scale-110"
    >
      <svg
        className={`w-12 h-12 ${llena ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  );
}

function ModalCalificacion({ solicitud, onClose, onCalificar }) {
  const [calificacion, setCalificacion] = useState(0);
  const [calificacionHover, setCalificacionHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleEnviarCalificacion = async () => {
    // Validar que haya seleccionado estrellas
    if (calificacion === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!confirm(`Confirmar calificación de ${calificacion} estrellas?`)) {
      return;
    }

    try {
      setEnviando(true);

      // 1. Actualizar la solicitud con la calificación
      const solicitudRef = doc(db, 'solicitudes', solicitud.id);
      await updateDoc(solicitudRef, {
        estado: 'finalizado',
        calificacion: {
          estrellas: calificacion,
          comentario: comentario.trim() || null,
          fechaCalificacion: serverTimestamp(),
          clienteId: solicitud.usuarioId
        },
        historial: arrayUnion({
          estado: 'finalizado',
          fecha: new Date(),
          descripcion: 'Servicio finalizado y calificado por el cliente'
        })
      });

      // 2. Actualizar estadísticas del transportista
      
      const transportistaRef = doc(db, 'usuarios', solicitud.transportistaId);
      const transportistaSnap = await getDoc(transportistaRef);
      
      if (transportistaSnap.exists()) {
        const transportistaData = transportistaSnap.data();
        
        // Usar función del utils para calcular nuevas calificaciones
        const nuevasCalificaciones = calcularNuevasCalificaciones(
          transportistaData.calificaciones,
          calificacion
        );

        // Actualizar Firestore
        await updateDoc(transportistaRef, {
          'calificaciones.total': nuevasCalificaciones.total,
          'calificaciones.promedio': nuevasCalificaciones.promedio,
          'calificaciones.estrellas': nuevasCalificaciones.estrellas
        });
      }

      alert('Calificación enviada correctamente');
      
      // Llamar callback
      if (onCalificar) {
        onCalificar();
      }
      
      onClose();
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      alert(`Error al enviar la calificación: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-black text-slate-900">
            Calificar Servicio
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Transportista: <span className="font-bold">{solicitud.nombreTransportista}</span>
          </p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          
          {/* Sistema de estrellas */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3 text-center">
              ¿Cómo fue tu experiencia?
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((estrella) => (
                <Estrella
                  key={estrella}
                  llena={estrella <= (calificacionHover || calificacion)}
                  onClick={() => setCalificacion(estrella)}
                  onHover={() => setCalificacionHover(estrella)}
                />
              ))}
            </div>
            <div 
              className="text-center mt-2"
              onMouseLeave={() => setCalificacionHover(0)}
            >
              {calificacion > 0 && (
                <p className="text-lg font-bold text-slate-900">
                  {calificacion} {calificacion === 1 ? 'estrella' : 'estrellas'}
                </p>
              )}
            </div>
          </div>

          {/* Campo de comentario */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows="4"
              maxLength="500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {comentario.length}/500 caracteres
            </p>
          </div>

          {/* Info del servicio */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
              Resumen del Servicio
            </p>
            <p className="text-sm text-slate-900 mb-2">
              {solicitud.descripcionCarga}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Distancia:</span>
                <span className="font-bold ml-1">{solicitud.distanciaKm} km</span>
              </div>
              <div>
                <span className="text-slate-500">Pagado:</span>
                <span className="font-bold ml-1">L. {solicitud.pago?.montoPagado || solicitud.precioAcordado}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="border-t border-slate-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={enviando}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviarCalificacion}
            disabled={enviando || calificacion === 0}
            className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Confirmar y Calificar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCalificacion;

