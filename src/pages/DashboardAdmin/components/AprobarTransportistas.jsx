// src/pages/DashboardAdmin/components/AprobarTransportistas.jsx
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// Iconos SVG
const IconTruck = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H18a1 1 0 001-1V8a1 1 0 00-1-1h-4z" />
  </svg>
);

const IconDocument = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function AprobarTransportistas() {
  const [transportistas, setTransportistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransportista, setSelectedTransportista] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarTransportistasPendientes();
  }, []);

  const cargarTransportistasPendientes = async () => {
    try {
      const q = query(
        collection(db, "transportistas"),
        where("verificado", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const transportistasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransportistas(transportistasData);
    } catch (error) {
      console.error("Error al cargar transportistas:", error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (transportista) => {
    setSelectedTransportista(transportista);
    setShowModal(true);
  };

  const aprobarTransportista = async (transportistaId) => {
    const confirmar = confirm(
      "¿Estás seguro de aprobar este transportista? Se le enviará un email con sus credenciales de acceso."
    );
    
    if (!confirmar) return;

    try {
      // Importar el service dinámicamente
      const { aprobarTransportista: aprobarTransportistaFunction } = await import("../../../services/adminService");
      
      // Llamar a la Cloud Function
      const resultado = await aprobarTransportistaFunction(transportistaId);
      
      if (resultado.success) {
        alert("✅ Transportista aprobado exitosamente. Se ha enviado un email con las credenciales.");
        // Recargar lista
        cargarTransportistasPendientes();
        setShowModal(false);
      } else {
        alert(`❌ Error: ${resultado.error}`);
      }
    } catch (error) {
      console.error("Error al aprobar transportista:", error);
      alert("Error al aprobar transportista: " + error.message);
    }
  };

  const rechazarTransportista = async (transportistaId) => {
    const motivo = prompt("¿Por qué rechazas esta solicitud? (Opcional)");
    
    if (motivo === null) return; // Usuario canceló

    try {
      // Importar el service dinámicamente
      const { rechazarTransportista: rechazarTransportistaFunction } = await import("../../../services/adminService");
      
      // Llamar a la Cloud Function
      const resultado = await rechazarTransportistaFunction(transportistaId, motivo);
      
      if (resultado.success) {
        alert("✅ Solicitud rechazada");
        cargarTransportistasPendientes();
        setShowModal(false);
      } else {
        alert(`❌ Error: ${resultado.error}`);
      }
    } catch (error) {
      console.error("Error al rechazar:", error);
      alert("Error al rechazar: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-black text-white mb-2">Solicitudes Pendientes</h2>
        <p className="text-purple-100 text-sm">Revisa y aprueba nuevos transportistas</p>
        <div className="mt-4 bg-white/20 backdrop-blur-sm p-4 rounded-lg inline-block">
          <p className="text-white text-3xl font-black">{transportistas.length}</p>
          <p className="text-purple-100 text-xs font-bold uppercase tracking-wider">En espera</p>
        </div>
      </div>

      {/* Lista de solicitudes */}
      {transportistas.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">¡Todo al día!</h3>
          <p className="text-slate-500 text-sm">No hay transportistas pendientes de verificación</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transportistas.map((transportista) => (
            <div
              key={transportista.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Header de la card */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-b border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <IconTruck />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">{transportista.nombre}</h3>
                    <p className="text-xs text-slate-500">{transportista.email}</p>
                  </div>
                </div>
              </div>

              {/* Información del vehículo */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vehículo</p>
                  <p className="text-sm font-bold text-slate-900">
                    {transportista.vehiculo?.marca} {transportista.vehiculo?.modelo} ({transportista.vehiculo?.anio})
                  </p>
                  <p className="text-xs text-slate-600">Tipo: {transportista.vehiculo?.tipo}</p>
                  <p className="text-xs text-slate-600">Placa: {transportista.vehiculo?.placa}</p>
                  <p className="text-xs text-slate-600">Capacidad: {transportista.vehiculo?.capacidadKg} kg</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Zona</p>
                  <p className="text-sm text-slate-700">{transportista.zona}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono</p>
                  <p className="text-sm text-slate-700">{transportista.telefono}</p>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => verDetalle(transportista)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
                >
                  Ver Detalles y Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {showModal && selectedTransportista && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    {selectedTransportista.nombre}
                  </h2>
                  <p className="text-purple-100 text-sm">{selectedTransportista.email}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <IconX />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información del vehículo */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IconTruck /> Información del Vehículo
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 font-bold">Tipo</p>
                    <p className="text-slate-900">{selectedTransportista.vehiculo?.tipo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Marca</p>
                    <p className="text-slate-900">{selectedTransportista.vehiculo?.marca}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Modelo</p>
                    <p className="text-slate-900">{selectedTransportista.vehiculo?.modelo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Año</p>
                    <p className="text-slate-900">{selectedTransportista.vehiculo?.anio}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Placa</p>
                    <p className="text-slate-900">{selectedTransportista.vehiculo?.placa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold">Capacidad</p>
                    <p className="text-slate-900">{selectedTransportista.vehiculo?.capacidadKg} kg</p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <IconDocument /> Documentos
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="text-sm font-bold text-slate-700">Licencia de Conducir</span>
                    {selectedTransportista.documentos?.licencia ? (
                      <a
                        href={selectedTransportista.documentos.licencia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold underline"
                      >
                        Ver documento
                      </a>
                    ) : (
                      <span className="text-red-500 text-xs font-bold">No subido</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="text-sm font-bold text-slate-700">Tarjeta de Circulación</span>
                    {selectedTransportista.documentos?.tarjetaCirculacion ? (
                      <a
                        href={selectedTransportista.documentos.tarjetaCirculacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-bold underline"
                      >
                        Ver documento
                      </a>
                    ) : (
                      <span className="text-red-500 text-xs font-bold">No subido</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fotos del vehículo */}
              {selectedTransportista.vehiculo?.fotos && selectedTransportista.vehiculo.fotos.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Fotos del Vehículo
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedTransportista.vehiculo.fotos.map((foto, index) => (
                      <img
                        key={index}
                        src={foto}
                        alt={`Vehículo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => aprobarTransportista(selectedTransportista.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <IconCheck /> Aprobar Transportista
                </button>
                <button
                  onClick={() => rechazarTransportista(selectedTransportista.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <IconX /> Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AprobarTransportistas;