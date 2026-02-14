// src/pages/DashboardCliente/components/MiPerfil.jsx
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const IconUser = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconPhone = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

function MiPerfil({ usuario }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [datosEditados, setDatosEditados] = useState({
    nombre: usuario?.nombre || "",
    telefono: usuario?.telefono || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosEditados(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);

      const userRef = doc(db, "usuarios", usuario.uid);
      await updateDoc(userRef, {
        nombre: datosEditados.nombre,
        telefono: datosEditados.telefono
      });

      alert(" Perfil actualizado correctamente");
      setEditando(false);
      
      // Recargar página para actualizar datos en toda la UI
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      alert("Error al guardar cambios");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setDatosEditados({
      nombre: usuario?.nombre || "",
      telefono: usuario?.telefono || ""
    });
    setEditando(false);
  };

  return (
    <div className="space-y-6">

      {/* Tarjeta principal de perfil */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header de la tarjeta */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
              <IconUser />
            </div>
            <div>
              <h2 className="text-2xl font-black">{usuario?.nombre}</h2>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Usuario Activo
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="p-8">
          
          {/* Información básica */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Información Personal</h3>
            
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Nombre completo
                </label>
                {editando ? (
                  <input
                    type="text"
                    name="nombre"
                    value={datosEditados.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                    <IconUser />
                    <p className="font-bold text-slate-900">{usuario?.nombre}</p>
                  </div>
                )}
              </div>

              {/* Email (no editable) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Correo electrónico
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-lg border border-slate-200">
                  <IconMail />
                  <p className="font-bold text-slate-500">{usuario?.email}</p>
                  <span className="ml-auto text-xs text-slate-500 italic">No editable</span>
                </div>
              </div>

            </div>
          </div>

          {/* Estado de la cuenta */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Estado de la Cuenta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                  Tipo de cuenta
                </p>
                <p className="text-lg font-black text-green-800 flex items-center gap-2">
                  <IconCheck />
                  Cliente
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  Miembro desde
                </p>
                <p className="text-lg font-black text-blue-800">
                  {usuario?.createdAt?.toDate?.()?.toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || "Fecha no disponible"}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            {editando ? (
              <>
                <button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="flex-1 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
              >
                 Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-bold text-yellow-900 mb-2"> Seguridad de tu cuenta</h3>
        <p className="text-sm text-yellow-800">
          Tu información está protegida. Solo tú puedes ver y editar tus datos personales.
        </p>
      </div>
    </div>
  );
}

export default MiPerfil;