// src/components/landing/CarouselVisual.jsx
import { motion } from "framer-motion";

export const CarouselVisual = () => {
  const funcionalidades = [
    {
      titulo: "Geolocalización en tiempo real",
      descripcion: "Encuentra transportistas cerca de ti y rastrea tu carga en cada momento",
      imagen: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=800",
      tag: "Tecnología GPS"
    },
    {
      titulo: "Comunicación directa",
      descripcion: "Chat integrado para coordinar todos los detalles sin intermediarios",
      imagen: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=800",
      tag: "Chat en vivo"
    },
    {
      titulo: "Transparencia y confianza",
      descripcion: "Sistema de calificaciones y perfiles verificados para tu seguridad",
      imagen: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
      tag: "Verificación"
    },
    {
      titulo: "Historial y control",
      descripcion: "Accede a todos tus fletes anteriores y gestiona tu actividad",
      imagen: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      tag: "Dashboard"
    }
  ];

  return (
    <section 
      className="py-16 md:py-24 lg:py-32 bg-black text-white"
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
          <span className="inline-block px-4 py-2 bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Tecnología que conecta
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Todas las herramientas que necesitas en una sola plataforma
          </p>
        </motion.div>

        {/* Grid de funcionalidades */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {funcionalidades.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative h-64 md:h-80 overflow-hidden rounded-2xl mb-6">
                {/* Imagen */}
                <img
                  src={item.imagen}
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Tag flotante */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30">
                    {item.tag}
                  </span>
                </div>

                {/* Contenido sobre la imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:translate-y-[-4px] transition-transform duration-300">
                    {item.titulo}
                  </h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed opacity-90">
                    {item.descripcion}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats o info adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
            <div className="text-sm text-gray-400">Uptime garantizado</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
            <div className="text-sm text-gray-400">Soporte disponible</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">100%</div>
            <div className="text-sm text-gray-400">Seguro y verificado</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2">5 min</div>
            <div className="text-sm text-gray-400">Registro promedio</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};