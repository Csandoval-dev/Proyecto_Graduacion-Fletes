// src/pages/DashboardCliente/components/ModalSolicitud.jsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import MapSelector from '../../../components/MapSelector';

const IconX = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconMap = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function ModalSolicitud({ isOpen, onClose, transportista, usuario, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState(1); // 1: origen, 2: destino, 3: detalles
  
  const [origen, setOrigen] = useState(null);
  const [origenTexto, setOrigenTexto] = useState('');
  
  const [destino, setDestino] = useState(null);
  const [destinoTexto, setDestinoTexto] = useState('');
  
  const [descripcionCarga, setDescripcionCarga] = useState('');
  const [fechaSolicitada, setFechaSolicitada] = useState('');

  if (!isOpen) return null;

  // Calcular distancia aproximada entre dos puntos (fórmula Haversine simplificada)
  const calcularDistancia = (origen, destino) => {
    if (!origen || !destino) return 0;
    const R = 6371; // Radio de la Tierra en km
    const dLat = (destino.lat - origen.lat) * Math.PI / 180;
    const dLon = (destino.lng - origen.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origen.lat * Math.PI / 180) * Math.cos(destino.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCrearSolicitud = async () => {
    if (!origenTexto || !destinoTexto || !descripcionCarga || !fechaSolicitada) {
      alert('⚠️ Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);

      const distanciaKm = origen && destino ? calcularDistancia(origen, destino) : 0;

      // Crear objeto de origen con dirección y coordenadas (si existen)
      const origenData = {
        direccion: origenTexto,
        ...(origen && { lat: origen.lat, lng: origen.lng })
      };

      // Crear objeto de destino con dirección y coordenadas (si existen)
      const destinoData = {
        direccion: destinoTexto,
        ...(destino && { lat: destino.lat, lng: destino.lng })
      };

    // 1. Crear solicitud con el ID correcto
const solicitudRef = await addDoc(collection(db, 'solicitudes'), {
  usuarioId: usuario.uid,
  nombreUsuario: usuario.nombre,
  // CAMBIO CLAVE: Usamos usuarioId (el UID de Auth) no el ID del documento
  transportistaId: transportista.usuarioId, 
  nombreTransportista: transportista.nombre,
  origen: origenData,
  destino: destinoData,
  distanciaKm: parseFloat(distanciaKm.toFixed(2)),
  descripcionCarga,
  tipoVehiculo: transportista?.vehiculo?.tipo || 'No especificado',
  fechaSolicitada: new Date(fechaSolicitada),
  estado: 'pendiente',
  createdAt: serverTimestamp()
});

// 2. Crear conversación usando los mismos UIDs
await addDoc(collection(db, 'conversaciones'), {
  solicitudId: solicitudRef.id,
  // CAMBIO CLAVE: Los participantes deben ser UIDs de Authentication
  participantes: [usuario.uid, transportista.usuarioId],
  nombreCliente: usuario.nombre,
  nombreTransportista: transportista.nombre,
  ultimoMensaje: `Nueva solicitud de flete: ${descripcionCarga.substring(0, 50)}...`,
  ultimoMensajeTimestamp: serverTimestamp(),
  createdAt: serverTimestamp()
});

      alert('✅ Solicitud enviada correctamente');
      onSuccess && onSuccess(solicitudRef.id);
      onClose();
      
      // Resetear formulario
      setOrigen(null);
      setOrigenTexto('');
      setDestino(null);
      setDestinoTexto('');
      setDescripcionCarga('');
      setFechaSolicitada('');
      setPaso(1);
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      alert('❌ Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleSiguiente = () => {
    if (paso === 1 && !origenTexto.trim()) {
      alert('⚠️ Escribe la dirección de origen');
      return;
    }
    if (paso === 2 && !destinoTexto.trim()) {
      alert('⚠️ Escribe la dirección de destino');
      return;
    }
    setPaso(paso + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Solicitar Flete</h2>
            <p className="text-slate-600 text-sm mt-1">
              A: <span className="font-bold">{transportista?.nombre}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <IconX />
          </button>
        </div>

        {/* Indicador de pasos */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  paso >= num ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-colors ${
                    paso > num ? 'bg-black' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-600 mb-6">
            <span>Origen</span>
            <span>Destino</span>
            <span>Detalles</span>
          </div>
        </div>

        {/* Contenido según el paso */}
        <div className="p-6">
          
          {/* PASO 1: Seleccionar Origen */}
          {paso === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <IconMap />
                <h3 className="text-lg font-bold text-slate-900">¿Dónde recogerán la carga?</h3>
              </div>
              <MapSelector 
                position={origen} 
                setPosition={setOrigen}
                direccionTexto={origenTexto}
                setDireccionTexto={setOrigenTexto}
                mostrarMiUbicacion={true}
                height="350px" 
              />
            </div>
          )}

          {/* PASO 2: Seleccionar Destino */}
          {paso === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <IconMap />
                <h3 className="text-lg font-bold text-slate-900">¿A dónde llevarán la carga?</h3>
              </div>
              <MapSelector 
                position={destino} 
                setPosition={setDestino}
                direccionTexto={destinoTexto}
                setDireccionTexto={setDestinoTexto}
                mostrarMiUbicacion={false}
                height="350px" 
              />
            </div>
          )}

          {/* PASO 3: Detalles de la solicitud */}
          {paso === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Detalles del flete</h3>

              {/* Resumen de ubicaciones */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">📍</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-bold">Origen</p>
                    <p className="text-sm text-slate-900">{origenTexto}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">📍</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-bold">Destino</p>
                    <p className="text-sm text-slate-900">{destinoTexto}</p>
                  </div>
                </div>
                {origen && destino && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500 font-bold">Distancia aproximada</p>
                    <p className="text-lg font-black text-slate-900">
                      {calcularDistancia(origen, destino).toFixed(2)} km
                    </p>
                  </div>
                )}
              </div>

              {/* Descripción de la carga */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Descripción de la carga *
                </label>
                <textarea
                  value={descripcionCarga}
                  onChange={(e) => setDescripcionCarga(e.target.value)}
                  placeholder="Ej: Refrigerador grande, requiere 2 personas para cargarlo"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  rows="4"
                />
              </div>

              {/* Fecha deseada */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Fecha y hora deseada *
                </label>
                <input
                  type="datetime-local"
                  value={fechaSolicitada}
                  onChange={(e) => setFechaSolicitada(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Info del vehículo del transportista */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Vehículo del transportista
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {transportista?.vehiculo?.tipo?.toUpperCase() || 'No especificado'} - {transportista?.vehiculo?.marca} {transportista?.vehiculo?.modelo}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Capacidad: {transportista?.vehiculo?.capacidadKg} kg
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-4">
          {paso > 1 && (
            <button
              onClick={() => setPaso(paso - 1)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              ← Atrás
            </button>
          )}
          
          {paso < 3 ? (
            <button
              onClick={handleSiguiente}
              className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleCrearSolicitud}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Enviando...' : '📤 Enviar Solicitud'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalSolicitud;