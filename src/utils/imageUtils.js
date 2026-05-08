/**
 * Convierte un archivo de imagen a formato WebP.
 * @param {File} file - El archivo de imagen original.
 * @param {number} quality - La calidad de la conversión (0 a 1).
 * @returns {Promise<File>} - Una promesa que resuelve con el nuevo archivo WebP.
 */
export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Si ya es webp, no hacemos nada
    if (file.type === 'image/webp') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            // Crear un nuevo objeto File a partir del blob
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const newFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('La conversión a WebP falló.'));
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
};
