import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// --- COMPONENTES DE ICONOS 
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
  // --- ESTADOS DEL COMPONENTE ---
  const [usuarios, setUsuarios] = useState([]); // Lista principal de usuarios
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [filtroRol, setFiltroRol] = useState("todos"); // Filtro por rol
  const [searchTerm, setSearchTerm] = useState(""); // Buscador de texto
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" }); // Notificaciones (Éxito/Error)

  // Carga de datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para obtener usuarios de Firestore
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const snapUsuarios = await getDocs(collection(db, "usuarios"));
      const listaCompleta = snapUsuarios.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsuarios(listaCompleta);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función principal para activar/desactivar (Reforzada)
  const toggleActivarUsuario = async (usuario) => {
    // Bloqueo de seguridad
    if (usuario.rol?.toLowerCase() === "administrador") {
      lanzarNotificacion("Acción bloqueada: No se puede desactivar a un Administrador.", "error");
      return;
    }

    try {
      const nuevoEstado = !usuario.activo;
      
      //  Actualizar en la colección principal 'usuarios'
      await updateDoc(doc(db, "usuarios", usuario.id), {
        activo: nuevoEstado
      });

      //  Si es transportista, intentar actualizar su perfil técnico
      if (usuario.rol?.toLowerCase() === "transportista") {
        try {
          await updateDoc(doc(db, "transportistas", usuario.id), {
            activo: nuevoEstado
          });
        } catch (err) {
          // Si no existe el documento en transportistas, el sistema no se detiene
          console.warn("Aviso: No se encontró perfil en colección 'transportistas'.");
        }
      }

      // Actualizar estado local para que la UI cambie al instante
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: nuevoEstado } : u));
      
      lanzarNotificacion(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`, "exito");

    } catch (error) {
      console.error("Error al actualizar:", error);
      lanzarNotificacion("Error de conexión. Revisa los permisos de Firestore.", "error");
    }
  };

  // Funcion Auxiliar para mostrar notificaciones temporales
  const lanzarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3500);
  };

  // Lógica de filtrado de la tabla
  const usuariosFiltrados = usuarios.filter(u => {
    const busqueda = searchTerm.toLowerCase();
    const nombre = (u.nombre || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    
    const coincideBusqueda = nombre.includes(busqueda) || email.includes(busqueda);
    const coincideRol = filtroRol === "todos" || u.rol?.toLowerCase() === filtroRol.toLowerCase();
    
    return coincideBusqueda && coincideRol;
  });

  // Estilos de los badges según el rol
  const getBadgeRol = (rol) => {
    const r = rol?.toLowerCase();
    if (r === "cliente") return "bg-blue-100 text-blue-700";
    if (r === "transportista") return "bg-purple-100 text-purple-700";
    if (r === "administrador") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">

      {/* --- NOTIFICACIÓN TIPO TOAST --- */}
      {mensaje.texto && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl border-l-4 transition-all animate-bounce ${
          mensaje.tipo === "exito" ? "bg-white border-green-500 text-green-700" : "bg-white border-red-500 text-red-700"
        }`}>
          <div className="flex items-center gap-3 font-bold">
            {mensaje.tipo === "exito" ? <IconCheck /> : <IconX />}
            <span>{mensaje.texto}</span>
          </div>
        </div>
      )}

      {/* --- WIDGETS DE ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Usuarios</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{usuarios.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-blue-500 uppercase">Clientes</p>
          <p className="text-3xl font-black text-blue-600 mt-1">
            {usuarios.filter(u => u.rol?.toLowerCase() === "cliente").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-purple-500 uppercase">Transportistas</p>
          <p className="text-3xl font-black text-purple-600 mt-1">
            {usuarios.filter(u => u.rol?.toLowerCase() === "transportista").length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-red-500 uppercase">Admins</p>
          <p className="text-3xl font-black text-red-600 mt-1">
            {usuarios.filter(u => u.rol?.toLowerCase() === "administrador").length}
          </p>
        </div>
      </div>

      {/* --- BUSCADOR Y FILTROS --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          {["todos", "cliente", "transportista", "administrador"].map(r => (
            <button
              key={r}
              onClick={() => setFiltroRol(r)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                filtroRol === r ? "bg-slate-900 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* --- TABLA DE RESULTADOS --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Usuario</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Rol</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><IconUser /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.nombre || "N/N"}</p>
                        <p className="text-[10px] font-mono text-slate-400">ID: {u.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getBadgeRol(u.rol)}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.activo ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><IconCheck /> ACTIVO</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-bold"><IconX /> INACTIVO</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* ACCIÓN CONDICIONAL */}
                    {u.rol?.toLowerCase() !== "administrador" ? (
                      <button
                        onClick={() => toggleActivarUsuario(u)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm ${
                          u.activo 
                            ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" 
                            : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                        }`}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    ) : (
                      <span className="text-slate-300 text-[10px] font-bold italic uppercase">Protegido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;