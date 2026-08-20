import React, { useState, useEffect } from 'react';
import { Save, Store, Phone, Mail, MapPin, DollarSign, MessageCircle } from 'lucide-react';
import settingsService from '../../services/settingsService.js';
import { useToast } from '../../components/Toast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function AdminSettings() {
  const { showToast, ToastContainer } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    currency: 'BIF',
    whatsapp_number: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    settingsService.get()
      .then(data => {
        if (data.settings) {
          setFormData({
            business_name: data.settings.business_name || '',
            currency: data.settings.currency || 'BIF',
            whatsapp_number: data.settings.whatsapp_number || '',
            phone: data.settings.phone || '',
            email: data.settings.email || '',
            address: data.settings.address || ''
          });
        }
      })
      .catch(err => showToast('Erreur lors du chargement des paramètres', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await settingsService.update(formData);
      // Mettre à jour le cache local pour que les changements se reflètent immédiatement côté public
      sessionStorage.setItem('site_settings', JSON.stringify(formData));
      showToast('Paramètres mis à jour avec succès', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer />

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres de la boutique</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez les informations générales, les contacts et les devises de votre catalogue.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section Informations générales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-gray-400" />
            Informations générales
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique *</label>
              <input
                type="text"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                placeholder="Ex: Mon Super Catalogue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise principale</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="BIF">BIF (Franc burundais)</option>
                  <option value="USD">USD (Dollar américain)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="FCFA">FCFA (Franc CFA)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section Contact & Commandes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-400" />
            Contact & Commandes
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Ces informations sont utilisées pour recevoir les commandes (WhatsApp, Email) et s'affichent dans le pied de page.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp (Commandes)</label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <input
                  type="text"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Ex: 25770000000 (avec code pays)"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Format international sans le "+" (ex: 257...)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact (Commandes)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="contact@boutique.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone standard</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Numéro à afficher sur le site"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse physique</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Ex: 123 Avenue, Ville"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-50 shadow-sm"
          >
            {saving ? <LoadingSpinner size="sm" className="border-t-white" /> : <Save className="w-4 h-4" />}
            Enregistrer les paramètres
          </button>
        </div>

      </form>
    </div>
  );
}

export default AdminSettings;
