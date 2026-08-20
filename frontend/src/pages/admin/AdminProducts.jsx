import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import productService from '../../services/productService.js';
import { formatPrice, getStockStatus } from '../../utils/helpers.js';
import { useToast } from '../../components/Toast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import useSettings from '../../hooks/useSettings.js';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { showToast, ToastContainer } = useToast();
  const { settings } = useSettings();
  const currency = settings?.currency || 'BIF';

  const loadProducts = useCallback((page = 1, searchQuery = '') => {
    setLoading(true);
    productService.getAll({ page, limit: 10, search: searchQuery })
      .then(data => {
        setProducts(data.products || []);
        setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
      })
      .catch(err => showToast(err.message || 'Erreur lors du chargement', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts(1, search);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) return;
    
    try {
      await productService.delete(id);
      showToast('Produit supprimé avec succès', 'success');
      loadProducts(pagination.page, search); // Recharger la page courante
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
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez votre catalogue ({pagination.total} produit{pagination.total > 1 ? 's' : ''})
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 
                     rounded-xl font-medium hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Link>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </form>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium">Prix</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <LoadingSpinner size="md" className="mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stock = getStockStatus(product.stock);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.primary_image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            {product.is_featured && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                Vedette
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatPrice(product.price, currency)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stock.bg} ${stock.text}`}>
                          {product.stock <= 10 && product.stock > 0 && <AlertCircle className="w-3 h-3" />}
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {product.category_name || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/products/${product.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadProducts(pagination.page - 1, search)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Précédent
              </button>
              <button
                onClick={() => loadProducts(pagination.page + 1, search)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
