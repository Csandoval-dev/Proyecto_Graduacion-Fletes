// src/components/landing/ProblemaSolucion.jsx
import { motion } from "framer-motion";

export const ProblemaSolucion = () => {
  return (
    <section 
      className="py-16 md:py-24 lg:py-32 bg-gray-50"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* El Problema */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 md:mb-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Contenido */}
            <div>
              <span className="inline-block px-4 py-2 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                El Problema
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                El transporte de carga liviana hoy
              </h2>
              
              <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
                <p>
                  Actualmente, la contratación de servicios de fletes se realiza de forma <strong className="text-black">informal</strong>, mediante recomendaciones personales o publicaciones aisladas en redes sociales.
                </p>
                <p>
                  Esto dificulta encontrar transportistas disponibles, confiables y cercanos en el momento requerido, generando <strong className="text-black">pérdida de tiempo, desorganización y poca seguridad</strong> para ambas partes.
                </p>
              </div>

              {/* Estadísticas del problema */}
              <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-300">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">70%</div>
                  <div className="text-sm text-gray-600">Sin verificación de transportistas</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-red-600 mb-2">3hrs+</div>
                  <div className="text-sm text-gray-600">Tiempo promedio de búsqueda</div>
                </div>
              </div>
            </div>

            {/* Imagen */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=800"
                  alt="Problema actual del transporte"
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* La Solución */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Imagen primero en desktop (order-first para mobile) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800"
                  alt="Solución plataforma digital"
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* Badge flotante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-4 -right-4 bg-black text-white px-6 py-4 rounded-xl shadow-2xl"
              >
                <div className="text-2xl font-bold">100%</div>
                <div className="text-xs">Digital</div>
              </motion.div>
            </motion.div>

            {/* Contenido */}
            <div className="order-1 lg:order-2">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
                Nuestra Solución
              </span>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                Un mercado digital de fletes
              </h2>
              
              <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed">
                <p>
                  La plataforma funciona como un <strong className="text-black">mercado digital de fletes</strong>, donde los transportistas pueden registrarse y ofrecer sus servicios.
                </p>
                <p>
                  Los clientes pueden <strong className="text-black">buscar, comparar y contactar directamente</strong> al transportista que mejor se adapte a sus necesidades, sin tarifas fijas ni pagos obligatorios dentro del sistema.
                </p>
              </div>

              {/* Características clave */}
              <div className="mt-8 space-y-4">
                {[
                  "Búsqueda rápida y eficiente",
                  "Transportistas verificados",
                  "Comunicación directa",
                  "Sin comisiones ocultas"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-800">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};