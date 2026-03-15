
import { useState, useEffect } from 'react';
import {
  CardElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';
import { stripePromise } from '../config/stripe';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1e293b',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#94a3b8' },
      iconColor: '#64748b',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true, // Ocultar código postal
};

// Funcio para renderizar el formulario de pago, manejando la logica de procesamiento con Stripe.
function FormularioPago({ solicitud, montoUSD, clientSecret, onExito }) {
  const stripe = useStripe();
  const elements = useElements();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [cardCompleta, setCardCompleta] = useState(false);
//Manejas el envio del formulario, confirmando el pago con stripe y manejando errorre o exitosamente.
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !cardCompleta) {
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirmar pago con CardElement
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Error al procesar el pago');
        console.error('Error de pago:', confirmError);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Pago confirmado exitosamente');
        onExito();
      }
    } catch (err) {
      console.error('Error al confirmar pago:', err);
      setError(err.message || 'Error inesperado');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Campo de tarjeta */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Información de la tarjeta
        </label>
        <div className="border border-slate-300 rounded-lg px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardCompleta(e.complete);
              if (e.error) {
                setError(e.error.message);
              } else {
                setError(null);
              }
            }}
          />
        </div>
       
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Botón de pago */}
      <button
        type="submit"
        disabled={!stripe || procesando || !cardCompleta}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {procesando ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
            Procesando pago...
          </span>
        ) : (
          `Pagar Lps. ${solicitud.monto} `
        )}
      </button>

      {/* Info de seguridad */}
      <p className="text-xs text-center text-slate-500">
        Pago seguro procesado por Stripe
      </p>
      {/* checkbox*/}
     
    </form>
  );
}

// Componente principal para manejar el proceso de pago con Stipe, incluyendo la comunicacion con el backend/
function ProcesarPagoStripe({ solicitud, onExito, onCancelar }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [montoUSD, setMontoUSD] = useState(null);

  useEffect(() => {
    const crearPago = async () => {
      try {
        setCargando(true);
        setError(null);

        console.log('Creando Payment Intent para solicitud:', solicitud.id);

        // Llamar Cloud Function para crear Payment Intent
        const crearIntentoPago = httpsCallable(functions, 'crearIntentoPago');
        
        const result = await crearIntentoPago({
          solicitudId: solicitud.id,
          monto: solicitud.monto
        });

        if (!result?.data?.clientSecret) {
          throw new Error('No se recibió confirmación del servidor de pago');
        }

        console.log('Client Secret obtenido');
        setClientSecret(result.data.clientSecret);
        
        // Calcular monto en USD
        const calculoUSD = result.data.montoUSD?.toFixed(2) || (solicitud.monto / TASA_HNL_USD).toFixed(2);
        setMontoUSD(calculoUSD);

      } catch (err) {
        console.error('Error al crear pago:', err);
        setError(
          err?.message ||
          err?.details ||
          'Error al conectar con el servidor de pago. Intenta de nuevo.'
        );
      } finally {
        setCargando(false);
      }
    };

    crearPago();
  }, [solicitud]);


  if (cargando) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-bold text-slate-900">
              Preparando pago seguro...
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Conectando con Stripe
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-4xl mb-4">❌</p>
            <p className="text-lg font-bold text-slate-900 mb-4">
              Error al preparar el pago
            </p>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <button
              onClick={onCancelar}
              className="w-full bg-slate-200 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

 
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#16a34a', // Verde
        colorText: '#1e293b',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px'
      }
    },
    locale: 'es'
  };


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900">
              Procesar Pago
            </h2>
            <button
              onClick={onCancelar}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          
          {/* Resumen del flete */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-bold text-slate-500 uppercase">
              Resumen del Flete
            </p>
            <p className="font-bold text-lg text-slate-900">
              {solicitud.descripcionCarga}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-slate-500">Transportista:</p>
                <p className="font-bold">{solicitud.nombreTransportista}</p>
              </div>
              <div>
                <p className="text-slate-500">Distancia:</p>
                <p className="font-bold">{solicitud.distanciaKm} km</p>
              </div>
            </div>
          </div>

          {/* Total a pagar */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 mb-1">Total a Pagar:</p>
            <p className="text-4xl font-black text-green-900">
              Lps. {solicitud.monto}
            </p>
           
          </div>

          {/* Formulario de pago */}
          {clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <FormularioPago 
                solicitud={solicitud}
                montoUSD={montoUSD}
                clientSecret={clientSecret}
                onExito={onExito}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcesarPagoStripe;