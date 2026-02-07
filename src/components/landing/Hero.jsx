// src/components/landing/Hero.jsx
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section 
      id="inicio"
      className="relative pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24 lg:pb-32 bg-white overflow-hidden"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5">
        <div className="absolute top-20 right-10 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-black rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Contenido izquierdo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs md:text-sm font-medium text-gray-700">
                Disponible en San Pedro Sula
              </span>
            </motion.div>

            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight"
            >
              Conecta tu carga con el transportista ideal
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Una plataforma digital que facilita la contratación de servicios de fletes urbanos, conectando clientes con transportistas independientes de forma rápida, segura y organizada.
            </motion.p>

            {/* Botones CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {/* BOTÓN 1: Para Clientes */}
              <Link to="/home" className="w-full sm:w-auto">
                <button className="group relative w-full px-8 py-4 bg-black text-white rounded-lg font-medium text-base overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <span className="relative z-10">Buscar transportista</span>
                  <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </Link>
              
              {/* BOTÓN 2: Para Transportistas */}
              <Link to="/register-transportista" className="w-full sm:w-auto">
                <button className="group w-full px-8 py-4 bg-white text-black border-2 border-gray-200 rounded-lg font-medium text-base transition-all duration-300 hover:border-black hover:bg-gray-50">
                  Soy transportista
                </button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200"
            >
              <div>
                <div className="text-2xl md:text-3xl font-bold text-black mb-1">500+</div>
                <div className="text-xs md:text-sm text-gray-600">Transportistas</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-black mb-1">2K+</div>
                <div className="text-xs md:text-sm text-gray-600">Fletes realizados</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-black mb-1">4.8★</div>
                <div className="text-xs md:text-sm text-gray-600">Calificación</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Imagen derecha */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
                alt="Transportista profesional"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Card flotante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-black">Flete completado</div>
                  <div className="text-xs text-gray-600">Hace 2 minutos</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};