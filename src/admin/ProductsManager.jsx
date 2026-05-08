import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { convertToWebP } from '../utils/imageUtils';

const ProductsManager = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    price: '',
    categoryId: ''
  });
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Listen for categories
    const qCats = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsubCats = onSnapshot(qCats, (querySnapshot) => {
      const cats = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      setCategories(cats);
    });

    // Listen for products
    const qProds = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubProds = onSnapshot(qProds, (querySnapshot) => {
      const prods = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setFormData({
      reference: product.reference,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ reference: '', description: '', price: '', categoryId: '' });
    setFile(null);
  };

  const handleDelete = async (product) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', product.id));
        if (product.imageUrl) {
          const imageRef = ref(storage, product.imageUrl);
          await deleteObject(imageRef).catch(err => console.error("Error deleting image:", err));
        }
      } catch (err) {
        console.error(err);
        setError('Error al eliminar el producto.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!isEditing && !file) return setError('Por favor selecciona una imagen.');
    if (!formData.reference || !formData.description || !formData.price || !formData.categoryId) {
      return setError('Por favor completa todos los campos.');
    }
    const wordCount = formData.description.trim().split(/\s+/).length;
    if (wordCount > 30) {
      return setError('La descripción no puede superar las 30 palabras.');
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Upload image if a new one is selected
      if (file) {
        // Convert to WebP
        const webpFile = await convertToWebP(file);
        
        const storageRef = ref(storage, `products/${Date.now()}_${webpFile.name}`);
        const uploadResult = await uploadBytes(storageRef, webpFile);
        imageUrl = await getDownloadURL(uploadResult.ref);

        if (isEditing) {
          const oldProd = products.find(p => p.id === editingId);
          if (oldProd?.imageUrl) {
            const oldImageRef = ref(storage, oldProd.imageUrl);
            await deleteObject(oldImageRef).catch(err => console.error("Error deleting old image:", err));
          }
        }
      }

      // 2. Save/Update document in Firestore
      const productData = {
        reference: formData.reference,
        description: formData.description,
        price: Number(formData.price),
        categoryId: formData.categoryId,
        updatedAt: serverTimestamp()
      };
      if (imageUrl) productData.imageUrl = imageUrl;

      if (isEditing) {
        await updateDoc(doc(db, 'products', editingId), productData);
        setSuccess('Producto actualizado correctamente.');
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), productData);
        setSuccess('Producto agregado correctamente.');
      }

      setFormData({ reference: '', description: '', price: '', categoryId: '' });
      setFile(null);
      setIsEditing(false);
      setEditingId(null);
      if (e.target.reset) e.target.reset();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el producto. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  // Group products by category
  const productsByCategory = categories.map(cat => ({
    ...cat,
    items: products.filter(p => p.categoryId === cat.id)
  })).filter(cat => cat.items.length > 0);

  // Products with no category (just in case)
  const uncategorizedProducts = products.filter(p => !categories.find(c => c.id === p.categoryId));

  return (
    <div className="w-full space-y-8 md:space-y-12">
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 border border-gray-100 w-full md:max-w-2xl">
        <h3 className="text-xl md:text-2xl font-serif mb-6">
          {isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h3>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto del Producto {isEditing && <span className="text-gray-400 font-normal">(Opcional)</span>}
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-florencia-cream file:text-florencia-dark hover:file:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
            <input 
              type="text" 
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              placeholder="Ej. Arreglo Primavera"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-gray-400 font-normal">(Max 30 palabras)</span>
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe el arreglo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-florencia-dark text-white py-2.5 md:py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 order-1 sm:order-2"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
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
      </div>

      {/* List Section Grouped by Category */}
      <div className="space-y-6 md:space-y-8">
        <h4 className="text-xl md:text-2xl font-serif border-b border-gray-200 pb-2">Productos Existentes</h4>
        
        {productsByCategory.map(category => (
          <div key={category.id} className="space-y-4">
            <h5 className="text-lg font-serif italic text-florencia-gold">{category.name}</h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {category.items.map(product => (
                <div key={product.id} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-3 md:space-x-4 group">
                  <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded overflow-hidden bg-gray-50 border border-gray-100">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.reference} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm md:text-base">{product.reference}</p>
                    <p className="text-sm text-florencia-gold font-medium">${product.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5 md:mt-1">{product.description}</p>
                  </div>
                  <div className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-2 md:p-1.5 text-gray-400 hover:text-florencia-gold transition-colors bg-gray-50 md:bg-transparent rounded-full md:rounded-none"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(product)}
                      className="p-2 md:p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 md:bg-transparent rounded-full md:rounded-none"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {uncategorizedProducts.length > 0 && (
          <div className="space-y-4">
            <h5 className="text-lg font-serif italic text-gray-400">Sin Categoría</h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {uncategorizedProducts.map(product => (
                <div key={product.id} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-3 md:space-x-4 group opacity-70">
                  <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded overflow-hidden bg-gray-50 border border-gray-100">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.reference} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm md:text-base">{product.reference}</p>
                    <p className="text-sm text-florencia-gold font-medium">${product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(product)} className="p-2 md:p-1.5 text-gray-400 hover:text-florencia-gold bg-gray-50 md:bg-transparent rounded-full md:rounded-none"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onClick={() => handleDelete(product)} className="p-2 md:p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 md:bg-transparent rounded-full md:rounded-none"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <p className="text-gray-400 italic text-center py-10">No hay productos registrados.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
