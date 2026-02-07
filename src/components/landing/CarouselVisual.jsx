// src/components/landing/CarouselVisual.jsx
import { motion } from "framer-motion";

export const CarouselVisual = () => {
  const funcionalidades = [
    {
      titulo: "Geolocalización en tiempo real",
      descripcion: "Encuentra transportistas cerca de ti y rastrea tu carga en cada momento",
      imagen: "https://img.freepik.com/foto-gratis/hombre-trabajando-como-conductor-camion_23-2151489744.jpg?semt=ais_hybrid&w=740&q=80",
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
      imagen: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAS0AAACoCAMAAACCN0gDAAAAwFBMVEXu7u4AAAD////b29vr6+ufn5/+v0P39/djY2NLS0v3ukH/wkT/xUX6+vr/v0Pe3t5SUlJwcHDprz0mJiYrKyuPj4+zs7PNzc2srKxBQUEfHx/0t0BZWVnU1NQ8PDx/f3+Zcyi9jjLCwsJra2vdpjp4Wh8ZGRkZEwYREREvIwxiShrPnDczMzNiYmJDMhGMjIxVQBakeysSDQR+XyEoHgq1iDCNaiW7u7trURyJZyR9XiESEhJaRBc3KQ7iqjy5izB3V0jwAAAEw0lEQVR4nO3b6VLiWhQF4HDMIBlEQEIAmUFaUSalkW6H93+rziEQkpzDxlTdglxqfb+0V9tFVu2dyWpFAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4qcLVhSicoCzjPnchWsYJ2ro+91H+V/JoKwW0lQbaSgNtpYG20kBbaaCtNNBWGplpa/FI56M3Oi/Xj+R/6fyOjgOZaettPSLz2Sv98/0+nVdu6dz9SV2ZaWsyeCLz4XhC5trqmcyrlQcyV37yITPT1ru1pOJRx/xN5eWVUqTyWqFZo/IXw/tF5YGstDWa2wMqn4ytbyq/vmIVKq8ojPwUK2YcOfFxWWnrsWGVqFV81y1yFSuMudQqrhgjV7HA2A/eK2WlrSdbN4lVHHVsvbQ+nJddxlTiPF9rMlZtHc5fFMa8458yI20t5pZuEavoL6JOndherhijVnHqt0ENz8phzDn6KbPS1kjXdWoVn6wbchX9RSRXccXz6eFbrgLPj9xj5DLT1sz26yJWcc3z0p+DucePVj04PM9VnlcPnrjuVZ4fX8WztjX70s0tfWP3TWm4yd/D2IzGpj4IpmzKHCPg8KMNv2PNTXzn7f4kiFn4l93g2KvMkObKoZ0+72yNxpalC+zxbJu/lWwxtuzl7inp1mAy2jZ+aEtjtrszK3vS+PCMnnsT13qyLsuaL/b5UqjL0of7uN4TD9bJ7/PbgqSMyOmrrYh57/CnPXdb/vjE6rqxSu+x/EP3T/CxwYuf64XxqcbuyR+E8YmfnVrVZNdt4sOeva1c7js2Ot3PRLwYxOqMDl5wBPHxEQ42Pj6OcOHTYttcIO/oM9CWfzIPNTqSvBPWZZWGYlx3IwebF/N8ZHyakn++GKnbpT9pFtrKzXd1WF1ZPOrucltWZi7fDI9WejtfVMO8LMv303XsBjUTbZnh7Aw+JPFkP1vCnm7a2M+GJqsjcuqSvqeIzB7xcJSVtj7t4FrnM2XD82efJy4BG3WN3sRWb59XJa9l7iObqIlx1traLKI5aFh8eJIn8c1NmX+tbHzxXLaKwSIqqnNgeIJFVIN1lLwh3SyiU9hcDJTst9Xg9w3zxWuJr6L4rDjhozVYP8553hWfFfkiOs1izeVH7YmryEfP6OXvq7xO8f7gF19Exa23+YM5k8xmttryT0s3Y36tm41NS7KKr7Zudvnd/XBgJu/GcsEiKi5/MVrxV0oVDrfmL6LKz2cPniK7KF77P1XgJT73jGPPihloa2k3usGjjD8+djf5y4zFmA/e5svZd0NcRf9+q7B9ruv3HPGqWFT8wQu+bDclV0XN8Qdv+6V6ZBUz0Jb5FTawGA4GyeH5tMfhr3veOiVhFYusFzb07BnCKmqGG85bfiWsYr2qauHJrN90yDeo529rNo6eqmbL5BvSYayfYTdxYitPvehrrWkvcRNQ0yrR23Mt+RR47UUvDHcueVU8f1sf8V+rfk4SV8VEO7PEbJUTw9BPXPVaiUed5Gzd1ug85vxt/Z+grTTQVhpoKw20lQbaSgNtpYG20kBbaZykrYv5X1G1E7SlrLQL4Z2gLEW9GKdoCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODC/QOl/3moeYoWIgAAAABJRU5ErkJggg==",
      tag: "Verificación"
    },
    {
      titulo: "Historial y control",
      descripcion: "Accede a todos tus fletes anteriores y gestiona tu actividad",
      imagen: "https://www.datasunrise.com/wp-content/uploads/2024/09/in_table-2.webp",
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