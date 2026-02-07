// src/pages/DashboardTransportista.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

/**
 * DASHBOARD TRANSPORTISTA - Panel principal para usuarios tipo "transportista"
 * 
 * Funcionalidades principales:
 * - Gestión del perfil profesional (vehículo, documentos, zona)
 * - Visualización de solicitudes disponibles
 * - Historial de servicios completados
 * - Sistema de calificaciones recibidas
 * 
 * Características de diseño:
 * - Colores: Naranja (principal del transportista) - WCAG AA compliant
 * - Responsive: Mobile-first design
 * - Accesible: ARIA labels, contraste adecuado, navegación por teclado
 * - Fuente: Arial
 */
function DashboardTransportista() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [perfilTransportista, setPerfilTransportista] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verificar autenticación y cargar datos del usuario y transportista
   * Redirigir si no está autenticado o no es transportista
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Obtener datos del usuario
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Verificar que el usuario sea realmente un transportista
            if (userData.rol !== "transportista") {
              // No es transportista, redirigir al dashboard correcto
              navigate("/dashboard");
              return;
            }
            
            setUsuario({
              uid: user.uid,
              email: user.email,
              ...userData
            });

            // Obtener datos del perfil de transportista
            const transportistaRef = doc(db, "transportistas", user.uid);
            const transportistaSnap = await getDoc(transportistaRef);
            
            if (transportistaSnap.exists()) {
              setPerfilTransportista(transportistaSnap.data());
            }
          } else {
            // Usuario sin documento en Firestore
            navigate("/login");
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
          navigate("/login");
        }
      } else {
        // No autenticado
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  /**
   * Cerrar sesión y redirigir a landing page
   */
  const handleLogout = async () => {
    try {
      await cerrarSesion();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  /**
   * Navegación a completar perfil profesional
   */
  const handleCompletarPerfil = () => {
    navigate("/perfil-transportista");
  };

  /**
   * Navegación a solicitudes disponibles
   */
  const handleVerSolicitudes = () => {
    alert("Próximamente: Solicitudes disponibles");
  };

  /**
   * PANTALLA DE CARGA
   */
  if (loading) {
    return (
      <div 
        className="min-h-screen bg-slate-50 flex items-center justify-center px-4"
        role="status"
        aria-label="Cargando dashboard"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-slate-700 font-medium text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  /**
   * Verificar si el perfil profesional está completo
   */
  const perfilCompleto = perfilTransportista && 
    perfilTransportista.vehiculo?.tipo && 
    perfilTransportista.zona &&
    perfilTransportista.documentos?.licencia;

  return (
    <div 
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* ========================================
          NAVBAR - Navegación principal del transportista
          Color: Naranja para identificar rol de transportista
      ======================================== */}
      <nav 
        className="bg-white shadow-md sticky top-0 z-50"
        role="navigation"
        aria-label="Navegación principal del transportista"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 17H5V7h14m0-5H5c-1.11 0-2 .89-2 2v14a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2z" fill="#ea580c"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Panel de Transportista
                </h1>
                <p className="text-xs text-slate-500">Fletes App</p>
              </div>
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              aria-label="Cerrar sesión"
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================
          CONTENIDO PRINCIPAL
      ======================================== */}
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        role="main"
      >
        {/* Sección de bienvenida */}
        <section 
          className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-600 rounded-lg p-6 sm:p-8 mb-6"
          aria-labelledby="welcome-heading"
        >
          <h2 
            id="welcome-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
          >
            ¡Hola, {usuario?.nombre}! 🚚
          </h2>
          <p className="text-slate-600 text-lg">
            Gestiona tus servicios de transporte y perfil profesional desde aquí.
          </p>
        </section>

        {/* Alerta: Perfil incompleto */}
        {!perfilCompleto && (
          <section 
            className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6"
            role="alert"
            aria-labelledby="alert-heading"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#eab308"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 
                  id="alert-heading"
                  className="text-lg font-bold text-slate-900 mb-2"
                >
                  Completa tu perfil profesional
                </h3>
                <p className="text-slate-600 mb-4">
                  Para comenzar a recibir solicitudes de flete, necesitas completar la información de tu vehículo y subir tus documentos.
                </p>
                <button
                  onClick={handleCompletarPerfil}
                  className="px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all"
                  aria-label="Completar perfil profesional"
                >
                  Completar Perfil Ahora
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Estadística: Calificación */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#eab308"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-slate-900">
                {perfilTransportista?.calificacionPromedio?.toFixed(1) || "0.0"}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Calificación Promedio</h3>
            <p className="text-xs text-slate-400 mt-1">
              {perfilTransportista?.totalCalificaciones || 0} opiniones
            </p>
          </article>

          {/* Estadística: Servicios */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#16a34a"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-slate-900">
                {perfilTransportista?.serviciosCompletados || 0}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Servicios Completados</h3>
            <p className="text-xs text-slate-400 mt-1">Total histórico</p>
          </article>

          {/* Estadística: Disponibilidad */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${perfilTransportista?.disponible ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                <span className={`w-6 h-6 ${perfilTransportista?.disponible ? 'bg-green-600' : 'bg-red-600'} rounded-full`}></span>
              </div>
              <span className={`text-lg font-bold ${perfilTransportista?.disponible ? 'text-green-600' : 'text-red-600'}`}>
                {perfilTransportista?.disponible ? 'Disponible' : 'No disponible'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Estado Actual</h3>
            <p className="text-xs text-slate-400 mt-1">
              {perfilTransportista?.disponible ? 'Recibiendo solicitudes' : 'Pausado'}
            </p>
          </article>

          {/* Estadística: Verificación */}
          <article className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${perfilTransportista?.verificado ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill={perfilTransportista?.verificado ? '#2563eb' : '#6b7280'}/>
                </svg>
              </div>
              <span className={`text-lg font-bold ${perfilTransportista?.verificado ? 'text-blue-600' : 'text-gray-600'}`}>
                {perfilTransportista?.verificado ? 'Verificado' : 'Pendiente'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500">Verificación</h3>
            <p className="text-xs text-slate-400 mt-1">
              {perfilTransportista?.verificado ? 'Cuenta verificada' : 'En revisión'}
            </p>
          </article>
        </div>

        {/* Grid de acciones rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta: Ver Solicitudes */}
          <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-orange-600">
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#ea580c"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Solicitudes Disponibles
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Revisa las solicitudes de flete en tu zona y acepta las que más te convengan.
            </p>
            <button
              onClick={handleVerSolicitudes}
              className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all"
              aria-label="Ver solicitudes disponibles"
              disabled={!perfilCompleto}
            >
              Ver Solicitudes
            </button>
          </article>

          {/* Tarjeta: Mi Perfil */}
          <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-blue-600">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#2563eb"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Mi Perfil Profesional
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Actualiza la información de tu vehículo, documentos y zona de trabajo.
            </p>
            <button
              onClick={handleCompletarPerfil}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
              aria-label="Editar perfil profesional"
            >
              {perfilCompleto ? 'Editar Perfil' : 'Completar Perfil'}
            </button>
          </article>

          {/* Tarjeta: Historial */}
          <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-purple-600">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z" fill="#9333ea"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Mis Servicios
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Consulta el historial de todos tus servicios realizados.
            </p>
            <button
              onClick={() => alert("Próximamente: Historial de servicios")}
              className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              aria-label="Ver historial de servicios"
            >
              Ver Historial
            </button>
          </article>
        </div>

        {/* Información del vehículo (si existe) */}
        {perfilTransportista?.vehiculo?.tipo && (
          <section aria-labelledby="vehicle-heading" className="mb-8">
            <h3 
              id="vehicle-heading"
              className="text-2xl font-bold text-slate-900 mb-6"
            >
              Información del Vehículo
            </h3>
            
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <dt className="text-sm font-medium text-slate-500 mb-1">Tipo de vehículo</dt>
                  <dd className="text-base text-slate-900 font-medium capitalize">
                    {perfilTransportista.vehiculo.tipo}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 mb-1">Marca y modelo</dt>
                  <dd className="text-base text-slate-900 font-medium">
                    {perfilTransportista.vehiculo.marca} {perfilTransportista.vehiculo.modelo}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 mb-1">Año</dt>
                  <dd className="text-base text-slate-900 font-medium">
                    {perfilTransportista.vehiculo.anio}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 mb-1">Placa</dt>
                  <dd className="text-base text-slate-900 font-medium uppercase">
                    {perfilTransportista.vehiculo.placa}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 mb-1">Capacidad de carga</dt>
                  <dd className="text-base text-slate-900 font-medium">
                    {perfilTransportista.vehiculo.capacidadKg} kg
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500 mb-1">Zona de trabajo</dt>
                  <dd className="text-base text-slate-900 font-medium">
                    {perfilTransportista.zona}
                  </dd>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardTransportista;