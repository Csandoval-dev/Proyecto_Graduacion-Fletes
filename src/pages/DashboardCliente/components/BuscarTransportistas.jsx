import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// ICONOS 
const IconStar = ({ filled }) => (
  <svg className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IconTruck = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconPhone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconFilter = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

function BuscarTransportistas({ usuario }) {
  const [transportistas, setTransportistas] = useState([]);
  const [transportistasFiltrados, setTransportistasFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransportista, setSelectedTransportista] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroZona, setFiltroZona] = useState("todas");
  const [filtroVehiculo, setFiltroVehiculo] = useState("todos");
  const [filtroCalificacion, setFiltroCalificacion] = useState(0);
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  useEffect(() => {
    cargarTransportistas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [transportistas, searchTerm, filtroZona, filtroVehiculo, filtroCalificacion, soloDisponibles]);

  const cargarTransportistas = async () => {
    try {
      setLoading(true);
      
      // Obtener transportistas verificados desde firestore
      const q = query(
        collection(db, "transportistas"),
        where("verificado", "==", true)
      );
      
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTransportistas(lista);
    } catch (error) {
      console.error("Error al cargar transportistas:", error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...transportistas];

    // Filtro de búsqueda por nombre
    if (searchTerm) {
      resultado = resultado.filter(t => 
        t.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por zona
    if (filtroZona !== "todas") {
      resultado = resultado.filter(t => t.zona === filtroZona);
    }

    // Filtro por tipo de vehículo
    if (filtroVehiculo !== "todos") {
      resultado = resultado.filter(t => t.vehiculo?.tipo === filtroVehiculo);
    }

    // Filtro por calificación mínima
    if (filtroCalificacion > 0) {
      resultado = resultado.filter(t => 
        (t.calificacionPromedio || 0) >= filtroCalificacion
      );
    }

    // Filtro solo disponibles
    if (soloDisponibles) {
      resultado = resultado.filter(t => t.disponible === true);
    }

    setTransportistasFiltrados(resultado);
  };

  // Obtener zonas únicas
  const zonasUnicas = [...new Set(transportistas.map(t => t.zona).filter(Boolean))];

  // Obtener tipos de vehículos únicos
  const tiposVehiculo = [...new Set(transportistas.map(t => t.vehiculo?.tipo).filter(Boolean))];

  const abrirPerfil = (transportista) => {
    setSelectedTransportista(transportista);
  };

  const cerrarPerfil = () => {
    setSelectedTransportista(null);
  };

  const contactarTransportista = (transportista) => {
    // la lógica para abrir el chat aun en desarrollo
    alert(`Próximamente: Chat con ${transportista.nombre}`);
    cerrarPerfil();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-700 font-bold">Cargando transportistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* FILTROS  */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <IconFilter />
          <h3 className="font-bold text-slate-900">Filtros de Búsqueda</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda por nombre */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Buscar por nombre
            </label>
            <input
              type="text"
              placeholder="Ej: Roberto Gomez"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
          </div>

          {/* Filtro zona */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Zona
            </label>
            <select
              value={filtroZona}
              onChange={(e) => setFiltroZona(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="todas">Todas las zonas</option>
              {zonasUnicas.map(zona => (
                <option key={zona} value={zona}>{zona}</option>
              ))}
            </select>
          </div>

          {/* Filtro vehículo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Vehículo
            </label>
            <select
              value={filtroVehiculo}
              onChange={(e) => setFiltroVehiculo(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="todos">Todos</option>
              {tiposVehiculo.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Filtro calificación */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Calificación mínima
            </label>
            <select
              value={filtroCalificacion}
              onChange={(e) => setFiltroCalificacion(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              <option value="0">Todas</option>
              <option value="4">4+ estrellas</option>
              <option value="4.5">4.5+ estrellas</option>
            </select>
          </div>
        </div>

        {/* Toggle solo disponibles */}
        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="disponibles"
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
            className="w-4 h-4 text-black border-slate-300 rounded focus:ring-black"
          />
          <label htmlFor="disponibles" className="text-sm font-medium text-slate-700">
            Mostrar solo disponibles
          </label>
        </div>
      </div>

      {/* GRID DE TRANSPORTISTAS  */}
      {transportistasFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconTruck />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No se encontraron transportistas</h3>
          <p className="text-slate-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transportistasFiltrados.map((transportista) => (
            <div
              key={transportista.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Header de la card */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">
                      {transportista.nombre}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                       {transportista.zona}
                    </p>
                  </div>
                  
                  {/* Badge verificado */}
                  {transportista.verificado && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <IconCheck /> Verificado
                    </div>
                  )}
                </div>

                {/* Calificación */}
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconStar 
                        key={star} 
                        filled={star <= (transportista.calificacionPromedio || 0)} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {(transportista.calificacionPromedio || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({transportista.totalCalificaciones || 0})
                  </span>
                </div>
              </div>

              {/* Info del vehículo */}
              <div className="p-5 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  {/* Foto del vehículo o Icono */}
                  <div className="bg-white w-12 h-12 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
           {transportista.vehiculo?.fotos && transportista.vehiculo.fotos.length > 0 ? (
         <img 
      src={transportista.vehiculo.fotos[0]} 
      alt="Vehículo" 
      className="w-full h-full object-cover"
          />
              ) : (
         <IconTruck />
                   )}
                      </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vehículo</p>
                    <p className="text-sm font-bold text-slate-900">
                      {transportista.vehiculo?.tipo || "No especificado"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Marca</p>
                    <p className="font-bold text-slate-900">
                      {transportista.vehiculo?.marca || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Capacidad</p>
                    <p className="font-bold text-slate-900">
                      {transportista.vehiculo?.capacidadKg || "N/A"} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer con botones */}
              <div className="p-5 flex gap-3">
                <button
                  onClick={() => abrirPerfil(transportista)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-all text-sm"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={() => contactarTransportista(transportista)}
                  className="flex-1 px-4 py-2.5 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-all text-sm"
                  disabled={!transportista.disponible}
                >
                  {transportista.disponible ? "Contactar" : "No disponible"}
                </button>
              </div>

              {/* Indicador de disponibilidad */}
              <div className={`h-1 ${transportista.disponible ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PERFIL DETALLADO  */}
      {selectedTransportista && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {selectedTransportista.nombre}
                </h2>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                   {selectedTransportista.zona}
                </p>
              </div>
              <button
                onClick={cerrarPerfil}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IconX />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              
              {/* Calificación destacada */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-sm font-bold text-yellow-800 uppercase tracking-wider mb-2">
                  Calificación Promedio
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl font-black text-yellow-600">
                    {(selectedTransportista.calificacionPromedio || 0).toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconStar 
                          key={star} 
                          filled={star <= (selectedTransportista.calificacionPromedio || 0)} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-600">
                      {selectedTransportista.totalCalificaciones || 0} reseñas
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {selectedTransportista.serviciosCompletados || 0} servicios completados
                </p>
              </div>

              {/* Foto Principal del Vehículo */}
              {selectedTransportista.vehiculo?.fotoURL && (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img 
                    src={selectedTransportista.vehiculo.fotoURL} 
                    alt="Vehículo" 
                    className="w-full h-72 object-cover"
                  />
                </div>
              )}

              {/* Descripción */}
              {selectedTransportista.descripcion && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Acerca de</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedTransportista.descripcion}
                  </p>
                </div>
              )}

              {/* Información del vehículo */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Detalles del Vehículo</h3>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tipo</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedTransportista.vehiculo?.tipo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Marca</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedTransportista.vehiculo?.marca}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Modelo</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedTransportista.vehiculo?.modelo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Año</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedTransportista.vehiculo?.anio}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placa</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedTransportista.vehiculo?.placa}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capacidad</p>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedTransportista.vehiculo?.capacidadKg} kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de contacto  */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <IconMail />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Email</p>
                      <p className="font-bold text-slate-900">{selectedTransportista.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de contacto grande */}
              <button
                onClick={() => contactarTransportista(selectedTransportista)}
                className="w-full px-6 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all text-lg shadow-lg"
                disabled={!selectedTransportista.disponible}
              >
                {selectedTransportista.disponible 
                  ? "Iniciar Conversación" 
                  : "No disponible actualmente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuscarTransportistas;