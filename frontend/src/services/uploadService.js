import api from './api.js';

const uploadService = {
  /**
   * Upload un fichier image vers le serveur (qui le relaie à Cloudinary)
   * @param {File} file - Fichier sélectionné via <input type="file" />
   * @returns {Promise<{url: string}>} L'URL Cloudinary de l'image
   */
  uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(r => r.data);
  }
};

export default uploadService;
