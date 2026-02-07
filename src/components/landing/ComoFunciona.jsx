// src/components/landing/ComoFunciona.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const ComoFunciona = () => {
  const pasosClientes = [
    {
      numero: "01",
      titulo: "Publica tu solicitud",
      descripcion: "Describe qué necesitas transportar y hacia dónde"
    },
    {
      numero: "02",
      titulo: "Visualiza transportistas",
      descripcion: "Revisa perfiles cercanos con calificaciones verificadas"
    },
    {
      numero: "03",
      titulo: "Coordina el servicio",
      descripcion: "Chatea directamente y acuerda los detalles"
    },
    {
      numero: "04",
      titulo: "Califica la experiencia",
      descripcion: "Ayuda a otros usuarios con tu opinión"
    }
  ];

  const pasosTransportistas = [
    {
      numero: "01",
      titulo: "Regístrate gratis",
      descripcion: "Crea tu perfil profesional en minutos"
    },
    {
      numero: "02",
      titulo: "Define tu operación",
      descripcion: "Indica tu zona, tipo de vehículo y disponibilidad"
    },
    {
      numero: "03",
      titulo: "Recibe solicitudes",
      descripcion: "Notificaciones de clientes que necesitan tus servicios"
    },
    {
      numero: "04",
      titulo: "Ofrece tu servicio",
      descripcion: "Negocia directamente y realiza el flete"
    }
  ];

  return (
    <section 
      id="como-funciona"
      className="py-16 md:py-24 lg:py-32 bg-white"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-4 py-2 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            Proceso Simple
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6">
            ¿Cómo funciona?
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Conectamos de forma simple y directa. Elige tu rol y comienza en minutos.
          </p>
        </motion.div>

        {/* Tabs o secciones */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Para Clientes */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                Para Clientes
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Encuentra el transportista perfecto en 4 pasos
              </p>
            </div>

            <div className="space-y-6">
              {pasosClientes.map((paso, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="flex gap-6">
                    {/* Número */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {paso.numero}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 pb-8 border-l-2 border-gray-200 pl-6 group-last:border-l-0">
                      <h4 className="text-lg md:text-xl font-bold text-black mb-2">
                        {paso.titulo}
                      </h4>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {paso.descripcion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Para Transportistas */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                Para Transportistas
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                Genera ingresos con tu vehículo en 4 pasos
              </p>
            </div>

            <div className="space-y-6">
              {pasosTransportistas.map((paso, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="flex gap-6">
                    {/* Número */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                        {paso.numero}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 pb-8 border-l-2 border-gray-200 pl-6 group-last:border-l-0">
                      <h4 className="text-lg md:text-xl font-bold text-black mb-2">
                        {paso.titulo}
                      </h4>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {paso.descripcion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16 md:mt-20"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <button className="px-8 py-4 bg-black text-white rounded-lg font-medium text-base hover:bg-gray-800 transition-all duration-300 shadow-lg">
                Comenzar como cliente
              </button>
            </Link>
            <Link to="/register-transportista">
              <button className="px-8 py-4 bg-white text-black border-2 border-gray-200 rounded-lg font-medium text-base hover:border-black transition-all duration-300">
                Registrarme como transportista
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};