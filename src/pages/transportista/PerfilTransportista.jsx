// src/pages/transportista/PerfilTransportista.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

function PerfilTransportista() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    zona: "",
    descripcion: "",
    disponible: false,
    tipoVehiculo: "",
    marca: "",
    modelo: "",
    anio: "",
    placa: "",
    capacidadKg: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const usuarioDoc = await getDoc(doc(db, "usuarios", user.uid));
          
          if (usuarioDoc.exists() && usuarioDoc.data().rol === "transportista") {
            setUsuario({ uid: user.uid, ...usuarioDoc.data() });
            
            const transportistaDoc = await getDoc(doc(db, "transportistas", user.uid));
            if (transportistaDoc.exists()) {
              const data = transportistaDoc.data();
              setFormData({
                zona: data.zona || "",
                descripcion: data.descripcion || "",
                disponible: data.disponible || false,
                tipoVehiculo: data.vehiculo?.tipo || "",
                marca: data.vehiculo?.marca || "",
                modelo: data.vehiculo?.modelo || "",
                anio: data.vehiculo?.anio || "",
                placa: data.vehiculo?.placa || "",
                capacidadKg: data.vehiculo?.capacidadKg || ""
              });
            }
          } else if (usuarioDoc.exists()) {
            // Si es cliente, mejor mandarlo a su zona
            navigate("/home");
          }
        } else {
          // MODO PÚBLICO: Si no hay usuario, no hacemos navigate.
          // Solo revisamos si dejó algo a medias en el localStorage
          const savedData = localStorage.getItem("temp_perfil_transp");
          if (savedData) {
            setFormData(JSON.parse(savedData));
          }
          setUsuario(null);
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      // Si es invitado, guardamos el progreso localmente por si recarga la página
      if (!usuario) {
        localStorage.setItem("temp_perfil_transp", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGuardando(true);

    // Validación básica
    if (!formData.zona || !formData.tipoVehiculo || !formData.marca || 
        !formData.modelo || !formData.placa || !formData.capacidadKg) {
      setError("Por favor completa todos los campos obligatorios");
      setGuardando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      if (usuario) {
        // --- CASO USUARIO LOGUEADO: Actualizar Firebase ---
        const transportistaRef = doc(db, "transportistas", usuario.uid);
        await updateDoc(transportistaRef, {
          zona: formData.zona,
          descripcion: formData.descripcion,
          disponible: formData.disponible,
          vehiculo: {
            tipo: formData.tipoVehiculo,
            marca: formData.marca,
            modelo: formData.modelo,
            anio: parseInt(formData.anio) || null,
            placa: formData.placa,
            capacidadKg: parseInt(formData.capacidadKg),
            fotos: []
          }
        });
        setSuccess("¡Perfil actualizado correctamente! ✅");
      } else {
        // --- CASO INVITADO: Guardar y mandar al Registro ---
        localStorage.setItem("datos_registro_transp", JSON.stringify(formData));
        // Redirigir a tu página de registro (Auth)
        navigate("/register"); 
        return;
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (err) {
      setError("Error al procesar la solicitud. Intenta de nuevo.");
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleLogout = async () => {
    await cerrarSesion();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

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
            {usuario ? (
              <button onClick={handleLogout} className="text-sm text-red-600 font-medium">Salir</button>
            ) : (
              <button onClick={() => navigate("/login")} className="text-sm text-blue-600 font-medium">Iniciar Sesión</button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {usuario ? "Tu Perfil de Transportista" : "Regístrate como Transportista"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {usuario 
              ? "Mantén tu información actualizada para recibir más fletes." 
              : "Primero, cuéntanos sobre tu vehículo y zona de trabajo."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* SECCIÓN: INFORMACIÓN GENERAL */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona de trabajo *</label>
                <input
                  type="text"
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: San Pedro Sula, Cortés"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Ofrezco servicios de mudanza y fletes express..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="disponible" className="text-sm text-gray-700">Disponible para trabajar ahora</label>
              </div>
            </div>
          </div>

          {/* SECCIÓN: VEHÍCULO */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información del Vehículo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vehículo *</label>
                <select 
                  name="tipoVehiculo" 
                  value={formData.tipoVehiculo} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="pickup">Pickup</option>
                  <option value="camion">Camión</option>
                  <option value="camioneta">Camioneta</option>
                  <option value="moto">Moto (Mensajería)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
                <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
                <input type="text" name="placa" value={formData.placa} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg uppercase" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (Kg) *</label>
                <input type="number" name="capacidadKg" value={formData.capacidadKg} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {guardando ? "Procesando..." : (usuario ? "Actualizar Perfil" : "Siguiente: Crear mi cuenta")}
          </button>
        </form>
      </main>
    </div>
  );
}

export default PerfilTransportista;