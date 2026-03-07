// src/utils/calcularComision.js

/**
 * Calcula el desglose de pago con comisión
 * @param {number} monto - Monto acordado entre cliente y transportista
 * @returns {object} Desglose del pago
 */
export const calcularDesglosePago = (monto) => {
  // Comisión fija del 15%
  const COMISION_PORCENTAJE = 15;
  //Como se calcula la comision, se multiplica el monto por el porcentaje de comision y se divide entre 100 para obtener el valor de la comision.
  const comisionFletia = monto * (COMISION_PORCENTAJE / 100);
  const pagoTransportista = monto - comisionFletia;
  //El monto pagado por el cliente es el monto acordado, ya que la comision de descuenta del pago al transportista, no del monto que paga el cliente.
  return {
    montoPagado: Math.round(monto * 100) / 100,//Redondear a 2 decimales
    comisionFletia: Math.round(comisionFletia * 100) / 100,//
    pagoTransportista: Math.round(pagoTransportista * 100) / 100,
    porcentajeComision: COMISION_PORCENTAJE //
  };
};