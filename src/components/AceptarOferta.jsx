import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

function AceptarOferta({ solicitud, onAceptar, onRechazar }) {
  const [procesando, setProcesando] = useState(false);

  // Si no hay oferta pendiente, no mostrar nada
  if (!solicitud.oferta || solicitud.oferta.estado !== 'pendiente_cliente') {
    return null;
  }

  const { monto, desglose } = solicitud.oferta;

  const handleAceptar = async () => {
    if (!confirm(`¿Aceptar oferta de L. ${monto} y proceder al pago?`)) return;

    setProcesando(true);
    
    try {
      // Actualizar estado de la oferta
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        'oferta.estado': 'aceptada_cliente',
        precioAcordado: monto
      });

      // Llamar callback para abrir modal de pago
      if (onAceptar) {
        onAceptar(monto);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(' Error al aceptar oferta');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async () => {
    if (!confirm('¿Rechazar esta oferta?')) return;

    setProcesando(true);

    try {
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        'oferta.estado': 'rechazada_cliente'
      });

      alert('Oferta rechazada. Puedes seguir negociando en el chat.');
      if (onRechazar) onRechazar();
    } catch (error) {
      console.error('Error:', error);
      alert(' Error al rechazar oferta');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 space-y-4">
      <div className="text-center">
        <p className="text-sm font-bold text-green-900 mb-2">
           OFERTA RECIBIDA
        </p>
        <p className="text-4xl font-black text-green-900 mb-1">
          L. {monto}
        </p>
        <p className="text-xs text-green-700">
          Por el servicio de flete
        </p>
      </div>

      {/* Desglose del pago */}
      {desglose && (
        <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
          <p className="font-bold text-slate-900 mb-3">Desglose del Pago:</p>
          
          <div className="flex justify-between">
            <span className="text-slate-700">Servicio de flete:</span>
            <span className="font-bold">L. {desglose.montoPagado}</span>
          </div>
          
          <div className="flex justify-between text-xs text-slate-500">
            <span>Comisión plataforma ({desglose.porcentajeComision}%):</span>
            <span>L. {desglose.comisionFletia}</span>
          </div>
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>El transportista recibirá:</span>
              <span className="font-bold text-green-700">L. {desglose.pagoTransportista}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded p-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">TOTAL A PAGAR:</span>
              <span className="text-2xl font-black text-slate-900">L. {monto}</span>
            </div>
          </div>
        </div>
      )}

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          ℹ️ Al aceptar, serás redirigido al pago seguro con Stripe. 
          El servicio iniciará una vez confirmado el pago.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleRechazar}
          disabled={procesando}
          className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-300 disabled:opacity-50"
        >
           Rechazar
        </button>
        <button
          onClick={handleAceptar}
          disabled={procesando}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 text-lg"
        >
          {procesando ? 'Procesando...' : '✅ Aceptar y Pagar'}
        </button>
      </div>
    </div>
  );
}

export default AceptarOferta;