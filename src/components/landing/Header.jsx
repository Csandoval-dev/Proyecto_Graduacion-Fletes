// src/components/landing/Header.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-base">F</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-black tracking-tight">
              Fletia<span className="font-normal">HND   </span>
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

          {/* Hamburger Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            aria-label="Abrir menú"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-full h-0.5 bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Menu Mobile */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isMenuOpen ? 'auto' : 0,
            opacity: isMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 space-y-3 border-t border-gray-200">
            {menuItems.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-all duration-300"
              >
                {item.label}
              </motion.a>
            ))}
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <Link to="/login">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-base font-medium text-black hover:bg-gray-100 rounded-lg transition-all duration-300"
                >
                  Iniciar sesión
                </button>
              </Link>
              <Link to="/register">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full px-4 py-2.5 text-base font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-all duration-300"
                >
                  Registrarse
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};