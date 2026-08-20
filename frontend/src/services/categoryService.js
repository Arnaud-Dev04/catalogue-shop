import api from './api.js';

const categoryService = {
  // Liste publique (actives uniquement)
  getAll() {
    return api.get('/categories').then(r => r.data);
  },

  // Liste admin (toutes, y compris inactives)
  getAllAdmin() {
    return api.get('/categories/all').then(r => r.data);
  },

  // Détail par ID ou slug
  getById(id) {
    return api.get(`/categories/${id}`).then(r => r.data);
  },

  // Admin : créer
  create(data) {
    return api.post('/categories', data).then(r => r.data);
  },

  // Admin : modifier
  update(id, data) {
    return api.put(`/categories/${id}`, data).then(r => r.data);
  },

  // Admin : supprimer
  delete(id) {
    return api.delete(`/categories/${id}`).then(r => r.data);
  },
};

export default categoryService;
