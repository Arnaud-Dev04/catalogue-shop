import api from './api.js';

const authService = {
  // Connexion : envoie email + mot de passe, reçoit un token JWT
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { token, user }
  },

  // Vérifie le token actuel et retourne l'utilisateur connecté
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data; // { user }
  },

  // Déconnexion locale (supprime le token)
  logout() {
    localStorage.removeItem('token');
  },

  // Retourne true si un token est présent en localStorage
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export default authService;
