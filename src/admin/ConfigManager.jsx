import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ConfigManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [hidePrices, setHidePrices] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'notification');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setText(data.text || '');
          setHidePrices(data.hidePrices || false);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar la configuración.');
      } finally {
        setFetching(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await setDoc(doc(db, 'config', 'notification'), {
        text: text,
        hidePrices: hidePrices,
        updatedAt: new Date()
      });
      setSuccess('Configuración guardada correctamente.');
    } catch (err) {
      console.error(err);
      setError('Error al guardar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 border border-gray-100 w-full md:max-w-2xl">
      <h3 className="text-xl md:text-2xl font-serif mb-6">Configuración General</h3>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto de la Barra de Notificaciones
          </label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="2"
            placeholder="Ej. Envios gratis por compras superiores a $100.000"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
          ></textarea>
          <p className="text-xs text-gray-400 mt-1">Este texto aparecerá en la parte superior de toda la web.</p>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-100">
          <input 
            type="checkbox" 
            id="hidePrices"
            checked={hidePrices}
            onChange={(e) => setHidePrices(e.target.checked)}
            className="mt-0.5 w-5 h-5 text-florencia-gold border-gray-300 rounded focus:ring-florencia-gold cursor-pointer"
          />
          <label htmlFor="hidePrices" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
            Ocultar Precios <span className="block text-xs font-normal text-gray-500 mt-0.5">(No se mostrarán los valores de los productos en la web)</span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-florencia-dark text-white py-2.5 md:py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  );
};

export default ConfigManager;
