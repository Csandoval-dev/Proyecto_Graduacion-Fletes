// src/pages/DashboardCliente.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

/**
 * DASHBOARD CLIENTE - Panel principal para usuarios tipo "cliente"
 * 
 * Funcionalidades principales:
 * - Visualización de información del cliente
 * - Acceso a creación de solicitudes de flete
 * - Historial de servicios solicitados
 * - Gestión de perfil personal
 * 
 * Características de diseño:
 * - Colores: Verde (principal del cliente) - WCAG AA compliant
 * - Responsive: Mobile-first design
 * - Accesible: ARIA labels, contraste adecuado, navegación por teclado
 * - Fuente: Arial
 */
function DashboardCliente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Verificar autenticación y cargar datos del usuario
   * Redirigir si no está autenticado o no es cliente
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Verificar que el usuario sea realmente un cliente
            if (userData.rol !== "cliente") {
              // No es cliente, redirigir al dashboard correcto
              navigate("/dashboard");
              return;
            }
            
            setUsuario({
              uid: user.uid,
              email: user.email,
              ...userData
            });
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
   * Navegación a sección de crear solicitud
   */
  const handleCrearSolicitud = () => {
    // TODO: Implementar navegación a formulario de solicitud
    alert("Próximamente: Formulario de solicitud de flete");
  };

  /**
   * Navegación a historial de servicios
   */
  const handleVerHistorial = () => {
    // TODO: Implementar navegación a historial
    alert("Próximamente: Historial de servicios");
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
            className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-slate-700 font-medium text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* ========================================
          NAVBAR - Navegación principal del cliente
          Color: Verde para identificar rol de cliente
      ======================================== */}
      <nav 
        className="bg-white shadow-md sticky top-0 z-50"
        role="navigation"
        aria-label="Navegación principal del cliente"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#16a34a"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Panel de Cliente
                </h1>
                <p className="text-xs text-slate-500">Fletes App</p>
              </div>
            </div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
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
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 rounded-lg p-6 sm:p-8 mb-6"
          aria-labelledby="welcome-heading"
        >
          <h2 
            id="welcome-heading"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
          >
            ¡Hola, {usuario?.nombre}! 👋
          </h2>
          <p className="text-slate-600 text-lg">
            Bienvenido a tu panel de control. Desde aquí puedes gestionar todas tus solicitudes de flete.
          </p>
        </section>

        {/* Grid de tarjetas de acción rápida */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta: Nueva Solicitud */}
          <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-green-600">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#16a34a"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Nueva Solicitud
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Crea una nueva solicitud de flete y encuentra el transportista ideal para tu carga.
            </p>
            <button
              onClick={handleCrearSolicitud}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all"
              aria-label="Crear nueva solicitud de flete"
            >
              Crear Solicitud
            </button>
          </article>

          {/* Tarjeta: Mis Solicitudes */}
          <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-t-4 border-blue-600">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#2563eb"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Mis Solicitudes
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Consulta el estado de tus solicitudes activas y pendientes.
            </p>
            <button
              onClick={handleVerHistorial}
              className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
              aria-label="Ver mis solicitudes de flete"
            >
              Ver Solicitudes
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
              Historial
            </h3>
            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
              Revisa todos tus servicios completados y calificaciones.
            </p>
            <button
              onClick={handleVerHistorial}
              className="w-full px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all"
              aria-label="Ver historial completo de servicios"
            >
              Ver Historial
            </button>
          </article>
        </div>

        {/* Sección de información del perfil */}
        <section aria-labelledby="profile-heading">
          <h3 
            id="profile-heading"
            className="text-2xl font-bold text-slate-900 mb-6"
          >
            Información de tu Cuenta
          </h3>
          
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información personal */}
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Datos Personales
                </h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Nombre completo</dt>
                    <dd className="text-base text-slate-900 font-medium">{usuario?.nombre}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Correo electrónico</dt>
                    <dd className="text-base text-slate-900 break-all">{usuario?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Teléfono</dt>
                    <dd className="text-base text-slate-900">{usuario?.telefono || "No registrado"}</dd>
                  </div>
                </dl>
              </div>

              {/* Estado de la cuenta */}
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  Estado de la Cuenta
                </h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Tipo de cuenta</dt>
                    <dd className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Cliente
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Estado</dt>
                    <dd className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Activo
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500 mb-1">Miembro desde</dt>
                    <dd className="text-base text-slate-900">
                      {usuario?.createdAt?.toDate?.()?.toLocaleDateString('es-HN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) || "Fecha no disponible"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Botón de editar perfil */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => alert("Próximamente: Editar perfil")}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all"
                aria-label="Editar información del perfil"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </section>

        {/* Sección de ayuda rápida */}
        <section 
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
          aria-labelledby="help-heading"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" fill="#2563eb"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 
                id="help-heading"
                className="text-lg font-bold text-slate-900 mb-2"
              >
                ¿Necesitas ayuda?
              </h3>
              <p className="text-slate-600 mb-4">
                Si tienes dudas sobre cómo crear una solicitud o necesitas soporte, estamos aquí para ayudarte.
              </p>
              <button
                onClick={() => alert("Próximamente: Centro de ayuda")}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-sm"
                aria-label="Ir al centro de ayuda"
              >
                Centro de Ayuda
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardCliente;