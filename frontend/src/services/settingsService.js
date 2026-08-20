import api from './api.js';

const settingsService = {
  // Paramètres publics (WhatsApp, email, nom boutique, devise...)
  get() {
    return api.get('/settings').then(r => r.data);
  },

  // Admin : mettre à jour les paramètres
  update(data) {
    return api.put('/settings', data).then(r => r.data);
  },

  // Admin : statistiques du dashboard
  getStats() {
    return api.get('/settings/stats').then(r => r.data);
  },
};

export default settingsService;
