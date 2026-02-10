// src/pages/DashboardAdmin/components/GestionUsuarios.jsx
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// Iconos SVG
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };
const cargaTransportistas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "transportistas"));
    const usuariosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsuarios(usuariosData);
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  } finally {
    setLoading(false);
  }
};
  const toggleActivarUsuario = async (usuarioId, estadoActual) => {
    try {
      await updateDoc(doc(db, "usuarios", usuarioId), {
        activo: !estadoActual
      });
      // Actualizar el estado local
      setUsuarios(usuarios.map(u => 
        u.id === usuarioId ? { ...u, activo: !estadoActual } : u
      ));
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar el usuario");
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideRol = filtroRol === "todos" || usuario.rol === filtroRol;
    return coincideBusqueda && coincideRol;
  });

  // Obtener badge de rol
  const getBadgeRol = (rol) => {
    const styles = {
      cliente: "bg-blue-100 text-blue-700",
      transportista: "bg-purple-100 text-purple-700",
      administrador: "bg-red-100 text-red-700"
    };
    return styles[rol] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Usuarios</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{usuarios.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Clientes</p>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {usuarios.filter(u => u.rol === "cliente").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Transportistas</p>
          <p className="text-3xl font-black text-purple-600 mt-1">
            {usuarios.filter(u => u.rol === "transportista").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Admins</p>
          <p className="text-3xl font-black text-red-600 mt-1">
            {usuarios.filter(u => u.rol === "administrador").length}
          </p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Filtro por rol */}
          <div className="flex gap-2">
            {["todos", "cliente", "transportista", "administrador"].map((rol) => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filtroRol === rol
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {rol}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <IconUser />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{usuario.nombre}</p>
                        <p className="text-xs text-slate-500">ID: {usuario.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{usuario.email}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-slate-700">{usuario.telefono || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeRol(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {usuario.activo ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-bold">
                        <IconCheck /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-bold">
                        <IconX /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleActivarUsuario(usuario.id, usuario.activo)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        usuario.activo
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {usuario.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-sm">No se encontraron usuarios con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionUsuarios;