import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";



/** Nombres cortos de meses para la gráfica */
const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/** Filtros de período disponibles */
const FILTROS = [
  { key: "mes",       label: "Este mes"  },
  { key: "trimestre", label: "3 meses"   },
  { key: "anio",      label: "Este año"  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Devuelve la fecha de inicio según el período seleccionado.
 * @param {"mes"|"trimestre"|"anio"} periodo
 * @returns {Date}
 */
function getFechaInicio(periodo) {
  const hoy = new Date();
  if (periodo === "mes") {
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  }
  if (periodo === "trimestre") {
    return new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
  }
  // anio
  return new Date(hoy.getFullYear(), 0, 1);
}

/**
 * Agrupa fletes finalizados por mes y suma ganancias.
 * @param {Array} fletes - Lista de solicitudes finalizadas
 * @param {"mes"|"trimestre"|"anio"} periodo
 * @returns {Array} - [{ mes: "Ene", ganado: 1200 }, ...]
 */
function agruparPorMes(fletes, periodo) {
  const hoy      = new Date();
  const mesActual = hoy.getMonth();
  const anio      = hoy.getFullYear();

  // Cuántos meses mostrar en la gráfica
  const cantMeses = periodo === "mes" ? 1 : periodo === "trimestre" ? 3 : 6;

  // Construir estructura vacía de meses
  const mapa = {};
  for (let i = cantMeses - 1; i >= 0; i--) {
    const m = (mesActual - i + 12) % 12;
    mapa[m] = { mes: MESES[m], ganado: 0 };
  }

  // Sumar ganancias por mes
  fletes.forEach((f) => {
    const fecha = f.createdAt?.toDate?.() || new Date();
    const m     = fecha.getMonth();
    const a     = fecha.getFullYear();
    // Solo incluir si es del año correcto
    if (a === anio && mapa[m] !== undefined) {
      const ganado = f.oferta?.desglose?.pagoTransportista ?? f.pago?.montoPagado ?? 0;
      mapa[m].ganado += ganado;
    }
  });

  return Object.values(mapa);
}

/**
 * Formatea un número como moneda lempira.
 * @param {number} monto
 * @returns {string} "L. 1,250"
 */
function formatLempira(monto) {
  return `L. ${Math.round(monto).toLocaleString("es-HN")}`;
}

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────

/** Tarjeta de métrica individual */
function MetricaCard({ icono, colorIcono, colorFondo, label, valor, sub, subColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: colorFondo }}
      >
        <span style={{ color: colorIcono, fontSize: 18 }}>{icono}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900">{valor}</p>
        {sub && (
          <p className="text-xs mt-1 font-medium" style={{ color: subColor || "#64748b" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/** Fila del historial de fletes */
function FilaFlete({ flete }) {
  const iniciales = flete.nombreUsuario
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "?";

  const ganado = flete.oferta?.desglose?.pagoTransportista ?? flete.pago?.montoPagado ?? 0;

  const fecha = flete.createdAt?.toDate?.()?.toLocaleDateString("es-HN") || "—";

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 last:border-0">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
        {iniciales}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate capitalize">
          {flete.nombreUsuario}
        </p>
        <p className="text-xs text-slate-400 truncate">
          {flete.descripcionCarga || "—"} · {fecha}
        </p>
      </div>

      {/* Monto ganado */}
      <p className="text-sm font-black text-emerald-600 whitespace-nowrap">
        {formatLempira(ganado)}
      </p>
    </div>
  );
}

/** Tooltip personalizado para la gráfica */
function TooltipGrafica({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-base font-black text-slate-900">
        {formatLempira(payload[0].value)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

/**
 * VistaEstadisticas — muestra ganancias, fletes completados
 * y promedio por flete del transportista autenticado.
 *
 * Consulta: solicitudes con estado "finalizado" del transportista.
 * El monto ganado se lee de oferta.desglose.pagoTransportista
 * (guardado por el webhook de Stripe en confirmarPago).
 */
function VistaEstadisticas({ perfil }) {
  const [periodo,  setPeriodo]  = useState("mes");
  const [fletes,   setFletes]   = useState([]);   // Todos los fletes finalizados
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ── Cargar fletes finalizados del transportista ──
  useEffect(() => {
    if (!perfil?.uid) return;

    const cargarFletes = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "solicitudes"),
          where("transportistaId", "==", perfil.uid),
          where("estado", "==", "finalizado")
        );
        const snap = await getDocs(q);
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Ordenar del más reciente al más antiguo
        lista.sort((a, b) => {
          const fa = a.createdAt?.toDate?.() || 0;
          const fb = b.createdAt?.toDate?.() || 0;
          return fb - fa;
        });
        setFletes(lista);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    cargarFletes();
  }, [perfil?.uid]);

  // ── Filtrar fletes por período seleccionado ──
  const fechaInicio = getFechaInicio(periodo);

  const fletesFiltrados = fletes.filter((f) => {
    const fecha = f.createdAt?.toDate?.() || new Date(0);
    return fecha >= fechaInicio;
  });

  // ── Calcular métricas ──
  const totalGanado = fletesFiltrados.reduce((acc, f) => {
    const ganado = f.oferta?.desglose?.pagoTransportista ?? f.pago?.montoPagado ?? 0;
    return acc + ganado;
  }, 0);

  const totalFletes   = fletesFiltrados.length;
  const promedioPorFlete = totalFletes > 0 ? totalGanado / totalFletes : 0;

  // ── Datos para la gráfica ──
  const datosGrafica = agruparPorMes(fletesFiltrados, periodo);

  // ── Estados de carga y error ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-600 border-t-transparent" />
        <p className="text-sm text-slate-400 font-medium">Cargando estadísticas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-sm font-bold text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Encabezado + filtro de período ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Estadísticas</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Resumen de tu actividad como transportista
          </p>
        </div>

        {/* Botones de período */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setPeriodo(f.key)}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold transition-all
                ${periodo === f.key
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tarjetas de métricas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricaCard
          icono="💰"
          colorIcono="#ea580c"
          colorFondo="#fff4ed"
          label="Total ganado"
          valor={formatLempira(totalGanado)}
          sub={totalFletes === 0 ? "Sin fletes en este período" : `Neto después de comisión Fletia`}
          subColor={totalFletes === 0 ? "#94a3b8" : "#059669"}
        />
        <MetricaCard
          icono="📦"
          colorIcono="#059669"
          colorFondo="#f0fdf4"
          label="Fletes completados"
          valor={totalFletes}
          sub={totalFletes === 1 ? "1 flete este período" : `${totalFletes} fletes este período`}
        />
        <MetricaCard
          icono="📊"
          colorIcono="#8b5cf6"
          colorFondo="#f5f3ff"
          label="Promedio por flete"
          valor={formatLempira(promedioPorFlete)}
          sub="Ganancia neta promedio"
        />
      </div>

      {/* ── Gráfica de ganancias por mes ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-base font-black text-slate-900">Ganancias por mes</p>
            <p className="text-xs text-slate-400 mt-0.5">
              En lempiras — neto después de comisión Fletia (15%)
            </p>
          </div>
          {/* Leyenda */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
            Ganado
          </div>
        </div>

        {datosGrafica.every((d) => d.ganado === 0) ? (
          // Estado vacío en la gráfica
          <div className="flex flex-col items-center justify-center h-48 text-slate-300">
            <p className="text-sm font-bold">Sin datos en este período</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosGrafica} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `L.${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipGrafica />} cursor={{ fill: "#f8fafc" }} />
              <Bar
                dataKey="ganado"
                fill="#ea580c"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Historial de fletes completados ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-base font-black text-slate-900">Fletes completados</p>
          <span className="text-xs bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full">
            {totalFletes} {totalFletes === 1 ? "flete" : "fletes"}
          </span>
        </div>

        {fletesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-300">
            <p className="text-sm font-bold">Sin fletes completados en este período</p>
            <p className="text-xs">Completa tu primer flete para ver las estadísticas</p>
          </div>
        ) : (
          // Mostrar máximo 10 fletes más recientes
          fletesFiltrados.slice(0, 10).map((f) => (
            <FilaFlete key={f.id} flete={f} />
          ))
        )}
      </div>

    </div>
  );
}

export default VistaEstadisticas;