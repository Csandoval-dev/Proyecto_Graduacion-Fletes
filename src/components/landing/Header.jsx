import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [instalada, setInstalada] = useState(false);

  // Bloqueo de scroll cuando el menú está abierto para que se sienta como App real
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onAppInstalled = () => {
      setInstalada(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const instalarPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstalada(true);
    }

    setDeferredPrompt(null);
  };

  const manejarDescarga = async () => {
    if (instalada) return;

    if (deferredPrompt) {
      await instalarPWA();
      return;
    }

    if (mostrarGuiaIOS) {
      alert("Para instalar en iPhone/iPad: abre en Safari y toca Compartir > Anadir a pantalla de inicio.");
      return;
    }

    alert("Si no aparece instalacion automatica, abre este sitio en Chrome o Edge y selecciona 'Instalar app' en el menu del navegador.");
  };

  const menuItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "¿Cómo funciona?", href: "#como-funciona" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Contacto", href: "#contacto" }
  ];

  const mostrarGuiaIOS =
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);

  return (
    <nav className="fixed w-full top-0 z-50 bg-white border-b border-gray-200" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo - Z-60 para que siempre esté al frente */}
          <div className="flex items-center gap-2 cursor-pointer z-60">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-base">F</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-black tracking-tight">
              Fletia<span className="font-normal">HND </span>
            </span>
          </div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Botones Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={manejarDescarga}
                disabled={instalada}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  instalada
                    ? 'text-gray-500 border border-gray-300 cursor-not-allowed'
                    : 'text-black border border-black hover:bg-gray-100'
                }`}
              >
                {instalada ? 'App instalada' : 'Descargar app'}
              </button>
            
            </div>
            <div>
              <Link to="/login">
                <button className="px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-100 rounded-lg transition-all duration-300">
                  Iniciar sesión
                </button>
              </Link>
            </div>
            <div>
              <Link to="/register">
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-all duration-300 shadow-sm">
                  Registrarse
                </button>
              </Link>
            </div>
          </div>

          {/* Hamburger Menu Mobile - FONDO NEGRO Y LÍNEAS BLANCAS */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 z-60 bg-black rounded-lg transition-all duration-300 shadow-lg"
            aria-label="Toggle menú"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-full h-0.5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Menu Mobile FULL SCREEN */}
        <AnimatePresence>
          {isMenuOpen && (
            <div
              className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col justify-center px-6"
            >
              <div className="w-full space-y-12 text-center">
                {/* Enlaces de Navegación */}
                <div className="flex flex-col space-y-8">
                  {menuItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-3xl font-bold text-black tracking-tight"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                {/* Acciones de Usuario con Contraste Profesional */}
                <div className="flex flex-col gap-4 pt-10 border-t border-gray-100">
                  <button
                    onClick={async () => {
                      await manejarDescarga();
                      setIsMenuOpen(false);
                    }}
                    disabled={instalada}
                    className={`w-full py-4 text-lg font-bold rounded-2xl transition-all shadow-sm border-2 ${
                      instalada
                        ? 'text-gray-500 bg-white border-gray-300 cursor-not-allowed'
                        : 'text-black bg-white border-black active:bg-gray-100'
                    }`}
                  >
                    {instalada ? 'App instalada' : 'Descargar app'}
                  </button>

                  {!instalada && (
                    <p className="text-[11px] text-gray-500 leading-relaxed text-center px-2">
                      Disponible para celular y escritorio.
                    </p>
                  )}

                  {mostrarGuiaIOS && !deferredPrompt && !instalada && (
                    <p className="text-xs text-gray-500 leading-relaxed text-center px-2">
                      En iPhone/iPad usa Safari y toca Compartir {'>'} Anadir a pantalla de inicio.
                    </p>
                  )}

                  <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full py-4 text-lg font-bold text-black bg-white border-2 border-black rounded-2xl active:bg-gray-100 transition-all shadow-sm">
                      Iniciar sesión
                    </button>
                  </Link>
                  <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full py-4 text-lg font-bold text-white bg-black border-2 border-black rounded-2xl active:bg-gray-900 transition-all shadow-lg">
                      Registrarse
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};