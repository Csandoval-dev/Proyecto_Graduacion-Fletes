import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { obtenerRolUsuario } from "../services/authService";

function RoleBasedRoute() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Escuchamos si el usuario está logueado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // si el usuario esta loguedo obtenemos su rol
        const resultado = await obtenerRolUsuario(user.uid);
        if (resultado.success) {
          setUserRole(resultado.rol);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Verificando...</div>;

  // 4Redirección e según el rol obtenido
  if (!userRole) return <Navigate to="/login" replace />;

  if (userRole === "cliente") return <Navigate to="/cliente/dashboard" replace />;
  if (userRole === "transportista") return <Navigate to="/transportista/dashboard" replace />;
  if (userRole === "administrador") return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
}

export default RoleBasedRoute;