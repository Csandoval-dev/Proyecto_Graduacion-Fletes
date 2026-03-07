// src/hooks/useTarifas.js

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

//Hook para cargar las tarifas configuradas por el admin Lee desde Firestore: configuracion/tarifas

// Se no existe el documento, se usan valores por defecto para evitar errores en la aplicacion
export const useTarifas = () => {
  const [tarifas, setTarifas] = useState(null);
  const [loading, setLoading] = useState(true);
//Cargar tarifas desde firestore al montar el componente
  useEffect(() => {
    const cargarTarifas = async () => {
      try {
        // Leer documento de tarifas
        const docRef = doc(db, 'configuracion', 'tarifas');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setTarifas(docSnap.data());
        } else {
          // Valores por defecto si no existe el documento
          console.warn('No hay tarifas configuradas, usando valores por defecto');
          setTarifas({
            pickup: 15,
            camioneta: 18,
            camion: 25,
            comisionFletia: 15,
            precioMinimo: 50
          });
        }
      } catch (error) {
        console.error('Error al cargar tarifas:', error);
        // En caso de error, usar valores por defecto
        setTarifas({
          pickup: 15,
          camioneta: 18,
          camion: 25,
          comisionFletia: 15,
          precioMinimo: 50
        });
      } finally {
        setLoading(false);
      }
    };

    cargarTarifas();
  }, []);

  return { tarifas, loading };
};