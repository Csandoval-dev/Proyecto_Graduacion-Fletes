import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useTarifas } from '../hook/useTarifas';
import { calcularDesglosePago } from '../utils/calcularPrecio';

function EnviarOferta({ solicitud, onEnviado }) {
  const [monto, setMonto] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const { tarifas } = useTarifas();

  // Calcular desglose en tiempo real mientras escribe
  const desglose = monto && tarifas 
    ? calcularDesglosePago(parseFloat(monto), tarifas)
    : null;

  const handleEnviar = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    if (!confirm(`¿Enviar oferta de L. ${monto}?`)) return;

    setEnviando(true);

    try {
      // Actualizar solicitud con la oferta
      await updateDoc(doc(db, 'solicitudes', solicitud.id), {
        oferta: {
          monto: parseFloat(monto),
          estado: 'pendiente_cliente',
          fechaEnviada: serverTimestamp(),
          desglose: desglose
        }
      });

      alert(' Oferta enviada al cliente');
      setMostrarForm(false);
      setMonto('');
      if (onEnviado) onEnviado();
    } catch (error) {
      console.error('Error:', error);
      alert(' Error al enviar oferta');
    } finally {
      setEnviando(false);
    }
  };

  // Si ya hay oferta pendiente
  if (solicitud.oferta?.estado === 'pendiente_cliente') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm font-bold text-orange-900 mb-1">
          ⏳ Oferta Enviada
        </p>
        <p className="text-2xl font-bold text-orange-900">
          L. {solicitud.oferta.monto}
        </p>
        <p className="text-xs text-orange-700 mt-2">
          Esperando respuesta del cliente...
        </p>
      </div>
    );
  }

  // Botón para mostrar formulario
  if (!mostrarForm) {
    return (
      <button
        onClick={() => setMostrarForm(true)}
        className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700"
      >
         Enviar Oferta Formal
      </button>
    );
  }

  // Formulario de oferta
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
      <div>
        <p className="text-sm font-bold text-orange-900 mb-2">
           Enviar Oferta Formal
        </p>
        {solicitud.precioSugerido && (
          <p className="text-xs text-orange-700">
            Precio sugerido: L. {solicitud.precioSugerido}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-orange-900 mb-2">
          Monto a cobrar:
        </label>
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          placeholder="Ej: 130"
          className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Mostrar desglose en tiempo real */}
      {desglose && (
        <div className="bg-white rounded-lg p-3 text-sm">
          <p className="font-bold text-slate-900 mb-2">Desglose:</p>
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-bold">L. {desglose.montoPagado}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Comisión Fletia ({desglose.porcentajeComision}%):</span>
              <span>- L. {desglose.comisionFletia}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-bold text-green-700">Recibirás:</span>
              <span className="font-bold text-green-700">L. {desglose.pagoTransportista}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            setMostrarForm(false);
            setMonto('');
          }}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 font-bold rounded-lg hover:bg-slate-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleEnviar}
          disabled={!monto || enviando}
          className="flex-1 px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar Oferta'}
        </button>
      </div>
    </div>
  );
}

export default EnviarOferta;