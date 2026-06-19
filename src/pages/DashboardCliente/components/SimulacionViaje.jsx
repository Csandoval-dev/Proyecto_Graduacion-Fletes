import { useEffect, useRef, useState } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/firebase";

// Ícono del camión emoji, igual estilo que tu ejemplo HTML
const iconoCamion = new L.DivIcon({
  className: "camion-simulado-marker",
  html: '<div style="font-size:32px; text-align:center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">🚚</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Interpola linealmente entre dos puntos [lat, lng]
function interpolar(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
}

// Punto de partida simulado: un poco "alejado" del origen, en una dirección aleatoria leve,
// solo para que se vea que el camión viene de algún lado antes de llegar al origen.
function generarPuntoInicial(origen) {
  const offsetLat = (Math.random() - 0.5) * 0.04; // ~4km de variación
  const offsetLng = (Math.random() - 0.5) * 0.04;
  return [origen[0] + offsetLat, origen[1] + offsetLng];
}

/**
 * SimulacionViaje
 * Anima un marcador de camión en línea recta:
 *   puntoInicial -> origen  (tramo 1: "en_camino")
 *   origen -> destino       (tramo 2: después de "recogido")
 * Al llegar a cada punto, actualiza el estado en Firestore automáticamente.
 *
 * Props:
 * - solicitudId: id del documento en la colección "solicitudes"
 * - estadoActual: estado actual de la solicitud (para saber cuándo arrancar)
 * - origen: { lat, lng }
 * - destino: { lat, lng }
 */
function SimulacionViaje({ solicitudId, estadoActual, origen, destino }) {
  const map = useMap();
  const [posicion, setPosicion] = useState(null);
  const intervaloRef = useRef(null);
  const yaSimulandoRef = useRef(false); // evita doble-arranque por re-renders

  useEffect(() => {
    // Solo arrancamos la simulación cuando el estado pasa a "en_camino"
    // y no hay coordenadas completas, no hacemos nada.
    const tieneCoords = origen?.lat && origen?.lng && destino?.lat && destino?.lng;
    if (estadoActual !== "en_camino" || !tieneCoords || yaSimulandoRef.current) {
      return;
    }

    yaSimulandoRef.current = true;

    const origenPos  = [origen.lat, origen.lng];
    const destinoPos = [destino.lat, destino.lng];
    const inicioPos  = generarPuntoInicial(origenPos);

    const actualizarEstadoFirestore = async (nuevoEstado, descripcion) => {
      try {
        const ref = doc(db, "solicitudes", solicitudId);
        await updateDoc(ref, {
          estado: nuevoEstado,
          historial: arrayUnion({
            estado: nuevoEstado,
            descripcion,
            fecha: serverTimestamp(),
          }),
        });
      } catch (err) {
        console.error("Error actualizando estado de simulación:", err);
      }
    };

    // ── Tramo 1: punto inicial -> origen ──
    let t = 0;
    const PASOS_TRAMO_1 = 60;      // cantidad de "frames"
    const INTERVALO_MS  = 120;     // velocidad de animación

    setPosicion(inicioPos);
    if (map) map.panTo(inicioPos, { animate: true });

    intervaloRef.current = setInterval(() => {
      t += 1;
      const progreso = t / PASOS_TRAMO_1;

      if (progreso >= 1) {
        // Llegó al origen → marcar como "recogido" en Firestore
        clearInterval(intervaloRef.current);
        setPosicion(origenPos);
        actualizarEstadoFirestore("recogido", "Tu carga fue recogida");

        // Pequeña pausa simulando carga, luego inicia tramo 2
        setTimeout(() => {
          iniciarTramo2(origenPos, destinoPos, actualizarEstadoFirestore, map, setPosicion, intervaloRef);
        }, 2000);
        return;
      }

      const nuevaPos = interpolar(inicioPos, origenPos, progreso);
      setPosicion(nuevaPos);
      if (map) map.panTo(nuevaPos, { animate: true, duration: 0.4 });
    }, INTERVALO_MS);

    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoActual, origen?.lat, origen?.lng, destino?.lat, destino?.lng, solicitudId]);

  if (!posicion) return null;

  return <Marker position={posicion} icon={iconoCamion} />;
}

// ── Tramo 2: origen -> destino ──
function iniciarTramo2(origenPos, destinoPos, actualizarEstadoFirestore, map, setPosicion, intervaloRef) {
  let t = 0;
  const PASOS_TRAMO_2 = 90;
  const INTERVALO_MS  = 120;

  intervaloRef.current = setInterval(() => {
    t += 1;
    const progreso = t / PASOS_TRAMO_2;

    if (progreso >= 1) {
      clearInterval(intervaloRef.current);
      setPosicion(destinoPos);
      actualizarEstadoFirestore("entregado", "Tu carga llegó al destino");
      return;
    }

    const nuevaPos = interpolar(origenPos, destinoPos, progreso);
    setPosicion(nuevaPos);
    if (map) map.panTo(nuevaPos, { animate: true, duration: 0.4 });
  }, INTERVALO_MS);
}

export default SimulacionViaje;