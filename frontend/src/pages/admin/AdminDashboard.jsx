import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Tag, AlertTriangle, TrendingUp,
  ShoppingCart, CheckCircle, XCircle, Clock, ArrowRight,
} from 'lucide-react';
import StatsCard from '../../components/StatsCard.jsx';
import { formatPrice, getStockStatus } from '../../utils/helpers.js';
import settingsService from '../../services/settingsService.js';
import { useAuth } from '../../context/AuthContext.jsx';

function AdminDashboard() {
  const { user }              = useAuth();
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('BIF');

  useEffect(() => {
    // Chargement parallèle des stats et des paramètres
    Promise.all([
      settingsService.getStats(),
      settingsService.get(),
    ])
      .then(([statsData, settingsData]) => {
        setStats(statsData.stats);
        setRecent(statsData.recent_products || []);
        setCurrency(settingsData.settings?.currency || 'BIF');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Formatte la valeur du stock
  const stockValue = stats
    ? formatPrice(parseFloat(stats.stock_value) || 0, currency)
    : '—';

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.name || 'Administrateur'} 
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Voici un aperçu de votre catalogue.
        </p>
      </div>

      {/* Grille de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          loading={loading}
          title="Total produits"
          value={stats?.total_products ?? '—'}
          icon={Package}
          color="bg-blue-50"
          iconColor="text-blue-600"
          sub={`${stats?.active_products ?? 0} actifs`}
        />
        <StatsCard
          loading={loading}
          title="Catégories"
          value={stats?.total_categories ?? '—'}
          icon={Tag}
          color="bg-purple-50"
          iconColor="text-purple-600"
          sub="catégories actives"
        />
        <StatsCard
          loading={loading}
          title="Ruptures de stock"
          value={stats?.out_of_stock ?? '—'}
          icon={XCircle}
          color="bg-red-50"
          iconColor="text-red-500"
          sub={`${stats?.low_stock ?? 0} en stock faible`}
        />
        <StatsCard
          loading={loading}
          title="Valeur du stock"
          value={stockValue}
          icon={TrendingUp}
          color="bg-green-50"
          iconColor="text-green-600"
          sub="valeur approximative"
        />
      </div>

      {/* Deuxième rangée de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          loading={loading}
          title="Commandes reçues"
          value={stats?.total_orders ?? '—'}
          icon={ShoppingCart}
          color="bg-amber-50"
          iconColor="text-amber-600"
          sub="toutes commandes"
        />
        <StatsCard
          loading={loading}
          title="Produits en stock faible"
          value={stats?.low_stock ?? '—'}
          icon={AlertTriangle}
          color="bg-orange-50"
          iconColor="text-orange-500"
          sub="stock entre 1 et 10"
        />
        <StatsCard
          loading={loading}
          title="Produits actifs"
          value={stats?.active_products ?? '—'}
          icon={CheckCircle}
          color="bg-emerald-50"
          iconColor="text-emerald-600"
          sub={`sur ${stats?.total_products ?? 0} total`}
        />
      </div>

      {/* Dernières modifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900 text-sm">Dernières modifications</h2>
          </div>
          <Link to="/admin/products"
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 transition font-medium">
            Gérer les produits <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-2 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Aucune modification récente.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map(product => {
              const stock = getStockStatus(product.stock);
              return (
                <div key={product.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">

                  {/* Icône produit */}
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Nom + catégorie */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category_name || 'Sans catégorie'}</p>
                  </div>

                  {/* Prix */}
                  <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                    {formatPrice(product.price, currency)}
                  </p>

                  {/* Badge stock */}
                  <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1
                                   rounded-full flex-shrink-0 ${stock.bg} ${stock.text}`}>
                    {stock.label}
                  </span>

                  {/* Lien modifier */}
                  <Link
                    to={`/admin/products`}
                    className="text-xs text-slate-500 hover:text-slate-800 transition flex-shrink-0"
                  >
                    Modifier
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Raccourcis d'action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/admin/products',   label: 'Gérer les produits',   icon: Package, desc: 'Ajouter, modifier, supprimer des produits' },
          { to: '/admin/categories', label: 'Gérer les catégories', icon: Tag,     desc: 'Organiser les catégories du catalogue' },
          { to: '/admin/settings',   label: 'Paramètres',           icon: Package, desc: 'WhatsApp, email, nom de la boutique' },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md
                       transition group flex items-center gap-4">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0
                            group-hover:bg-slate-800 transition">
              <Icon className="w-5 h-5 text-slate-600 group-hover:text-white transition" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-slate-700 ml-auto transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
