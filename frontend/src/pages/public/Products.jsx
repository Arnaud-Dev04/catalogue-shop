import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../../components/ProductCardSkeleton.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useCart } from '../../context/CartContext.jsx';
import useSettings from '../../hooks/useSettings.js';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Plus récents'      },
  { value: 'price_asc',  label: 'Prix croissant'    },
  { value: 'price_desc', label: 'Prix décroissant'  },
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart }                   = useCart();
  const { showToast, ToastContainer }   = useToast();
  const { settings }                    = useSettings();

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // État des filtres synchronisé avec l'URL
  const [filters, setFilters] = useState({
    search:    searchParams.get('search')    || '',
    category:  searchParams.get('category') || '',
    sort:      searchParams.get('sort')      || 'newest',
    available: searchParams.get('available') || '',
    page:      parseInt(searchParams.get('page') || '1'),
  });

  // Chargement des catégories (une seule fois)
  useEffect(() => {
    categoryService.getAll().then(d => setCategories(d.categories || []));
  }, []);

  // Chargement des produits à chaque changement de filtre
  const loadProducts = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.search)    params.search    = filters.search;
    if (filters.category)  params.category  = filters.category;
    if (filters.sort)      params.sort      = filters.sort;
    if (filters.available) params.available = filters.available;
    params.page  = filters.page;
    params.limit = 12;

    productService.getAll(params)
      .then(d => {
        setProducts(d.products || []);
        setPagination(d.pagination || { total: 0, page: 1, totalPages: 1 });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Met à jour les filtres et l'URL
  const applyFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: key === 'page' ? value : 1 };
    setFilters(newFilters);

    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const resetFilters = () => {
    const clean = { search: '', category: '', sort: 'newest', available: '', page: 1 };
    setFilters(clean);
    setSearchParams({});
  };

  const hasActiveFilters = filters.search || filters.category || filters.available || filters.sort !== 'newest';

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`"${product.name}" ajouté au panier !`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* En-tête de page */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-gray-500 text-sm mt-1">
            {!loading && `${pagination.total} produit${pagination.total !== 1 ? 's' : ''} trouvé${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Barre de recherche + bouton filtres mobile */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={filters.search}
              onChange={e => applyFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
            />
            {filters.search && (
              <button onClick={() => applyFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bouton filtres (mobile) */}
          <button
            onClick={() => setFiltersOpen(p => !p)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition
              ${filtersOpen ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
        </div>

        <div className="flex gap-6">
          {/* Panneau de filtres */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 lg:sticky lg:top-20">

              {/* Réinitialiser */}
              {hasActiveFilters && (
                <button onClick={resetFilters}
                  className="w-full text-xs text-red-500 hover:text-red-700 font-medium text-left transition">
                  ✕ Réinitialiser les filtres
                </button>
              )}

              {/* Catégories */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Catégorie</p>
                <div className="space-y-1">
                  <button
                    onClick={() => applyFilter('category', '')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition
                      ${!filters.category ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Toutes
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => applyFilter('category', cat.slug)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition truncate
                        ${filters.category === cat.slug ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                      <span className="ml-1 opacity-60 text-xs">({cat.product_count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Disponibilité */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Disponibilité</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.available === 'true'}
                    onChange={e => applyFilter('available', e.target.checked ? 'true' : '')}
                    className="w-4 h-4 accent-slate-800"
                  />
                  <span className="text-sm text-gray-700">En stock uniquement</span>
                </label>
              </div>

              {/* Tri */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trier par</p>
                <div className="space-y-1">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => applyFilter('sort', opt.value)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition
                        ${filters.sort === opt.value ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grille de produits */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">Aucun produit trouvé.</p>
                {hasActiveFilters && (
                  <button onClick={resetFilters}
                    className="mt-3 text-sm text-slate-700 underline hover:no-underline">
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      currency={settings?.currency || 'BIF'}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => applyFilter('page', filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600
                                 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.totalPages
                        || Math.abs(p - filters.page) <= 1)
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="text-gray-400 text-sm">…</span>
                          )}
                          <button
                            onClick={() => applyFilter('page', p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition
                              ${p === filters.page
                                ? 'bg-slate-800 text-white'
                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))
                    }

                    <button
                      onClick={() => applyFilter('page', filters.page + 1)}
                      disabled={filters.page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600
                                 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;
