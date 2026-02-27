import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // Falta esta importación
import { auth } from "./firebase/firebase"; // Asegúrate de que la ruta sea correcta
import React, { useEffect, useRef } from 'react'; 

// Configuración de Cloud Messaging
import { solicitarPermisoNotificaciones, escucharNotificaciones } from './services/notificacionesService';

// Importaciones de tus páginas...
import Landing from "./pages/landing/Landing";
import Login from "./pages/login/login";
import Register from "./pages/registro/register";
import DashboardCliente from "./pages/DashboardCliente/DashboardCliente";
import DashboardTransportista from "./pages/Dashboardtransportista/Dashboardtransportista ";
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin";
import PerfilTransportista from "./pages/transportista/PerfilTransportista";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
 const notificacionesIniciadasRef = useRef(false); // ← controla que solo se inicie una vez

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !notificacionesIniciadasRef.current) {
        notificacionesIniciadasRef.current = true; // ← marca como iniciado
        
        await solicitarPermisoNotificaciones(user.uid);
        await escucharNotificaciones((payload) => {
          console.log('Nueva notificación:', payload);
        });
      }
      
      if (!user) {
        notificacionesIniciadasRef.current = false; // ← reset al cerrar sesión
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/register-transportista" element={<PerfilTransportista />} />
        <Route path="/dashboard" element={<RoleBasedRoute />} />

        {/* Rutas Protegidas */}
        <Route path="/cliente/dashboard" element={<ProtectedRoute><DashboardCliente /></ProtectedRoute>} />
        <Route path="/transportista/dashboard" element={<ProtectedRoute><DashboardTransportista /></ProtectedRoute>} />
        <Route path="/transportista/perfil" element={<ProtectedRoute><PerfilTransportista /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><DashboardAdmin /></ProtectedRoute>} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;