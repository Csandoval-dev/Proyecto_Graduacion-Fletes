// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas públicas
import Landing from "./pages/landing/Landing";
import Login from "./pages/login/login";
import Register from "./pages/registro/register";

// Dashboards por rol
import DashboardCliente from "./pages/DashboardCliente/DashboardCliente";
import DashboardTransportista from "./pages/Dashboardtransportista/Dashboardtransportista "
import DashboardAdmin from "./pages/DashboardAdmin/DashboardAdmin";

// Páginas específicas de transportista
import PerfilTransportista from "./pages/transportista/PerfilTransportista";

// Componentes de enrutamiento
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        
        {/* Landing page - Página principal */}
        <Route path="/" element={<Landing />} />
        
        {/* Login - Inicio de sesión */}
        <Route path="/login" element={<Login />} />
        
        {/* Registro de cliente */}
        <Route path="/register" element={<Register />} />
        
        {/* Registro de transportista */}
        <Route 
          path="/register-transportista" 
          element={<PerfilTransportista />} 
        />

        {}
        
        {}
        <Route 
          path="/dashboard" 
          element={<RoleBasedRoute />} 
        />

        {/* ========================================
            RUTAS PROTEGIDAS - CLIENTE
            Solo accesibles para usuarios con rol "cliente"
        ======================================== */}
        
        <Route 
          path="/cliente/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardCliente />
            </ProtectedRoute>
          } 
        />

        {/* ========================================
            RUTAS PROTEGIDAS - TRANSPORTISTA
            Solo accesibles para usuarios con rol "transportista"
        ======================================== */}
        
        <Route 
          path="/transportista/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardTransportista />
            </ProtectedRoute>
          } 
        />
        
        {/* Perfil profesional de transportista */}
        <Route 
          path="/transportista/perfil" 
          element={
            <ProtectedRoute>
              <PerfilTransportista />
            </ProtectedRoute>
          } 
        />
        
        {/* 
          NOTA: Mantener compatibilidad con ruta antigua
          /perfil-transportista redirige a /transportista/perfil
        */}
        <Route 
          path="/perfil-transportista" 
          element={
            <ProtectedRoute>
              <PerfilTransportista />
            </ProtectedRoute>
          } 
        />

        {/* ========================================
            RUTAS PROTEGIDAS - ADMINISTRADOR
            Solo accesibles para usuarios con rol "administrador"
        ======================================== */}
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardAdmin />
            </ProtectedRoute>
          } 
        />

        {/* ========================================
            RUTA 404 - NO ENCONTRADA
            TODO: Crear página 404 personalizada
        ======================================== */}
        
        {/* Por ahora redirige al landing */}
        <Route 
          path="*" 
          element={<Landing />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;