import api from './api.js';

const userService = {
  // Liste des utilisateurs
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Ajouter un nouvel utilisateur (admin ou superadmin)
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Modifier un utilisateur
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
