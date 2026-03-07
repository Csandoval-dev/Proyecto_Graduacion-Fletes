
/**
 * Calcula el precio del flete basado en distancia y tipo de vehículo
 * @param {number} distanciaKm - Distancia en kilómetros
 * @param {string} tipoVehiculo - 'pickup', 'camioneta', o 'camion'
 * @param {object} tarifas - Objeto con las tarifas configuradas
 * @returns {object} Desglose completo del precio
 */
export const calcularPrecioFlete = (distanciaKm, tipoVehiculo, tarifas) => {
  // Obtener tarifa por km según el vehículo
  const tarifaPorKm = tarifas[tipoVehiculo] || tarifas.pickup;
  
  //  Calcular precio base (distancia × tarifa)
  const precioBase = distanciaKm * tarifaPorKm;
  
  // Aplicar precio mínimo si es necesario
  const precioFinal = Math.max(precioBase, tarifas.precioMinimo);
  
  //  Calcular comisión de Fletia
  const comisionFletia = precioFinal * (tarifas.comisionFletia / 100);
  
  // Calcular lo que recibe el transportista
  const pagoTransportista = precioFinal - comisionFletia;
  
  // Redondear a 2 decimales
  return {
    precioSugerido: Math.round(precioFinal * 100) / 100,
    comisionFletia: Math.round(comisionFletia * 100) / 100,
    pagoTransportista: Math.round(pagoTransportista * 100) / 100,
    tarifaPorKm,
    distanciaKm
  };
};

/**
 * Calcula desglose cuando hay un precio negociado
 * @param {number} montoAcordado - Precio acordado entre cliente y transportista
 * @param {object} tarifas - Objeto con las tarifas configuradas
 * @returns {object} Desglose del pago
 */
// Este calculo se utiliza cuando el cliente y el tranportista acuerdan un precio diferente al sugerido por la app
export const calcularDesglosePago = (montoAcordado, tarifas) => {
  const comisionFletia = montoAcordado * (tarifas.comisionFletia / 100);
  const pagoTransportista = montoAcordado - comisionFletia;
  
  return {
    montoPagado: Math.round(montoAcordado * 100) / 100,
    comisionFletia: Math.round(comisionFletia * 100) / 100,
    pagoTransportista: Math.round(pagoTransportista * 100) / 100,
    porcentajeComision: tarifas.comisionFletia
  };
};