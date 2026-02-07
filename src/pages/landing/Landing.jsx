// src/pages/landing/Landing.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";

// Componentes optimizados
import { Header } from "../../components/landing/Header";
import { Hero } from "../../components/landing/Hero";
import { ProblemaSolucion } from "../../components/landing/ProblemaSolucion";
import { ComoFunciona } from "../../components/landing/ComoFunciona";
import { CarouselVisual } from "../../components/landing/CarouselVisual";
import { Beneficios } from "../../components/landing/Beneficios";
import { Footer } from "../../components/landing/Footer";

function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header fijo */}
      <Header />
      
      {/* Contenido principal */}
      <main>
        {/* Sección Hero */}
        <Hero />
        
        {/* Sección Problema + Solución */}
        <ProblemaSolucion />
        
        {/* Sección Cómo Funciona */}
        <ComoFunciona />
        
        {/* Sección Carousel Visual (Funcionalidades) */}
        <CarouselVisual />
        
        {/* Sección Beneficios */}
        <Beneficios />
      </main>

      {/* Footer */}
      <Footer />

      {/* Botón flotante opcional (WhatsApp o soporte) */}
      <button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center z-40"
        aria-label="Contactar por WhatsApp"
      >
        <span className="text-2xl">💬</span>
      </button>
    </div>
  );
}

export default Landing;