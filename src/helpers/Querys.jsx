import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

//componente principal
function Usuarios(){
 const [usuarios, setUsuarios] = useState([]);
 const [clientes, setClientes] = useState([]);
 const [transportistas, setTransportistas] = useState([]);
 const [filtro, setFiltro] = useState("todos");
 const [usuariosOriginales, setUsuariosOriginales] = useState([]);
//FUncion para carga los usurios al montar el componente
 useEffect(() => {
  // Función para cargar los usuarios desde Firestore
    const cargarUsuarios = async()=>{
        try{
            const querySnapshot = await getDocs(collection(db, "usuarios"))
            const usuariosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsuarios(usuariosData);
            setUsuariosOriginales(usuariosData);

            const q = query(collection(db, "usuarios"), where("rol", "==", "cliente"));
            const querySnapshot2 = await getDocs(q);
            const clientesData = querySnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClientes(clientesData);

            const t = query(collection(db, "usuarios"), where("rol", "==", "transportista"));
            const querySnapshot3 = await getDocs(t);
            const transportistasData = querySnapshot3.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransportistas(transportistasData);

            const tr=query(collection(db,"transportistas"), where("disponible", "==", true));
            const querySnapshot4 = await getDocs(tr);
            const transportistasActivosData = querySnapshot4.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransportistas(transportistasActivosData);
            
            
        }catch(error){
            console.error("Error al cargar los usuarios: ", error);
        }
    }
    cargarUsuarios();
 }, []);
 //Filtro
const filtrarUsuarios = (rol) => {
    setFiltro(rol);
};
// Filtrar los usuarios según el rol seleccionado
const usuariosFiltrados =
  filtro === "todos"
    ? usuariosOriginales
    : usuariosOriginales.filter((usuario) => usuario.rol === filtro);
 


return(
    <>
    <select value={filtro} onChange={(e) => filtrarUsuarios(e.target.value)} className="mb-4 p-2 border rounded">
      <option value="todos">Todos</option>
      <option value="cliente">Clientes</option>
      <option value="transportista">Transportistas</option>
    </select>

    <div className="bg-white shadow-md rounded-2xl p-5 w-60">
      <h3 className="text-gray-500 text-sm">Usuarios registrados</h3>
            <p className="text-3xl font-bold text-indigo-600">{usuariosFiltrados.length}</p>
            <p></p>
      <input type="text"  placeholder="Escribe nombre"  />
      <div className=""><input type="checkbox" id="Hola" />
      <label htmlFor="Hola">Hola que tal</label>
     <label htmlFor="">
      <input type="radio" name="" id="" />
      Hola que tal
     </label>
     <label htmlFor="">
      <input type="radio" name="" id="" />
      Hola que tal como va tu dia
     </label>
      </div>
    </div>
    <div className="bg-white shadow-md rounded-2xl p-5 w-60">
      <h3>Transportistas activos</h3>
      <p className="text-3xl font-bold text-indigo-600">{transportistas.length}</p>
    </div>
    </>
  
)



}
export default Usuarios;