// src/components/MapSelector.jsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para el icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente interno para capturar clicks en el mapa
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function MapSelector({ position, setPosition, direccionTexto, setDireccionTexto, height = "400px", mostrarMiUbicacion = true }) {
  const defaultCenter = [15.5050, -88.0250]; // San Pedro Sula
  const [center, setCenter] = useState(defaultCenter);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (position) {
      setCenter([position.lat, position.lng]);
    }
  }, [position]);

  const handlePositionChange = async (latlng) => {
    // Marcar en el mapa inmediatamente
    setPosition({
      lat: latlng.lat,
      lng: latlng.lng
    });

    // Obtener nombre de la dirección (reverse geocoding)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${latlng.lat}&lon=${latlng.lng}&` +
        `addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      const data = await response.json();
      
      if (data.display_name) {
        setDireccionTexto(data.display_name);
      } else {
        // Si no encuentra nombre, usar coordenadas
        setDireccionTexto(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      // Si falla, usar coordenadas
      setDireccionTexto(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    }
  };

  // Buscar direcciones con Nominatim
  const buscarDirecciones = async (texto) => {
    if (texto.length < 3) {
      setSugerencias([]);
      setMostrarSugerencias(false);
      return;
    }

    try {
      setBuscando(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(texto)}&` +
        `countrycodes=hn&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      
      const data = await response.json();
      setSugerencias(data);
      setMostrarSugerencias(data.length > 0);
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      setSugerencias([]);
      setMostrarSugerencias(false);
    } finally {
      setBuscando(false);
    }
  };

  const handleDireccionChange = (e) => {
    const texto = e.target.value;
    setDireccionTexto(texto);
    
    // Buscar después de 500ms de dejar de escribir
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      buscarDirecciones(texto);
    }, 500);
  };

  const seleccionarSugerencia = (sugerencia) => {
    const direccion = sugerencia.display_name;
    setDireccionTexto(direccion);
    setPosition({
      lat: parseFloat(sugerencia.lat),
      lng: parseFloat(sugerencia.lon)
    });
    setCenter([parseFloat(sugerencia.lat), parseFloat(sugerencia.lon)]);
    setMostrarSugerencias(false);
    setSugerencias([]);
  };

  // Obtener ubicación actual del navegador
  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      alert('❌ Tu navegador no soporta geolocalización');
      return;
    }

    setObteniendoUbicacion(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // Marcar en el mapa
        setPosition({
          lat: latitude,
          lng: longitude
        });
        setCenter([latitude, longitude]);

        // Obtener nombre de la dirección (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `format=json&lat=${latitude}&lon=${longitude}&` +
            `addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'es'
              }
            }
          );
          const data = await response.json();
          setDireccionTexto(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch (error) {
          console.error('Error al obtener dirección:', error);
          setDireccionTexto(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        
        setObteniendoUbicacion(false);
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        alert('❌ No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        setObteniendoUbicacion(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-3">
      {/* Input para escribir dirección con autocompletado */}
      <div className="relative z-30">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-slate-700">
            Escribe la dirección
          </label>
          {mostrarMiUbicacion && (
            <button
              type="button"
              onClick={obtenerUbicacionActual}
              disabled={obteniendoUbicacion}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
              {obteniendoUbicacion ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                  Obteniendo...
                </>
              ) : (
                <>
                  📍 Mi ubicación
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={direccionTexto || ''}
            onChange={handleDireccionChange}
            onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
            placeholder="Ej: Barrio El Centro, San Pedro Sula"
            className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          
          {buscando && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-slate-600"></div>
            </div>
          )}

          {/* Dropdown de sugerencias - MEJORADO */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <>
              {/* Overlay para cerrar al hacer click fuera */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMostrarSugerencias(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                {sugerencias.map((sug, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => seleccionarSugerencia(sug)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">📍</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">
                          {sug.display_name}
                        </p>
                        {sug.address && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sug.address.city || sug.address.town || sug.address.county}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="relative z-0">
        <p className="text-sm text-slate-600 mb-2">
          O selecciona la ubicación en el mapa
        </p>
        <div className="rounded-lg overflow-hidden border-2 border-slate-300">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: height, width: '100%', position: 'relative', zIndex: 0 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={position ? [position.lat, position.lng] : null} 
              setPosition={handlePositionChange} 
            />
          </MapContainer>
        </div>
        {position && (
          <p className="text-xs text-slate-500 mt-2">
            ✓ Ubicación seleccionada: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}

export default MapSelector;