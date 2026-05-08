import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { convertToWebP } from '../utils/imageUtils';

const CategoriesManager = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  React.useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (category) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteDoc(doc(db, 'categories', category.id));
        if (category.mainImageUrl) {
          const imageRef = ref(storage, category.mainImageUrl);
          await deleteObject(imageRef).catch(err => console.error("Error deleting image:", err));
        }
      } catch (err) {
        console.error(err);
        setError('Error al eliminar la categoría.');
      }
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setFile(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEditing && !file) return setError('Por favor selecciona la imagen principal de la categoría.');
    if (!formData.name) return setError('El nombre de la categoría es obligatorio.');

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Handle image upload if a new file is selected
      if (file) {
        // Convert to WebP
        const webpFile = await convertToWebP(file);

        const storageRef = ref(storage, `categories/${Date.now()}_${webpFile.name}`);
        const uploadResult = await uploadBytes(storageRef, webpFile);
        imageUrl = await getDownloadURL(uploadResult.ref);

        // If editing and uploaded new image, optionally delete old one
        if (isEditing) {
          const oldCat = categories.find(c => c.id === editingId);
          if (oldCat?.mainImageUrl) {
            const oldImageRef = ref(storage, oldCat.mainImageUrl);
            await deleteObject(oldImageRef).catch(err => console.error("Error deleting old image:", err));
          }
        }
      }

      // 2. Save/Update category in Firestore
      if (isEditing) {
        const categoryRef = doc(db, 'categories', editingId);
        const updateData = {
          name: formData.name,
          description: formData.description,
          updatedAt: serverTimestamp()
        };
        if (imageUrl) updateData.mainImageUrl = imageUrl;
        
        await updateDoc(categoryRef, updateData);
        setSuccess('Categoría actualizada correctamente.');
      } else {
        await addDoc(collection(db, 'categories'), {
          name: formData.name,
          description: formData.description,
          mainImageUrl: imageUrl,
          createdAt: serverTimestamp()
        });
        setSuccess('Categoría guardada correctamente.');
      }

      setFormData({ name: '', description: '' });
      setFile(null);
      setIsEditing(false);
      setEditingId(null);
      if (e.target.reset) e.target.reset();
    } catch (err) {
      console.error(err);
      setError('Error al guardar la categoría. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 border border-gray-100 w-full md:max-w-2xl">
      <h3 className="text-xl md:text-2xl font-serif mb-6">
        {isEditing ? 'Editar Categoría' : 'Gestionar Categorías'}
      </h3>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej. Ramos de Novia"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenido / Descripción</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            placeholder="Descripción de la categoría..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen Principal {isEditing && <span className="text-gray-400 font-normal">(Opcional)</span>}
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-florencia-cream file:text-florencia-dark hover:file:bg-gray-100"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-florencia-dark text-white py-2.5 md:py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 order-1 sm:order-2"
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Categoría' : 'Guardar Categoría'}
          </button>
          
          {isEditing && (
            <button 
              type="button"
              onClick={cancelEdit}
              className="flex-1 sm:flex-none px-6 py-2.5 md:py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Categories List */}
      <div className="mt-10 md:mt-12">
        <h4 className="text-lg md:text-xl font-serif mb-6 border-b border-gray-100 pb-2">Categorías Existentes</h4>
        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg group">
              <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                <div className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 rounded overflow-hidden bg-gray-200 border border-gray-100">
                  {cat.mainImageUrl && (
                    <img src={cat.mainImageUrl} alt={cat.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm md:text-base">{cat.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[300px]">{cat.description || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="flex space-x-1 md:space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(cat)}
                  className="p-2 md:p-2 text-gray-400 hover:text-florencia-gold transition-colors bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDelete(cat)}
                  className="p-2 md:p-2 text-gray-400 hover:text-red-600 transition-colors bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none"
                  title="Eliminar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-gray-400 text-sm italic text-center py-4">No hay categorías creadas aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;
