
import { useState } from 'react';
import { doc, updateDoc, serverTimestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { calcularNuevasCalificaciones } from '../utils/calificaciones';

// Funcio para renderizar cada estrella, con manejo de eventos para click y hover
function Estrella({ llena, onClick, onHover }) {
  return (
    // Usamos span+onClick en vez de button para evitar estilos nativos del navegador
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={onHover}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ cursor: 'pointer', display: 'inline-flex', padding: '4px', lineHeight: 0 }}
    >
      <svg
        style={{
          width: '2.5rem',
          height: '2.5rem',
          color: llena ? '#facc15' : '#e2e8f0',
          transition: 'color 0.15s',
          display: 'block',
        }}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </span>
  );
}

//Etiquetas para cada nivel de calificacion
const ETIQUETAS_CALIFICACION = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
};


//Componente principal del modal de calificacion
function ModalCalificacion({ solicitud, onClose, onCalificar }) {
  const [calificacion, setCalificacion]       = useState(0);
  const [calificacionHover, setCalificacionHover] = useState(0);
  const [comentario, setComentario]           = useState('');
  const [enviando, setEnviando]               = useState(false);

  // Valor activo: hover tiene prioridad sobre selección para previsualizar
  const estrellaActiva = calificacionHover || calificacion;

  // ── Enviar calificación a Firestore ──────────
  const handleEnviarCalificacion = async () => {
    if (calificacion === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    if (!confirm(`Confirmar calificación de ${calificacion} estrellas?`)) return;

    try {
      setEnviando(true);

      // 1. Marcar solicitud como finalizada con la calificación del cliente
      const solicitudRef = doc(db, 'solicitudes', solicitud.id);
      await updateDoc(solicitudRef, {
        estado: 'finalizado',
        calificacion: {
          estrellas: calificacion,
          comentario: comentario.trim() || null,
          fechaCalificacion: serverTimestamp(),
          clienteId: solicitud.usuarioId,
        },
        historial: arrayUnion({
          estado: 'finalizado',
          fecha: new Date(),
          descripcion: 'Servicio finalizado y calificado por el cliente',
        }),
      });

      // 2. Actualizar promedio de calificaciones del transportista
      const transportistaRef  = doc(db, 'usuarios', solicitud.transportistaId);
      const transportistaSnap = await getDoc(transportistaRef);

      if (transportistaSnap.exists()) {
        const transportistaData = transportistaSnap.data();

        const nuevasCalificaciones = calcularNuevasCalificaciones(
          transportistaData.calificaciones,
          calificacion
        );

        await updateDoc(transportistaRef, {
          'calificaciones.total':    nuevasCalificaciones.total,
          'calificaciones.promedio': nuevasCalificaciones.promedio,
          'calificaciones.estrellas': nuevasCalificaciones.estrellas,
        });
      }

      alert('Calificación enviada correctamente');
      if (onCalificar) onCalificar();
      onClose();
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      alert(`Error al enviar la calificación: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    /* Overlay oscuro con blur suave */
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      {/* Contenedor del modal – ancho máximo controlado y responsivo */}
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* ── Header ──────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            Calificar Servicio
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Transportista:{' '}
            <span className="font-semibold text-slate-700">
              {solicitud.nombreTransportista}
            </span>
          </p>
        </div>

        {/* ── Cuerpo ──────────────────────────────── */}
        <div className="px-6 py-5 space-y-5">

          {/* Sección de estrellas */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-slate-600">
              ¿Cómo fue tu experiencia?
            </p>

            {/* Fila de estrellas sin background heredado */}
            <div
              className="flex gap-1"
              onMouseLeave={() => setCalificacionHover(0)}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <Estrella
                  key={num}
                  llena={num <= estrellaActiva}
                  onClick={() => setCalificacion(num)}
                  onHover={() => setCalificacionHover(num)}
                />
              ))}
            </div>

            {/* Etiqueta descriptiva de la puntuación seleccionada */}
            <p className="text-sm font-bold text-slate-800 h-5">
              {estrellaActiva > 0 && ETIQUETAS_CALIFICACION[estrellaActiva]}
            </p>
          </div>

          {/* Campo de comentario opcional */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Comentario{' '}
              <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                         resize-none text-slate-800 placeholder:text-slate-400 transition"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right">
              {comentario.length}/500
            </p>
          </div>
        </div>

        {/* ── Footer con botones de acción ─────────── */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={enviando}
            className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100
                       rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleEnviarCalificacion}
            disabled={enviando || calificacion === 0}
            className="flex-1 py-3 text-sm font-bold text-white bg-black
                       rounded-xl hover:bg-slate-800 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalCalificacion;