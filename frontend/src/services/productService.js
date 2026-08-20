import api from './api.js';

const productService = {
  // Liste avec filtres optionnels
  getAll(params = {}) {
    return api.get('/products', { params }).then(r => r.data);
  },

  // Produits vedettes (page accueil)
  getFeatured() {
    return api.get('/products/featured').then(r => r.data);
  },

  // Détail par ID ou slug
  getById(id) {
    return api.get(`/products/${id}`).then(r => r.data);
  },

  // Admin : créer
  create(data) {
    return api.post('/products', data).then(r => r.data);
  },

  // Admin : modifier
  update(id, data) {
    return api.put(`/products/${id}`, data).then(r => r.data);
  },

  // Admin : supprimer
  delete(id) {
    return api.delete(`/products/${id}`).then(r => r.data);
  },
};

export default productService;
