// src/pages/transportista/PerfilTransportista.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { subirArchivo, subirMultiplesArchivos, validarTipoArchivo, validarTamañoArchivo } from "../../services/cloudinaryService";

// Iconos SVG
const IconUpload = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

function PerfilTransportista() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Datos personales, 2: Vehículo, 3: Documentos
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    zona: "",
    descripcion: "",
    tipoVehiculo: "",
    marca: "",
    modelo: "",
    anio: "",
    placa: "",
    capacidadKg: ""
  });

  // Archivos
  const [archivos, setArchivos] = useState({
    licencia: null,
    tarjetaCirculacion: null,
    fotosVehiculo: []
  });

  // Preview de archivos
  const [previews, setPreviews] = useState({
    licencia: null,
    tarjetaCirculacion: null,
    fotosVehiculo: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validar tipo de archivo (solo imágenes y PDFs)
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validarTipoArchivo(file, tiposPermitidos)) {
      setError("Solo se permiten archivos JPG, PNG o PDF");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (!validarTamañoArchivo(file, 5)) {
      setError("El archivo no debe superar 5MB");
      return;
    }

    setError("");
    
    // Guardar archivo
    setArchivos(prev => ({ ...prev, [tipo]: file }));

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [tipo]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFiles = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      setError("Máximo 4 fotos del vehículo");
      return;
    }

    // Validar cada archivo
    for (const file of files) {
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validarTipoArchivo(file, tiposPermitidos)) {
        setError("Solo se permiten imágenes JPG o PNG");
        return;
      }
      if (!validarTamañoArchivo(file, 5)) {
        setError("Cada imagen no debe superar 5MB");
        return;
      }
    }

    setError("");
    setArchivos(prev => ({ ...prev, fotosVehiculo: files }));

    // Crear previews
    const previewsArray = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewsArray.push(reader.result);
        if (previewsArray.length === files.length) {
          setPreviews(prev => ({ ...prev, fotosVehiculo: previewsArray }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const validarStep1 = () => {
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.zona) {
      setError("Por favor completa todos los campos obligatorios");
      return false;
    }
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email inválido");
      return false;
    }
    setError("");
    return true;
  };

  const validarStep2 = () => {
    if (!formData.tipoVehiculo || !formData.marca || !formData.modelo || 
        !formData.placa || !formData.capacidadKg) {
      setError("Por favor completa todos los campos del vehículo");
      return false;
    }
    setError("");
    return true;
  };

  const validarStep3 = () => {
    if (!archivos.licencia || !archivos.tarjetaCirculacion || archivos.fotosVehiculo.length === 0) {
      setError("Por favor sube todos los documentos requeridos");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validarStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validarStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarStep3()) return;

    setGuardando(true);
    setError("");

    try {
      // 1. Subir licencia a Cloudinary
      const licenciaResult = await subirArchivo(
        archivos.licencia,
        "documentos",
        `licencia_${formData.email}_${Date.now()}`
      );

      if (!licenciaResult.success) {
        throw new Error("Error al subir licencia");
      }

      // 2. Subir tarjeta de circulación
      const tarjetaResult = await subirArchivo(
        archivos.tarjetaCirculacion,
        "documentos",
        `tarjeta_${formData.email}_${Date.now()}`
      );

      if (!tarjetaResult.success) {
        throw new Error("Error al subir tarjeta de circulación");
      }

      // 3. Subir fotos del vehículo
      const fotosResult = await subirMultiplesArchivos(
        archivos.fotosVehiculo,
        "vehiculos",
        `vehiculo_${formData.email}`
      );

      if (!fotosResult.success) {
        throw new Error("Error al subir fotos del vehículo");
      }

      // 4. Crear documento en Firestore (colección transportistas)
      await addDoc(collection(db, "transportistas"), {
        // Datos personales
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        zona: formData.zona,
        descripcion: formData.descripcion,
        
        // Estado
        disponible: false,
        verificado: false,
        
        // Vehículo
        vehiculo: {
          tipo: formData.tipoVehiculo,
          marca: formData.marca,
          modelo: formData.modelo,
          anio: parseInt(formData.anio) || null,
          placa: formData.placa.toUpperCase(),
          capacidadKg: parseInt(formData.capacidadKg),
          fotos: fotosResult.urls
        },

        // Documentos
        documentos: {
          licencia: licenciaResult.url,
          tarjetaCirculacion: tarjetaResult.url
        },

        // Estadísticas iniciales
        calificacionPromedio: 0,
        totalCalificaciones: 0,
        serviciosCompletados: 0,
        
        createdAt: serverTimestamp()
      });

      // Éxito - Mostrar mensaje y redirigir
      alert(" ¡Solicitud enviada exitosamente! Te notificaremos por email cuando sea aprobada.");
      navigate("/");

    } catch (err) {
      console.error("Error al enviar solicitud:", err);
      setError("Error al procesar la solicitud. Intenta de nuevo: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-700 hover:text-gray-900 rounded-lg transition text-sm sm:text-base"
            >
              <span className="mr-1 sm:mr-2">←</span>
              <span className="font-medium">Volver</span>
            </button>
            <button 
              onClick={() => navigate("/login")} 
              className="text-sm text-blue-600 font-medium hover:text-blue-800"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Únete como Transportista
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Completa tu solicitud y comienza a recibir fletes
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <IconCheck /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-600">
            <span>Datos Personales</span>
            <span>Vehículo</span>
            <span>Documentos</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Datos Personales */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información Personal</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="tu@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Recibirás tus credenciales a este email cuando seas aprobado</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona de Trabajo *</label>
                <input
                  type="text"
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="San Pedro Sula, Cortés"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de tus servicios</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Ofrezco servicios de mudanza, fletes express..."
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* STEP 2: Vehículo */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información del Vehículo</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo *</label>
                <select 
                  name="tipoVehiculo" 
                  value={formData.tipoVehiculo} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="pickup">Pickup</option>
                  <option value="camion">Camión</option>
                  <option value="camioneta">Camioneta</option>
                  <option value="moto">Moto (Mensajería)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                  <input 
                    type="text" 
                    name="marca" 
                    value={formData.marca} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Toyota"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                  <input 
                    type="text" 
                    name="modelo" 
                    value={formData.modelo} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Hilux"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input 
                    type="number" 
                    name="anio" 
                    value={formData.anio} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="2020"
                    min="1990"
                    max="2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                  <input 
                    type="text" 
                    name="placa" 
                    value={formData.placa} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                    placeholder="PBC-1234"
                    required 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad de Carga (Kg) *</label>
                  <input 
                    type="number" 
                    name="capacidadKg" 
                    value={formData.capacidadKg} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="1000"
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Documentos */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Documentos Requeridos</h2>
              
              {/* Licencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licencia de Conducir * <span className="text-xs text-gray-500">(JPG, PNG o PDF - Max 5MB)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'licencia')}
                    className="hidden"
                    id="licencia"
                  />
                  <label htmlFor="licencia" className="cursor-pointer">
                    {previews.licencia ? (
                      <div>
                        {archivos.licencia?.type === 'application/pdf' ? (
                          <p className="text-green-600 font-medium">✓ PDF subido</p>
                        ) : (
                          <img src={previews.licencia} alt="Licencia" className="max-h-48 mx-auto rounded" />
                        )}
                        <p className="text-sm text-gray-600 mt-2">{archivos.licencia?.name}</p>
                      </div>
                    ) : (
                      <div>
                        <IconUpload className="mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click para subir tu licencia</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Tarjeta de Circulación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarjeta de Circulación * <span className="text-xs text-gray-500">(JPG, PNG o PDF - Max 5MB)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'tarjetaCirculacion')}
                    className="hidden"
                    id="tarjeta"
                  />
                  <label htmlFor="tarjeta" className="cursor-pointer">
                    {previews.tarjetaCirculacion ? (
                      <div>
                        {archivos.tarjetaCirculacion?.type === 'application/pdf' ? (
                          <p className="text-green-600 font-medium">✓ PDF subido</p>
                        ) : (
                          <img src={previews.tarjetaCirculacion} alt="Tarjeta" className="max-h-48 mx-auto rounded" />
                        )}
                        <p className="text-sm text-gray-600 mt-2">{archivos.tarjetaCirculacion?.name}</p>
                      </div>
                    ) : (
                      <div>
                        <IconUpload className="mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click para subir tu tarjeta</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Fotos del Vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos del Vehículo * <span className="text-xs text-gray-500">(1-4 fotos, JPG o PNG - Max 5MB c/u)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFiles}
                    className="hidden"
                    id="fotos"
                  />
                  <label htmlFor="fotos" className="cursor-pointer">
                    {previews.fotosVehiculo.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {previews.fotosVehiculo.map((preview, idx) => (
                          <img key={idx} src={preview} alt={`Vehículo ${idx + 1}`} className="h-32 w-full object-cover rounded" />
                        ))}
                      </div>
                    ) : (
                      <div>
                        <IconUpload className="mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click para subir fotos de tu vehículo</p>
                        <p className="text-xs text-gray-500">Recomendado: Vista frontal, lateral, trasera y de la carga</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Importante:</strong> Tu solicitud será revisada por nuestro equipo. 
                  Una vez aprobada, recibirás un email con tus credenciales de acceso.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  disabled={guardando}
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? "Enviando..." : "Enviar Solicitud ✓"}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default PerfilTransportista;