import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';
import uploadService from '../../services/uploadService.js'; // <-- Ajout de l'import
import { useToast } from '../../components/Toast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // <-- État upload
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    is_featured: false,
    image_url: '' // Maintenant mis à jour automatiquement via upload
  });

  // Fonction de gestion de l'upload d'image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: res.url }));
      showToast('Image uploadée avec succès !', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur lors de l'upload", 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    // Charger les catégories pour le select
    categoryService.getAllAdmin()
      .then(data => setCategories(data.categories || []))
      .catch(err => showToast('Erreur chargement catégories', 'error'));

    if (isEditing) {
      productService.getById(id)
        .then(data => {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price || '',
            stock: data.stock || '',
            category_id: data.category_id || '',
            is_featured: data.is_featured || false,
            // On récupère la première image s'il y en a une
            image_url: data.primary_image || (data.images?.[0]?.image_url) || '' 
          });
        })
        .catch(err => {
          showToast('Erreur chargement produit', 'error');
          navigate('/admin/products');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Préparation du payload
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null
      };

      if (isEditing) {
        await productService.update(id, payload);
        showToast('Produit mis à jour avec succès', 'success');
      } else {
        await productService.create(payload);
        showToast('Produit créé avec succès', 'success');
      }
      
      // Redirection après un court délai pour voir le toast
      setTimeout(() => navigate('/admin/products'), 1000);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la sauvegarde', 'error');
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
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="p-2 text-gray-400 hover:text-slate-900 bg-white rounded-xl border border-gray-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Remplissez les informations ci-dessous.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne Principale (Infos) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Ex: Chaussure de sport..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none resize-y"
                  placeholder="Description détaillée du produit..."
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Quantité en stock"
                />
              </div>
            </div>
          </div>

          {/* Colonne Secondaire (Image, Catégorie, Options) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organisation</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                >
                  <option value="">-- Sans catégorie --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-5 h-5 accent-slate-900 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Produit Vedette</p>
                    <p className="text-xs text-gray-500">Afficher sur la page d'accueil</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Image</h2>
              
              {formData.image_url ? (
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative group">
                  <img src={formData.image_url} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Aucune image</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Importer une image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-slate-900 file:text-white
                             hover:file:bg-slate-800 transition disabled:opacity-50"
                />
                {uploadingImage && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 font-medium">
                    <LoadingSpinner size="sm" className="border-t-blue-600" />
                    Upload en cours...
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Format JPG, PNG, WEBP. Max 5Mo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions (Sticky footer) */}
        <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur py-4 border-t border-gray-200 flex justify-end gap-3 px-4 -mx-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-0 sm:py-0">
          <Link
            to="/admin/products"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-50"
          >
            {saving ? <LoadingSpinner size="sm" className="border-t-white" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Enregistrer' : 'Créer le produit'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AdminProductForm;
