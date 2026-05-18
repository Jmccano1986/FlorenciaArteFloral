/**
 * Convierte un archivo de imagen a formato WebP.
 * @param {File} file - El archivo de imagen original.
 * @param {number} quality - La calidad de la conversión (0 a 1).
 * @returns {Promise<File>} - Una promesa que resuelve con el nuevo archivo WebP.
 */
export const convertToWebP = (file, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compress = (q) => {
          canvas.toBlob((blob) => {
            if (blob) {
              // Si el archivo sigue siendo muy pesado (> 700KB) y la calidad es mayor a 0.1, bajamos la calidad recursivamente
              if (blob.size > 700 * 1024 && q > 0.1) {
                compress(q - 0.1);
              } else {
                const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const newFile = new File([blob], newFileName, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(newFile);
              }
            } else {
              reject(new Error('La conversión a WebP falló.'));
            }
          }, 'image/webp', q);
        };

        compress(quality);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen.'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
};
