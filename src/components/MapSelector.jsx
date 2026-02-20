import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. Componente para MOVER el mapa dinámicamente
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 16); // Zoom más cercano al buscar/detectar
  }, [center, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

function MapSelector({ position, setPosition, direccionTexto, setDireccionTexto, height = "400px", mostrarMiUbicacion = true }) {
  const defaultCenter = [15.5050, -88.0250];
  const [center, setCenter] = useState(defaultCenter);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  
  // Usar una referencia para el timeout y evitar variables globales de window
  const searchTimeoutRef = useRef(null);

  const handlePositionChange = async (latlng) => {
    setPosition({ lat: latlng.lat, lng: latlng.lng });
    // Reverse Geocoding
    obtenerNombreDireccion(latlng.lat, latlng.lng);
  };

  const obtenerNombreDireccion = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
      const data = await response.json();
      setDireccionTexto(data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } catch (e) { console.error(e); }
  };

  const buscarDirecciones = async (texto) => {
    if (texto.length < 3) return;
    setBuscando(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&countrycodes=hn&limit=5`);
      const data = await response.json();
      setSugerencias(data);
      setMostrarSugerencias(true);
    } finally { setBuscando(false); }
  };

  const handleDireccionChange = (e) => {
    const texto = e.target.value;
    setDireccionTexto(texto);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => buscarDirecciones(texto), 600);
  };

  const seleccionarSugerencia = (sug) => {
    const coords = { lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) };
    setDireccionTexto(sug.display_name);
    setPosition(coords);
    setCenter([coords.lat, coords.lng]); // Esto ahora sí moverá el mapa gracias a ChangeView
    setMostrarSugerencias(false);
  };

  return (
    <div className="flex flex-col gap-3 font-sans">
      <div className="relative w-full">
        <div className="flex justify-between items-end mb-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Dirección de entrega</label>
          {mostrarMiUbicacion && (
             <button 
              onClick={() => {
                setObteniendoUbicacion(true);
                navigator.geolocation.getCurrentPosition((p) => {
                  const newPos = { lat: p.coords.latitude, lng: p.coords.longitude };
                  setPosition(newPos);
                  setCenter([newPos.lat, newPos.lng]);
                  obtenerNombreDireccion(newPos.lat, newPos.lng);
                  setObteniendoUbicacion(false);
                }, () => setObteniendoUbicacion(false));
              }}
              className="text-blue-600 text-xs font-semibold hover:underline"
             >
               {obteniendoUbicacion ? "Localizando..." : " Usar mi ubicación actual"}
             </button>
          )}
        </div>

        {/* Input Estilizado */}
        <div className="relative group">
          <input
            type="text"
            value={direccionTexto || ''}
            onChange={handleDireccionChange}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:bg-white transition-all outline-none shadow-sm"
            placeholder="Escribe una calle, barrio o ciudad..."
          />
          
          {/* Sugerencias Modernas */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <ul className="absolute left-0 right-0 top-[110%] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[1000] divide-y divide-slate-50">
              {sugerencias.map((sug, i) => (
                <li 
                  key={i}
                  onClick={() => seleccionarSugerencia(sug)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex gap-3 items-start transition-colors"
                >
                  <span className="text-lg"></span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{sug.display_name.split(',')[0]}</p>
                    <p className="text-xs text-slate-500 truncate">{sug.display_name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: height, width: '100%' }}
        >
          <ChangeView center={center} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position ? [position.lat, position.lng] : null} setPosition={handlePositionChange} />
        </MapContainer>
        
        {/* Overlay indicador de carga */}
        {obteniendoUbicacion && (
          <div className="absolute inset-0 bg-white/60 z-[400] flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg font-bold text-slate-700 animate-bounce">
              Buscando satélites... 🛰️
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapSelector;