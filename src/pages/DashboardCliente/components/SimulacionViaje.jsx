import { useEffect, useRef, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { doc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

const iconoCamion = new L.DivIcon({
  className: "camion-simulado-marker",
  html: '<div style="font-size:32px; text-align:center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">🚚</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const iconoPuntoInicio = new L.DivIcon({
  className: "punto-inicio-marker",
  html: `<div style="
    background:#2563eb; color:white; border-radius:50%;
    width:34px; height:34px; display:flex; align-items:center; justify-content:center;
    font-weight:bold; font-size:15px; border:3px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);
  ">T</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function interpolar(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function generarPuntoInicial(origen) {
  const offsetLat = (Math.random() - 0.5) * 0.04;
  const offsetLng = (Math.random() - 0.5) * 0.04;
  return [origen[0] + offsetLat, origen[1] + offsetLng];
}

/**

 */
let contadorInstancias = 0;
let instanciaActivaGlobal = null; // compartida entre TODOS los montajes de este componente

function SimulacionViaje({ solicitudId, estadoActual, origen, destino }) {
  const map = useMap();
  const [posicion, setPosicion] = useState(null);
  const [puntoInicio, setPuntoInicio] = useState(null);
  const timersRef = useRef([]);

  useEffect(() => {
    const tieneCoords = origen?.lat && origen?.lng && destino?.lat && destino?.lng;
    const enCurso = estadoActual === "en_camino" || estadoActual === "recogido";
    if (!enCurso || !tieneCoords) {
      return;
    }

    contadorInstancias += 1;
    const miId = contadorInstancias;
    instanciaActivaGlobal = miId; // este montaje toma el control inmediatamente, desplazando a cualquier anterior

    console.log(`[Simulación #${miId}] 🚚 Motor evaluando — estado actual: "${estadoActual}"`);
    timersRef.current = [];

    // Soy el dueño actual? Si otro motor más nuevo tomó el control, abortar.
    const soyDueno = () => instanciaActivaGlobal === miId;

    const origenPos  = [origen.lat, origen.lng];
    const destinoPos = [destino.lat, destino.lng];

    const limpiar = (id) => { clearInterval(id); clearTimeout(id); };

    const escribirEstado = async (estado, descripcion) => {
      if (!soyDueno()) {
        console.log(`[Simulación #${miId}] Abortado antes de escribir "${estado}" (ya no soy el dueño)`);
        return;
      }
      try {
        console.log(`[Simulación #${miId}] → Firestore: "${estado}"`);
        const ref = doc(db, "solicitudes", solicitudId);
        await updateDoc(ref, {
          estado,
          historial: arrayUnion({ estado, descripcion, fecha: Timestamp.now() }),
        });
        console.log(`[Simulación #${miId}] ✅ Confirmado: "${estado}"`);
      } catch (err) {
        console.error(`[Simulación #${miId}] ❌ Error en "${estado}":`, err);
      }
    };

    const animarTramo = (desde, hasta, pasos) => {
      return new Promise((resolve) => {
        if (pasos <= 0) {
          if (soyDueno()) setPosicion(hasta);
          resolve();
          return;
        }
        let t = 0;
        const id = setInterval(() => {
          if (!soyDueno()) { limpiar(id); resolve(); return; }
          t += 1;
          const progreso = t / pasos;
          if (progreso >= 1) {
            limpiar(id);
            setPosicion(hasta);
            resolve();
            return;
          }
          const nuevaPos = interpolar(desde, hasta, progreso);
          setPosicion(nuevaPos);
          if (map) map.panTo(nuevaPos, { animate: true, duration: 0.4 });
        }, 250);
        timersRef.current.push(id);
      });
    };

    const esperar = (ms) => new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      timersRef.current.push(id);
    });

    (async () => {
      if (estadoActual === "en_camino") {
        if (!soyDueno()) return;

        const inicioPos = generarPuntoInicial(origenPos);
        setPuntoInicio(inicioPos);
        setPosicion(inicioPos);
        if (map) map.panTo(inicioPos, { animate: true });

        await animarTramo(inicioPos, origenPos, 50);
        if (!soyDueno()) return;

        await escribirEstado("recogido", "Tu carga fue recogida");
        if (!soyDueno()) return;

        await esperar(1500);
        if (!soyDueno()) return;

        await animarTramo(origenPos, destinoPos, 70);
        if (!soyDueno()) return;

        await escribirEstado("entregado", "Tu carga llegó al destino");
      }

      if (estadoActual === "recogido") {
        if (!soyDueno()) return;

        setPosicion(origenPos);
        if (map) map.panTo(origenPos, { animate: true });

        await animarTramo(origenPos, destinoPos, 70);
        if (!soyDueno()) return;

        await escribirEstado("entregado", "Tu carga llegó al destino");
      }
    })();

    // Cleanup: este montaje deja de ser el dueño SOLO si nadie más nuevo
    // ya tomó el control (evita pisar a un montaje posterior por error).
    return () => {
      timersRef.current.forEach(limpiar);
      timersRef.current = [];
      if (instanciaActivaGlobal === miId) {
        console.log(`[Simulación #${miId}] Desmontado, liberando control`);
      }
    };
  }, [estadoActual, origen?.lat, origen?.lng, destino?.lat, destino?.lng, solicitudId, map]);

  return (
    <>
      {puntoInicio && <Marker position={puntoInicio} icon={iconoPuntoInicio} />}
      {posicion && <Marker position={posicion} icon={iconoCamion} />}
    </>
  );
}

export default SimulacionViaje;