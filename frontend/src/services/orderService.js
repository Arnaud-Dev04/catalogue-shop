import api from './api.js';

const orderService = {
  // Enregistre la commande en base (historique)
  create(orderData) {
    return api.post('/orders', orderData).then(r => r.data);
  },

  // Admin : liste des commandes
  getAll(params = {}) {
    return api.get('/orders', { params }).then(r => r.data);
  },

  // Admin : détail d'une commande
  getById(id) {
    return api.get(`/orders/${id}`).then(r => r.data);
  },

  // Admin : mise à jour du statut
  updateStatus(id, status) {
    return api.put(`/orders/${id}`, { status }).then(r => r.data);
  },
};

export default orderService;
