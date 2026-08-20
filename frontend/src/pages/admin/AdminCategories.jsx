import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';
import categoryService from '../../services/categoryService.js';
import { useToast } from '../../components/Toast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { showToast, ToastContainer } = useToast();

  const loadCategories = useCallback(() => {
    setLoading(true);
    categoryService.getAllAdmin()
      .then(data => {
        setCategories(data.categories || []);
        setFilteredCategories(data.categories || []);
      })
      .catch(err => showToast(err.message || 'Erreur lors du chargement', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filtrage local (car pas de pagination sur l'API des catégories)
  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredCategories(
      categories.filter(c => c.name.toLowerCase().includes(term) || (c.description && c.description.toLowerCase().includes(term)))
    );
  }, [search, categories]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ? (Si elle contient des produits, l'opération pourrait échouer ou les produits perdront leur catégorie).`)) return;
    
    try {
      await categoryService.delete(id);
      showToast('Catégorie supprimée avec succès', 'success');
      loadCategories(); // Recharger la liste
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500 text-sm mt-1">
            Organisez votre catalogue ({categories.length} catégorie{categories.length > 1 ? 's' : ''})
          </p>
        </div>
        <Link
          to="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 
                     rounded-xl font-medium hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter une catégorie
        </Link>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Tableau des catégories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Produits associés</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <LoadingSpinner size="md" className="mx-auto" />
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-400">/{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                      {category.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {category.product_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/categories/${category.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCategories;
