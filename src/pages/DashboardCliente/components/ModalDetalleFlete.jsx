import { useEffect } from "react";
import { createPortal } from "react-dom";
import { getEstadoInfo } from "../../../constants/estadosFlete";
import MapaRuta from "../../../components/MapaRuta";

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconPin = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);
const IconBox = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
  </svg>
);
const IconRuler = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const PASOS_VIAJE = [
  { estado: 'pendiente',  label: 'Solicitado',          sub: 'Esperando respuesta del transportista' },
  { estado: 'aceptada',   label: 'Confirmado',           sub: 'El transportista aceptó tu solicitud' },
  { estado: 'pagado',     label: 'Pagado',               sub: 'Pago confirmado, listo para iniciar' },
  { estado: 'en_camino',  label: 'En camino al origen',  sub: 'El transportista va hacia el origen' },
  { estado: 'recogido',   label: 'Carga recogida',       sub: 'Tu carga fue recogida' },
  { estado: 'entregado',  label: 'Entregado',            sub: 'Tu carga llegó al destino' },
];

const ORDEN_ESTADO = {
  pendiente: 0, aceptada: 1, pagado: 2,
  en_camino: 3, recogido: 4, entregado: 5, finalizado: 5,
};

// Altura base del modal en desktop (px exactos porque Leaflet los necesita)
const MODAL_H_DESKTOP = 620;
const FOOTER_H = 56;

function ModalDetalleFlete({ solicitud, onClose, onAbrirCalificacion }) {
  const estadoInfo  = getEstadoInfo(solicitud.estado);
  const pasoActual  = ORDEN_ESTADO[solicitud.estado] ?? 0;
  const tieneFooter = solicitud.estado === 'entregado';
  const tienePrecio = solicitud.precioAcordado !== null && solicitud.precioAcordado !== undefined;

  const iniciales = (solicitud.nombreTransportista || 'T')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const modal = (
    // Backdrop — mobile-first: sin padding en mobile (modal full screen),
    // padding y centrado en sm+ (modal flotante)
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[999999] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      {/* Contenedor modal:
          - mobile: full screen (w-full h-full), sin bordes redondeados
          - sm+: tamaño fijo centrado con bordes redondeados */}
      <div
        className="relative bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:max-w-4xl flex flex-col overflow-hidden shadow-2xl"
        style={{
          // En desktop forzamos altura en px (Leaflet la necesita exacta).
          // En mobile dejamos que tome 100% del viewport via las clases h-full arriba.
          height: window.innerWidth >= 640 ? `${MODAL_H_DESKTOP}px` : undefined,
          maxHeight: window.innerWidth >= 640 ? 'calc(100vh - 40px)' : '100%',
        }}
      >

        {/* Botón cerrar — flotante arriba a la derecha de todo el modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-[2000] w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg"
        >
          <IconX />
        </button>

        {/* ── Cuerpo: panel izq + mapa ──
            mobile-first: columna (panel arriba, mapa abajo, scrollable)
            sm+: fila (panel a la izq, mapa a la derecha) */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">

          {/* Panel izquierdo */}
          <div className="w-full sm:w-72 shrink-0 flex flex-col border-b sm:border-b-0 sm:border-r border-slate-200 overflow-y-auto bg-white max-h-[45vh] sm:max-h-none">

            {/* Avatar + nombre */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 pr-14 border-b border-slate-100 shrink-0">
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-base shrink-0">
                {iniciales}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{solicitud.nombreTransportista}</p>
                <p className="text-xs text-slate-400 capitalize">{solicitud.tipoVehiculo}</p>
              </div>
            </div>

            {/* Precio acordado — solo si existe */}
            {tienePrecio && (
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <span className="text-xs font-semibold text-slate-500">Precio acordado</span>
                <span className="text-base font-black text-slate-900">
                  L. {Number(solicitud.precioAcordado).toLocaleString('es-HN')}
                </span>
              </div>
            )}

            {/* Timeline */}
            <div className="px-4 sm:px-5 py-4 flex-1">
              {PASOS_VIAJE.map((paso, idx) => {
                const completado = idx < pasoActual;
                const activo     = idx === pasoActual;
                const esUltimo   = idx === PASOS_VIAJE.length - 1;
                return (
                  <div key={paso.estado} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        completado ? 'bg-green-500 border-green-500 text-white'
                        : activo   ? 'bg-black border-black text-white'
                        :            'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {completado ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      {!esUltimo && (
                        <div
                          className={`w-0.5 my-0.5 flex-1 ${completado ? 'bg-green-400' : 'bg-slate-200'}`}
                          style={{ minHeight: '18px' }}
                        />
                      )}
                    </div>
                    <div className="pb-3 pt-0.5 min-w-0">
                      <p className={`text-[13px] font-bold leading-tight ${
                        activo ? 'text-slate-900' : completado ? 'text-green-700' : 'text-slate-400'
                      }`}>
                        {paso.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${
                        activo ? 'text-slate-600' : completado ? 'text-green-600' : 'text-slate-300'
                      }`}>
                        {paso.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info flete */}
            <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 space-y-2 shrink-0">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-green-600 mt-0.5"><IconPin /></span>
                <div className="min-w-0">
                  <span className="text-slate-400 mr-1">Origen</span>
                  <span className="text-slate-800 font-medium break-words">{solicitud.origen?.direccion}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-red-500 mt-0.5"><IconPin /></span>
                <div className="min-w-0">
                  <span className="text-slate-400 mr-1">Destino</span>
                  <span className="text-slate-800 font-medium break-words">{solicitud.destino?.direccion}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-slate-500 mt-0.5"><IconBox /></span>
                <div className="min-w-0">
                  <span className="text-slate-400 mr-1">Carga</span>
                  <span className="text-slate-800 font-medium">{solicitud.descripcionCarga}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-slate-500 mt-0.5"><IconRuler /></span>
                <div className="min-w-0">
                  <span className="text-slate-400 mr-1">Distancia</span>
                  <span className="text-slate-800 font-medium">{solicitud.distanciaKm} km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho: mapa — en mobile toma el resto del alto disponible (flex-1) */}
          <div className="flex-1 relative min-h-[260px] sm:min-h-0 overflow-hidden">

            {/* Overlay estado — desplazado para no chocar con controles +/- de Leaflet */}
            <div className="absolute top-3 left-14 right-3 z-[1000] pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-4 py-3">
                <p className={`text-sm font-black ${estadoInfo.textColor}`}>
                  {estadoInfo.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{estadoInfo.descripcion}</p>
              </div>
            </div>

            {/* Mapa — llena el panel con absolute inset-0 */}
            <div className="absolute inset-0">
              <MapaRuta
                origen={solicitud.origen}
                destino={solicitud.destino}
                height="100%"
                soloMapa
              />
            </div>
          </div>
        </div>

        {/* Footer calificación */}
        {tieneFooter && (
          <div className="shrink-0 px-4 sm:px-5 py-3 border-t border-slate-200 bg-green-50">
            <button
              onClick={() => onAbrirCalificacion(solicitud)}
              className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all text-sm"
            >
              Confirmar entrega y Calificar Servicio
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const portalTarget = document.getElementById('modal-root') || document.body;
  return createPortal(modal, portalTarget);
}

export default ModalDetalleFlete;