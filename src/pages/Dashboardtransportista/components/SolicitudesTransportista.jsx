import { useState, useEffect } from 'react';
import {
  collection, query, where, doc, updateDoc,
  orderBy, arrayUnion, onSnapshot
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import ChatTransportista from './ChatTransportista';
import MapaRuta from '../../../components/MapaRuta';
import { getEstadoInfo } from '../../../constants/estadosFlete';

// Colores y estilos para estados 
const ESTADO_HEX = {
  pendiente:  { dot: '#f59e0b', bg: '#fffbeb', text: '#92400e', border: '#fde68a', strip: '#f59e0b' },
  aceptada:   { dot: '#3b82f6', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', strip: '#3b82f6' },
  pagado:     { dot: '#10b981', bg: '#f0fdf4', text: '#065f46', border: '#a7f3d0', strip: '#10b981' },
  en_camino:  { dot: '#8b5cf6', bg: '#f5f3ff', text: '#4c1d95', border: '#ddd6fe', strip: '#8b5cf6' },
  recogido:   { dot: '#f97316', bg: '#fff7ed', text: '#9a3412', border: '#fed7aa', strip: '#f97316' },
  entregado:  { dot: '#06b6d4', bg: '#ecfeff', text: '#164e63', border: '#a5f3fc', strip: '#06b6d4' },
  finalizado: { dot: '#9ca3af', bg: '#f9fafb', text: '#374151', border: '#e5e7eb', strip: '#9ca3af' },
  cancelado:  { dot: '#ef4444', bg: '#fef2f2', text: '#991b1b', border: '#fecaca', strip: '#ef4444' },
};
//Colores para baners informativos
const BANNER_HEX = {
  yellow: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', bar: '#f59e0b' },
  blue:   { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', bar: '#3b82f6' },
  green:  { bg: '#f0fdf4', border: '#6ee7b7', text: '#065f46', bar: '#10b981' },
  purple: { bg: '#f5f3ff', border: '#c4b5fd', text: '#4c1d95', bar: '#8b5cf6' },
  orange: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', bar: '#f97316' },
  gray:   { bg: '#f9fafb', border: '#e5e7eb', text: '#374151', bar: '#9ca3af' },
  red:    { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', bar: '#ef4444' },
};
// Componente para mostrar el estado del flete y su descripcion en un badge, y un banner informativo con detalles adicionales.
function EstadoBadge({ estado }) {
  const info = getEstadoInfo(estado);
  const h    = ESTADO_HEX[estado] || ESTADO_HEX.finalizado;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap flex-shrink-0"
      style={{ background: h.bg, color: h.text, border: `1.5px solid ${h.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: h.dot, boxShadow: `0 0 0 2px ${h.dot}33` }}
      />
      {info.label}
    </span>
  );
}
// Banner informativo que muestra el estado actual del flete con un mensaje descriptivo y recomendaciones para el transportista.
function BannerEstado({ estado, title, children }) {
  const info = getEstadoInfo(estado);
  const c    = BANNER_HEX[info.color] || BANNER_HEX.gray;
  return (
    <div
      className="rounded-xl p-4 leading-relaxed"
      style={{
        background:  c.bg,
        border:      `1px solid ${c.border}`,
        borderLeft:  `4px solid ${c.bar}`,
        color:       c.text,
      }}
    >
      {title && <p className="font-bold text-[13px] mb-1 m-0">{title}</p>}
      <p className="m-0 text-xs opacity-80">{children}</p>
    </div>
  );
}
//Tarjeta para mostrar estadisticas clave del flete ,  como distancia, fecaha y descripcion breve.
function StatCard({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
      <p className="m-0 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="m-0 text-sm font-bold text-slate-900 capitalize">{value}</p>
    </div>
  );
}
//Componenete pirncipal que muestra la lista de solicitudes del transportista,
function SolicitudesTransportista({ usuario }) {
  const [solicitudes, setSolicitudes]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [vistaChat, setVistaChat]       = useState(false);

  //Funcion para obtener solicitudes del trasnportista en tiempo real, ordenadas por fecha de creacion y actualizando la solicitud seleccionada si esta cambia de estado.
  useEffect(() => {
    if (!usuario?.uid) return;
    setLoading(true);
    const q = query(
      collection(db, 'solicitudes'),
      where('transportistaId', '==', usuario.uid),
      orderBy('createdAt', 'desc')
    );
    //Escucha en tiempo real los cambios en las solicitudes del transportista y actualiza la lista y a solicitud seleccionada si esta cambia de estado.
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSolicitudes(lista);
      setLoading(false);
      setSeleccionada(prev => prev ? lista.find(s => s.id === prev.id) || prev : null);
    }, (err) => {
      console.error('Error:', err);
      setLoading(false);
    });
    return () => unsub();
  }, [usuario]);

  //Funcion para cambiar el estado de una solicitud actualizado la base de datos y agreando una entrada al historial de estados de la solicitud con la descripcion del nuevo estado.
  const cambiarEstado = async (solicitudId, nuevoEstado, textoConfirm) => {
    if (!confirm(`${textoConfirm}?`)) return;
    try {
      const infoNuevo = getEstadoInfo(nuevoEstado); // solo para descripción del historial
      await updateDoc(doc(db, 'solicitudes', solicitudId), {
        estado: nuevoEstado,
        historial: arrayUnion({
          estado: nuevoEstado,
          fecha: new Date(),
          descripcion: infoNuevo.descripcion,
        }),
      });
    } catch (err) {
      console.error('Error:', err);
      alert('Error al cambiar estado');
    }
  };
// Varibales derivadas para facilita la lectura y el manejo de solicitudes y sus eatdos, como la solicitud seleccionada,
  const sol             = seleccionada
    ? (solicitudes.find(s => s.id === seleccionada.id) || seleccionada)
    : null;
  const estadoInfo      = sol ? getEstadoInfo(sol.estado) : null;
  const siguienteEstado = estadoInfo?.siguienteEstado;
  const esperandoPago   = sol?.oferta?.estado === 'pendiente_cliente';

  //  Variable clara con la acción del transportista
  const accionTransportista = estadoInfo?.accionTransportista;

  //  mostrarBoton respeta accionTransportista null  
  const mostrarBoton =
    !!siguienteEstado &&
    !!accionTransportista &&
    sol?.estado !== 'entregado'; // entregado le toca al cliente

  //  puedeAccionar cubre todos los estados correctamente
  const puedeAccionar = () => {
    if (!sol) return false;
    if (sol.estado === 'pendiente') return true;
    if (sol.estado === 'aceptada')  return false; // espera que el cliente pague
    if (sol.estado === 'pagado')    return sol.pagado === true;
    if (sol.estado === 'entregado') return false; // solo el cliente confirma
    return !!accionTransportista;  // en_camino, recogido → true si tienen acción
  };
//FUncion para renderizar el banner informativo basado en el estado actual de la solicitud seleccionada, mostrando un mensaje descriptivo y recomendacion para el transportista.
  const renderBanner = () => {
    if (!sol) return null;
    const banners = {
      pendiente: { title: 'Solicitud pendiente',        msg: 'Acepta la solicitud para iniciar la negociación con el cliente.' },
      aceptada:  {
        title: esperandoPago ? 'Esperando pago del cliente' : 'Solicitud aceptada',
        msg:   esperandoPago
          ? `Oferta enviada: L. ${sol.oferta?.monto} — esperando que el cliente confirme el pago.`
          : 'Usa el chat para enviarle tu oferta de precio al cliente.',
      },
      pagado: sol?.pagado ? {
        title: 'Pago confirmado — puedes iniciar el servicio',
        msg:   sol.oferta?.desglose
          ? `Recibirás: L. ${sol.oferta.desglose.pagoTransportista}`
          : `Monto: L. ${sol.pago?.montoPagado || sol.precioAcordado || '—'}`,
      } : null,
      en_camino:  { title: 'En camino',             msg: 'Dirígete al punto de origen para recoger la carga.' },
      recogido:   { title: 'Carga recogida',         msg: 'Lleva la carga al destino y márcala como entregada.' },
      entregado:  { title: 'Esperando confirmación', msg: 'El cliente debe confirmar la entrega y calificar el servicio para finalizar.' },
      finalizado: { title: 'Servicio finalizado',    msg: 'Este flete ha sido completado exitosamente.' },
    };
    const b = banners[sol.estado];
    if (!b) return null;
    return <BannerEstado estado={sol.estado} title={b.title}>{b.msg}</BannerEstado>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-orange-100 border-t-orange-600"
          style={{ animation: 'spin .75s linear infinite' }}
        />
        <span className="text-sm text-slate-400 font-medium">Cargando solicitudes…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
//Renderizado principal del componenete, mostrando la lista de solicitudes del tranportista en una barra lateral
  return (
    <div className="flex flex-col h-full">
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .ft-fadein { animation: fadeUp .2s ease both; }

        .ft-list-btn {
          all: unset;
          display: block;
          width: 100%;
          cursor: pointer;
          border-bottom: 1px solid #f1f5f9;
          box-sizing: border-box;
        }
        .ft-list-btn:hover .ft-list-inner     { background-color: #fff7ed; }
        .ft-list-btn.ft-active .ft-list-inner { background-color: #fff7ed; }

        .ft-btn-main {
          flex: 1;
          padding: 13px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          text-align: center;
          cursor: pointer;
          border: 1.5px solid #0f172a;
          background: #0f172a;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: background .15s, box-shadow .15s;
          white-space: nowrap;
        }
        .ft-btn-main:hover:not(:disabled) {
          background: #1e293b;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }
        .ft-btn-main:disabled {
          background: #e2e8f0 !important;
          color: #94a3b8 !important;
          border-color: #e2e8f0 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        .ft-btn-chat {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1.5px solid #0f172a;
          background: #0f172a;
          font-weight: 700;
          font-size: 14px;
          color: #ffffff;
          cursor: pointer;
          transition: all .15s;
          white-space: nowrap;
        }
        .ft-btn-chat:hover {
          background: #1e293b;
        }

        /* Botones fijos — cuando solo hay chat, ocupa todo */
        .ft-btns { flex-wrap: nowrap; }
        .ft-btns:has(> :only-child) .ft-btn-chat { flex: 1; }

        /* Modal chat */
        .ft-chat-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          backdrop-filter: blur(2px);
        }
        .ft-chat-modal {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 500px;
          height: 560px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
          .ft-layout  { flex-direction: column !important; height: auto !important; }
          .ft-sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid #e9edf2; max-height: 260px; overflow-y: auto; }
          .ft-panel   { min-height: 60vh; }
          .ft-stats   { grid-template-columns: repeat(2,1fr) !important; }
          .ft-btns    { flex-direction: column !important; }
          .ft-btn-main, .ft-btn-chat { flex: unset !important; width: 100% !important; }
          .ft-chat-overlay { padding: 0; align-items: flex-end; }
          .ft-chat-modal   { max-width: 100%; height: 72vh; border-radius: 16px 16px 0 0; }
        }
      `}</style>

      {/* ── MODAL CHAT ── */}
      {vistaChat && sol && (
        <div className="ft-chat-overlay" onClick={() => setVistaChat(false)}>
          <div className="ft-chat-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                style={{ background: '#fff4ed', border: '1.5px solid #fed7aa', color: '#ea580c' }}
              >
                {(sol.nombreUsuario || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-slate-900 truncate capitalize">{sol.nombreUsuario}</p>
                <p className="m-0 text-[11px] text-slate-400 truncate">{sol.descripcionCarga}</p>
              </div>
              <button
                onClick={() => setVistaChat(false)}
                style={{
                  border: 'none', background: '#f1f5f9', borderRadius: 8,
                  width: 28, height: 28, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="13" height="13" fill="none" stroke="#64748b" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatTransportista
                solicitud={sol}
                usuario={usuario}
                onClose={() => setVistaChat(false)}
                embebido={true}
              />
            </div>
          </div>
        </div>
      )}

      <div
        className="ft-layout flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
        style={{ height: '100%', minHeight: 0, flex: 1 }}
      >
        {/* ── SIDEBAR ── */}
        <div
          className="ft-sidebar flex flex-col bg-white border-r border-slate-100 overflow-hidden flex-shrink-0"
          style={{ width: 280 }}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div>
              <p className="m-0 text-[15px] font-bold text-slate-900">Mis Fletes</p>
              <p className="m-0 mt-0.5 text-xs text-slate-400">
                {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0"
              style={{ boxShadow: '0 0 0 3px #d1fae5' }}
            />
          </div>

          {/* Lista — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {solicitudes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 h-full">
                <svg className="w-9 h-9 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 text-sm m-0 font-medium text-center">Sin solicitudes</p>
              </div>
            ) : solicitudes.map(s => {
              const h      = ESTADO_HEX[s.estado] || ESTADO_HEX.finalizado;
              const activo = seleccionada?.id === s.id;
              return (
                <button
                  key={s.id}
                  className={`ft-list-btn${activo ? ' ft-active' : ''}`}
                  onClick={() => { setSeleccionada(s); setVistaChat(false); }}
                >
                  <div className="ft-list-inner flex items-stretch transition-colors duration-100">
                    <div
                      className="flex-shrink-0 transition-colors duration-150"
                      style={{ width: 4, background: activo ? h.strip : h.strip + '30', borderRadius: '0 2px 2px 0' }}
                    />
                    <div className="flex-1 py-4 px-4">
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <span className="font-black text-[14px] text-slate-900 leading-tight truncate capitalize">
                          {s.nombreUsuario}
                        </span>
                        <EstadoBadge estado={s.estado} />
                      </div>
                     
                      <div className="flex items-center gap-2">
                       
                        <span className="text-[11px] text-slate-400">
                          {s.fechaSolicitada?.toDate?.()?.toLocaleDateString('es-HN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PANEL DERECHO ── */}
        {!sol ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-50">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 font-semibold m-0 mb-1">Selecciona un flete</p>
              <p className="text-xs text-slate-300 m-0">Elige una solicitud para ver los detalles</p>
            </div>
          </div>
        ) : (
          <div className="ft-panel ft-fadein flex-1 flex flex-col overflow-hidden bg-slate-50 min-w-0">
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 flex flex-col gap-4">

              {/* Mapa */}
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <MapaRuta origen={sol.origen} destino={sol.destino} height="260px" />
              </div>

              <div className="flex flex-col gap-4">

                {/* Stats */}
                <div className="ft-stats grid grid-cols-3 gap-3">
                  <StatCard label="Distancia"   value={`${sol.distanciaKm} km`} />
                  <StatCard label="Descripción" value={sol.descripcionCarga || '—'} />
                  <StatCard label="Fecha"       value={sol.fechaSolicitada?.toDate?.()?.toLocaleDateString('es-HN') || '—'} />
                </div>

                {/* Banner */}
                {renderBanner()}

                {/* Botones: acción + chat fijos a la par */}
                <div className="ft-btns border-t border-slate-100 pt-3.5 flex gap-2">

                  {mostrarBoton && (
                    <button
                      className="ft-btn-main"
                      onClick={() => cambiarEstado(sol.id, siguienteEstado, accionTransportista)}
                      disabled={!puedeAccionar()}
                    >
                      {accionTransportista}
                    </button>
                  )}

                  <button
                    className="ft-btn-chat"
                    onClick={() => setVistaChat(true)}
                  >
                    Abrir Chat
                  </button>

                </div>

              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SolicitudesTransportista;