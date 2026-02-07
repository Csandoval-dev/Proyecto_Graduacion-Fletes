// src/components/landing/Beneficios.jsx
import { motion } from "framer-motion";

export const Beneficios = () => {
  const beneficios = [
    {
      titulo: "Búsqueda rápida y eficiente",
      descripcion: "Encuentra el transportista ideal en minutos, no en horas. Filtra por zona, tipo de vehículo y disponibilidad.",
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      titulo: "Transportistas verificados",
      descripcion: "Cada perfil pasa por un proceso de validación. Licencias, vehículos y documentos revisados.",
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      titulo: "Geolocalización y rutas",
      descripcion: "Visualiza transportistas cercanos en tiempo real y optimiza las rutas de entrega.",
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      titulo: "Comunicación directa por chat",
      descripcion: "Coordina todos los detalles sin intermediarios. Chat seguro integrado en la plataforma.",
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      titulo: "Sistema de calificaciones",
      descripcion: "Transparencia total. Lee opiniones reales de otros usuarios antes de decidir.",
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.482-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      titulo: "Notificaciones en tiempo real",
      descripcion: "Mantente informado de cada etapa del proceso. Desde la solicitud hasta la entrega.",
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
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
                
                {/* Icono SVG */}
                <div className="w-12 h-12 md:w-14 md:h-14 bg-black text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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