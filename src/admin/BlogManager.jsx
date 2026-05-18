import React, { useState } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { convertToWebP } from '../utils/imageUtils';

const BlogManager = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  React.useEffect(() => {
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (post) => {
    if (window.confirm('¿Estás seguro de eliminar esta entrada de blog?')) {
      try {
        await deleteDoc(doc(db, 'blog', post.id));
        if (post.imageUrl) {
          const imageRef = ref(storage, post.imageUrl);
          await deleteObject(imageRef).catch(err => console.error("Error deleting image:", err));
        }
      } catch (err) {
        console.error(err);
        setError('Error al eliminar la entrada.');
      }
    }
  };

  const handleEdit = (post) => {
    setIsEditing(true);
    setEditingId(post.id);
    setFormData({
      title: post.title,
      description: post.description || ''
    });
    setSuccess('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: '', description: '' });
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

    if (!isEditing && !file) return setError('Por favor selecciona la imagen de la entrada.');
    if (!formData.title) return setError('El título es obligatorio.');
    if (!formData.description) return setError('La descripción es obligatoria.');

    setLoading(true);

    try {
      let imageUrl = null;

      if (file) {
        const webpFile = await convertToWebP(file);
        const storageRef = ref(storage, `blog/${Date.now()}_${webpFile.name}`);
        const uploadResult = await uploadBytes(storageRef, webpFile);
        imageUrl = await getDownloadURL(uploadResult.ref);

        if (isEditing) {
          const oldPost = posts.find(p => p.id === editingId);
          if (oldPost?.imageUrl) {
            const oldImageRef = ref(storage, oldPost.imageUrl);
            await deleteObject(oldImageRef).catch(err => console.error("Error deleting old image:", err));
          }
        }
      }

      if (isEditing) {
        const postRef = doc(db, 'blog', editingId);
        const updateData = {
          title: formData.title,
          description: formData.description,
          updatedAt: serverTimestamp()
        };
        if (imageUrl) updateData.imageUrl = imageUrl;

        await updateDoc(postRef, updateData);
        setSuccess('Entrada actualizada correctamente.');
      } else {
        await addDoc(collection(db, 'blog'), {
          title: formData.title,
          description: formData.description,
          imageUrl: imageUrl,
          createdAt: serverTimestamp()
        });
        setSuccess('Entrada guardada correctamente.');
      }

      setFormData({ title: '', description: '' });
      setFile(null);
      setIsEditing(false);
      setEditingId(null);
      if (e.target.reset) e.target.reset();
    } catch (err) {
      console.error(err);
      setError('Error al guardar la entrada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 border border-gray-100 w-full md:max-w-2xl">
      <h3 className="text-xl md:text-2xl font-serif mb-6">
        {isEditing ? 'Editar Entrada de Blog' : 'Gestionar Blog'}
      </h3>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Entrada</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ej. Tendencias Florales 2024"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenido / Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="6"
            placeholder="Escribe el contenido de la entrada..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-florencia-gold"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen {isEditing && <span className="text-gray-400 font-normal">(Opcional)</span>}
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
            {loading ? 'Guardando...' : isEditing ? 'Actualizar Entrada' : 'Guardar Entrada'}
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

      <div className="mt-10 md:mt-12">
        <h4 className="text-lg md:text-xl font-serif mb-6 border-b border-gray-100 pb-2">Entradas Existentes</h4>
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg group">
              <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                <div className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 rounded overflow-hidden bg-gray-200 border border-gray-100">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm md:text-base">{post.title}</p>
                </div>
              </div>
              <div className="flex space-x-1 md:space-x-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(post)}
                  className="p-2 md:p-2 text-gray-400 hover:text-florencia-gold transition-colors bg-white md:bg-transparent rounded-full shadow-sm md:shadow-none"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(post)}
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
          {posts.length === 0 && (
            <p className="text-gray-400 text-sm italic text-center py-4">No hay entradas de blog aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManager;
