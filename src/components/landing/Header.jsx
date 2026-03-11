import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Bloqueo de scroll cuando el menú está abierto para que se sienta como App real
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const menuItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "¿Cómo funciona?", href: "#como-funciona" },
    { label: "Beneficios", href: "#beneficios" },
    { label: "Contacto", href: "#contacto" }
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white border-b border-gray-200" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo - Z-60 para que siempre esté al frente */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 cursor-pointer z-[60]"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-base">F</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-black tracking-tight">
              Fletia<span className="font-normal">HND </span>
            </span>
          </motion.div>

          {/* Menu Desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-300 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
          </div>

          {/* Botones Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/login">
                <button className="px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-100 rounded-lg transition-all duration-300">
                  Iniciar sesión
                </button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/register">
                <button className="px-5 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-all duration-300 shadow-sm">
                  Registrarse
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Hamburger Menu Mobile - FONDO NEGRO Y LÍNEAS BLANCAS */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 z-[60] bg-black rounded-lg transition-all duration-300 shadow-lg"
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
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-white z-[50] lg:hidden flex flex-col justify-center px-6"
            >
              <div className="w-full space-y-12 text-center">
                {/* Enlaces de Navegación */}
                <div className="flex flex-col space-y-8">
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.href}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-3xl font-bold text-black tracking-tight"
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>

                {/* Acciones de Usuario con Contraste Profesional */}
                <div className="flex flex-col gap-4 pt-10 border-t border-gray-100">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};