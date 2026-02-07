// src/components/landing/Footer.jsx
import { motion } from "framer-motion";

export const Footer = () => {
  const enlaces = {
    plataforma: [
      { nombre: "¿Cómo funciona?", href: "#como-funciona" },
      { nombre: "Beneficios", href: "#beneficios" },
      { nombre: "Para transportistas", href: "#transportistas" },
      { nombre: "Para clientes", href: "#clientes" }
    ],
    soporte: [
      { nombre: "Centro de ayuda", href: "#ayuda" },
      { nombre: "Términos y condiciones", href: "#terminos" },
      { nombre: "Política de privacidad", href: "#privacidad" },
      { nombre: "Contacto", href: "#contacto" }
    ],
    social: [
      { nombre: "Facebook", href: "#" },
      { nombre: "Instagram", href: "#" },
      { nombre: "WhatsApp", href: "#" }
    ]
  };

  return (
    <footer 
      id="contacto"
      className="bg-black text-white pt-16 md:pt-20 pb-8"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          
          {/* Columna 1: Logo y descripción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-base">F</span>
              </div>
              <span className="text-xl font-bold">
                Fletia<span className="font-normal">HDN</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Plataforma digital que conecta clientes con transportistas independientes en San Pedro Sula de forma rápida, segura y organizada.
            </p>
            <div className="text-sm text-gray-400">
              <p className="mb-1">📍 San Pedro Sula, Honduras</p>
              <p>📧 contacto@fletiaHDN.com</p>
            </div>
          </motion.div>

          {/* Columna 2: Plataforma */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-base font-bold mb-4">Plataforma</h3>
            <ul className="space-y-3">
              {enlaces.plataforma.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-block"
                  >
                    {link.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Columna 3: Soporte */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-base font-bold mb-4">Soporte</h3>
            <ul className="space-y-3">
              {enlaces.soporte.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-block"
                  >
                    {link.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Columna 4: Redes sociales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-base font-bold mb-4">Síguenos</h3>
            <ul className="space-y-3 mb-6">
              {enlaces.social.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-block"
                  >
                    {link.nombre}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div>
              <p className="text-sm text-gray-400 mb-3">
                Recibe noticias y actualizaciones
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/40 transition-colors duration-300"
                />
                <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-300">
                  →
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="text-center md:text-left">
              <p className="mb-1">
                Proyecto de Graduación – Ingeniería en Informática
              </p>
              <p>
                Ceutec• San Pedro Sula
              </p>
            </div>
            <div className="text-center md:text-right">
              <p>© 2026 Carlos Sandoval</p>
              <p className="text-xs mt-1">Todos los derechos reservados</p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};