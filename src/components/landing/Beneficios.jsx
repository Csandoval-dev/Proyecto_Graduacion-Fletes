// src/components/landing/Beneficios.jsx
import { motion } from "framer-motion";

export const Beneficios = () => {
  const beneficios = [
    {
      titulo: "Búsqueda rápida y eficiente",
      descripcion: "Encuentra el transportista ideal en minutos, no en horas. Filtra por zona, tipo de vehículo y disponibilidad.",
      icono: "🔍"
    },
    {
      titulo: "Transportistas verificados",
      descripcion: "Cada perfil pasa por un proceso de validación. Licencias, vehículos y documentos revisados.",
      icono: "✓"
    },
    {
      titulo: "Geolocalización y rutas",
      descripcion: "Visualiza transportistas cercanos en tiempo real y optimiza las rutas de entrega.",
      icono: "📍"
    },
    {
      titulo: "Comunicación directa por chat",
      descripcion: "Coordina todos los detalles sin intermediarios. Chat seguro integrado en la plataforma.",
      icono: "💬"
    },
    {
      titulo: "Sistema de calificaciones",
      descripcion: "Transparencia total. Lee opiniones reales de otros usuarios antes de decidir.",
      icono: "⭐"
    },
    {
      titulo: "Notificaciones en tiempo real",
      descripcion: "Mantente informado de cada etapa del proceso. Desde la solicitud hasta la entrega.",
      icono: "🔔"
    }
  ];

  return (
    <section 
      id="beneficios"
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
            Ventajas Competitivas
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Beneficios diseñados para hacer tu experiencia simple, segura y confiable
          </p>
        </motion.div>

        {/* Grid de beneficios */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {beneficios.map((beneficio, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-gray-50 rounded-2xl p-6 md:p-8 border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all duration-300">
                
                {/* Icono */}
                <div className="w-12 h-12 md:w-14 md:h-14 bg-black text-white rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {beneficio.icono}
                </div>

                {/* Título */}
                <h3 className="text-lg md:text-xl font-bold text-black mb-3 leading-tight">
                  {beneficio.titulo}
                </h3>

                {/* Descripción */}
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {beneficio.descripcion}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-20"
        >
          <div className="bg-black text-white rounded-3xl p-8 md:p-12 lg:p-16 text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para empezar?
            </h3>
            <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a cientos de clientes y transportistas que ya confían en nuestra plataforma
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-black rounded-lg font-medium text-base hover:bg-gray-100 transition-all duration-300">
                Solicitar un flete
              </button>
              <button className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-medium text-base hover:bg-white hover:text-black transition-all duration-300">
                Registrarse como transportista
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};