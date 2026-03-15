
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix íconos Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícono personalizado para origen 
const iconoOrigen = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ícono personalizado para destino 
const iconoDestino = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para ajustar el viewport del mapa
function AjustarVista({ origen, destino }) {
  const map = useMap();
  
  useEffect(() => {
    if (origen?.lat && destino?.lat) {
      const bounds = L.latLngBounds(
        [origen.lat, origen.lng],
        [destino.lat, destino.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origen, destino, map]);
  
  return null;
}

function MapaRuta({ origen, destino, height = "400px" }) {
  // Si no hay coordenadas, usar las direcciones como centro aproximado
  const origenPos = origen?.lat && origen?.lng 
    ? [origen.lat, origen.lng] 
    : [15.5050, -88.0250]; // San Pedro Sula por defecto

  const destinoPos = destino?.lat && destino?.lng 
    ? [destino.lat, destino.lng] 
    : [15.5050, -88.0250];

  const hayCoordenadasCompletas = origen?.lat && destino?.lat;

  return (
    <div className="space-y-3">
      {/* Info de direcciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl"></span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-green-700 uppercase mb-1">Origen</p>
              <p className="text-sm text-green-900 break-words">{origen?.direccion || 'No especificado'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl"></span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-red-700 uppercase mb-1">Destino</p>
              <p className="text-sm text-red-900 break-words">{destino?.direccion || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="rounded-lg overflow-hidden border-2 border-slate-300">
        <MapContainer
          center={origenPos}
          zoom={13}
          style={{ height: height, width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marcadores */}
          {hayCoordenadasCompletas && (
            <>
              <Marker position={origenPos} icon={iconoOrigen} />
              <Marker position={destinoPos} icon={iconoDestino} />
              
              {/* Línea de ruta */}
              <Polyline 
                positions={[origenPos, destinoPos]} 
                color="#000000"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
              />
              
              <AjustarVista origen={origen} destino={destino} />
            </>
          )}
        </MapContainer>
      </div>

      {!hayCoordenadasCompletas && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ℹ️ Las coordenadas exactas no están disponibles. Solo se muestran las direcciones.
          </p>
        </div>
      )}
    </div>
  );
}

export default MapaRuta;