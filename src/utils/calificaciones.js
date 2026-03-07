// src/utils/calificaciones.js

/**
 * Calcula el nuevo promedio de calificaciones de un transportista
 * @param {object} calificacionesActuales - Objeto con las calificaciones actuales
 * @param {number} nuevaCalificacion - Nueva calificación (1-5)
 * @returns {object} Objeto con los nuevos valores actualizados
 */
export const calcularNuevasCalificaciones = (calificacionesActuales, nuevaCalificacion) => {
  // Valores por defecto si no existen
  const actual = calificacionesActuales || {
    total: 0,
    promedio: 0,
    estrellas: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  // Incrementar total
  const nuevoTotal = (actual.total || 0) + 1;

  // Incrementar contador de estrellas específico
  const nuevasEstrellas = { ...actual.estrellas };
  nuevasEstrellas[nuevaCalificacion] = (nuevasEstrellas[nuevaCalificacion] || 0) + 1;

  //Calcular nuevo promedio
  let sumaTotal = 0;
  for (let i = 1; i <= 5; i++) {
    sumaTotal += i * (nuevasEstrellas[i] || 0);
  }
  const nuevoPromedio = nuevoTotal > 0 ? sumaTotal / nuevoTotal : 0;

  return {
    total: nuevoTotal,
    promedio: parseFloat(nuevoPromedio.toFixed(2)),
    estrellas: nuevasEstrellas
  };
};

/**
 * Calcula el promedio de calificaciones existentes
 * @param {object} calificaciones - Objeto con estrellas
 * @returns {number} Promedio calculado
 */
export const calcularPromedioCalificaciones = (calificaciones) => {
  if (!calificaciones || !calificaciones.estrellas) return 0;

  let sumaTotal = 0;
  let totalCalificaciones = 0;

  for (let i = 1; i <= 5; i++) {
    const cantidad = calificaciones.estrellas[i] || 0;
    sumaTotal += i * cantidad;
    totalCalificaciones += cantidad;
  }

  return totalCalificaciones > 0 
    ? parseFloat((sumaTotal / totalCalificaciones).toFixed(2)) 
    : 0;
};

/**
 * Formatea el promedio para mostrar (ej: 4.5 estrellas)
 * @param {number} promedio - Promedio de calificaciones
 * @returns {string} Texto formateado
 */
export const formatearPromedio = (promedio) => {
  if (!promedio || promedio === 0) return 'Sin calificaciones';
  return `${promedio.toFixed(1)} estrellas`;
};

/**
 * Calcula el porcentaje de cada tipo de estrella
 * @param {object} calificaciones - Objeto con estrellas
 * @returns {object} Porcentajes por estrella
 */
export const calcularPorcentajes = (calificaciones) => {
  if (!calificaciones || !calificaciones.estrellas || !calificaciones.total) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  const porcentajes = {};
  for (let i = 1; i <= 5; i++) {
    const cantidad = calificaciones.estrellas[i] || 0;
    porcentajes[i] = calificaciones.total > 0 
      ? parseFloat(((cantidad / calificaciones.total) * 100).toFixed(1))
      : 0;
  }

  return porcentajes;
};