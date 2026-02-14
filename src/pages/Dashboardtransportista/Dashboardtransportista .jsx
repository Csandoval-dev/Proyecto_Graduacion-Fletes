import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { cerrarSesion } from "../../services/authService";

function DashboardTransportista() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Intentamos la ruta directa (ID exacto)
          const directRef = doc(db, "transportistas", user.uid);
          const directSnap = await getDoc(directRef);

          if (directSnap.exists()) {
            setPerfil(directSnap.data());
          } else {
            // 2. PLAN B: Si el ID no coincide, buscamos por correo en la colección transportistas
            // Esto sucede si el Admin creó el documento con un ID aleatorio en lugar del UID del usuario
            const transCol = collection(db, "transportistas");
            const q = query(transCol, where("email", "==", user.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              // Si lo encuentra por correo, tomamos ese
              setPerfil(querySnapshot.docs[0].data());
            } else {
              // 3. PLAN C: Si no existe en transportistas del todo, sacamos lo básico de 'usuarios'
              const userSnap = await getDoc(doc(db, "usuarios", user.uid));
              if (userSnap.exists()) {
                setPerfil(userSnap.data());
              }
            }
          }
        } catch (error) {
          console.error("Error cargando perfil:", error);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">CARGANDO FLETIA...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Superior */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Panel de Control</p>
            <h1 className="text-3xl font-black text-slate-900">Hola, {perfil?.nombre || "Transportista"}</h1>
          </div>
          <button onClick={cerrarSesion} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all">
            Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INFO CARD */}
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-10 -mt-10"></div>
            
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Información Profesional</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
              <section>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Estado del Servicio</p>
                <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${perfil?.disponible ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {perfil?.disponible ? 'Disponible para fletes' : 'Fuera de servicio'}
                </p>
              </section>

              <section>
                <p className="text-[10px] font-black text-orange-600 uppercase mb-2 tracking-widest">Zona de Operación</p>
                <p className="text-2xl font-black text-slate-900 uppercase">{perfil?.zona || "No definida"}</p>
              </section>

              <section>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Contacto Directo</p>
                <p className="text-lg font-bold text-slate-900">{perfil?.telefono || "Sin teléfono"}</p>
              </section>

              <section>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Correo de Enlace</p>
                <p className="text-lg font-bold text-slate-900">{perfil?.email}</p>
              </section>
            </div>

            <button onClick={() => navigate("/perfil-transportista")} className="mt-12 w-full sm:w-auto bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 hover:scale-105 transition-transform">
              Actualizar Datos de Fletia
            </button>
          </div>

          {/* STATUS CARD */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-300">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Verificación de Identidad</p>
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${perfil?.verificado ? 'bg-blue-600' : 'bg-orange-500 animate-pulse'}`}>
                  {perfil?.verificado ? '✓' : '!'}
                </div>
                <div>
                  <p className="text-xl font-black tracking-tighter">
                    {perfil?.verificado ? 'VERIFICADO' : 'EN TRÁMITE'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Socio Fletia HND</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white">
              <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-2">Estado de Cuenta</p>
              <p className="text-2xl font-black uppercase">Activa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTransportista;