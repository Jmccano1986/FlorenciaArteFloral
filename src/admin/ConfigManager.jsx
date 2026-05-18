import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { convertToWebP } from '../utils/imageUtils';

const ConfigManager = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Notification Bar Config
  const [text, setText] = useState('');
  const [hidePrices, setHidePrices] = useState(false);
  const [themeColor, setThemeColor] = useState('dark'); // 'dark' or 'old'

  // Popup Config
  const [popupActive, setPopupActive] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState('');
  const [popupRedirectUrl, setPopupRedirectUrl] = useState('');
  const [popupFile, setPopupFile] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Fetch Notification Config
        const notifRef = doc(db, 'config', 'notification');
        const notifSnap = await getDoc(notifRef);
        if (notifSnap.exists()) {
          const data = notifSnap.data();
          setText(data.text || '');
          setHidePrices(data.hidePrices || false);
          setThemeColor(data.themeColor || 'dark');
        }

        // Fetch Popup Config
        const popupRef = doc(db, 'config', 'popup');
        const popupSnap = await getDoc(popupRef);
        if (popupSnap.exists()) {
          const data = popupSnap.data();
          setPopupActive(data.isActive || false);
          setPopupImageUrl(data.imageUrl || '');
          setPopupRedirectUrl(data.redirectUrl || '');
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

  const handlePopupFileChange = (e) => {
    if (e.target.files[0]) {
      setPopupFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Save Notification Config
      await setDoc(doc(db, 'config', 'notification'), {
        text: text,
        hidePrices: hidePrices,
        themeColor: themeColor,
        updatedAt: new Date()
      });

      // 2. Handle Popup Image Upload if there's a new file
      let finalPopupImageUrl = popupImageUrl;
      if (popupFile) {
        const webpFile = await convertToWebP(popupFile);
        const storageRef = ref(storage, `config/popup_${Date.now()}.webp`);
        const uploadResult = await uploadBytes(storageRef, webpFile);
        finalPopupImageUrl = await getDownloadURL(uploadResult.ref);

        // Delete old image if exists
        if (popupImageUrl) {
          try {
            const oldImageRef = ref(storage, popupImageUrl);
            await deleteObject(oldImageRef);
          } catch (err) {
            console.warn("Could not delete old popup image:", err);
          }
        }
        setPopupImageUrl(finalPopupImageUrl);
      }

      // 3. Save Popup Config
      await setDoc(doc(db, 'config', 'popup'), {
        isActive: popupActive,
        imageUrl: finalPopupImageUrl,
        redirectUrl: popupRedirectUrl,
        updatedAt: new Date()
      });

      setSuccess('Configuración guardada correctamente.');
      setPopupFile(null);
    } catch (err) {
      console.error(err);
      setError('Error al guardar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 border border-gray-100">
        <h3 className="text-xl md:text-2xl font-serif mb-6">Configuración General</h3>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Notification Bar */}
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900 border-b pb-2">Apariencia y Notificaciones</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color de Marca (Barra de notificaciones, Footer y redes.)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setThemeColor('dark')}
                  className={`flex items-center gap-3 p-3 rounded-md border transition-all ${themeColor === 'dark'
                    ? 'border-florencia-dark bg-florencia-dark/5 ring-1 ring-florencia-dark'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#5F6042] border border-black/10 shadow-sm" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1">Olivo Oscuro</p>
                    <p className="text-[10px] text-gray-500">Color principal sobrio</p>
                  </div>
                  {themeColor === 'dark' && <div className="ml-auto text-florencia-dark font-bold">✓</div>}
                </button>

                <button
                  type="button"
                  onClick={() => setThemeColor('old')}
                  className={`flex items-center gap-3 p-3 rounded-md border transition-all ${themeColor === 'old'
                    ? 'border-florencia-old bg-florencia-old/5 ring-1 ring-florencia-old'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#8F8B5B] border border-black/10 shadow-sm" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1">Olivo Envejecido</p>
                    <p className="text-[10px] text-gray-500">Color clásico tradicional</p>
                  </div>
                  {themeColor === 'old' && <div className="ml-auto text-florencia-old font-bold">✓</div>}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texto de la Barra
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="2"
                placeholder="Ej. Envíos gratis por compras superiores a $100.000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
              ></textarea>
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
          </div>

          {/* Popup Config */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-gray-900 border-b pb-2">Pop-up Promocional</h4>

            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={popupActive}
                  onChange={(e) => setPopupActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-florencia-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-florencia-gold"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">Pop-up Activo</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen del Pop-up (500x500 recomendado)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePopupFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-florencia-cream file:text-florencia-dark hover:file:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Redirección (Opcional)
                  </label>
                  <input
                    type="url"
                    value={popupRedirectUrl}
                    onChange={(e) => setPopupRedirectUrl(e.target.value)}
                    placeholder="https://wa.me/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
                  />
                </div>
              </div>

              <div className="border border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 overflow-hidden">
                {popupFile ? (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Previsualización (Nueva):</p>
                    <img src={URL.createObjectURL(popupFile)} className="max-h-40 w-auto rounded shadow-sm" alt="Preview" />
                  </div>
                ) : popupImageUrl ? (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Imagen Actual:</p>
                    <img src={popupImageUrl} className="max-h-40 w-auto rounded shadow-sm" alt="Current" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No hay imagen configurada</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-florencia-dark text-white py-2.5 md:py-3 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Guardando...' : 'Guardar Toda la Configuración'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfigManager;

