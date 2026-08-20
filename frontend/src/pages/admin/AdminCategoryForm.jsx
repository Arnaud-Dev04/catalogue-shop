import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import categoryService from '../../services/categoryService.js';
import uploadService from '../../services/uploadService.js';
import { useToast } from '../../components/Toast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function AdminCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '' 
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: res.url }));
      showToast('Image uploadée avec succès !', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur d'upload", 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      categoryService.getById(id)
        .then(data => {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            image_url: data.image_url || '' 
          });
        })
        .catch(err => {
          showToast('Erreur chargement catégorie', 'error');
          navigate('/admin/categories');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditing) {
        await categoryService.update(id, formData);
        showToast('Catégorie mise à jour avec succès', 'success');
      } else {
        await categoryService.create(formData);
        showToast('Catégorie créée avec succès', 'success');
      }
      
      setTimeout(() => navigate('/admin/categories'), 1000);
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
    <div className="max-w-3xl mx-auto space-y-6">
      <ToastContainer />

      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/categories"
          className="p-2 text-gray-400 hover:text-slate-900 bg-white rounded-xl border border-gray-200 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez les informations de cette catégorie.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Colonne Principale (Infos) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la catégorie *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Ex: Électronique..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none resize-y"
                  placeholder="Description..."
                />
              </div>
            </div>
          </div>

          {/* Colonne Secondaire (Image) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Image</h2>
            
            {formData.image_url ? (
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative">
                <img src={formData.image_url} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
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

        {/* Actions */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-end gap-3">
          <Link
            to="/admin/categories"
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
            {isEditing ? 'Enregistrer' : 'Créer la catégorie'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AdminCategoryForm;
