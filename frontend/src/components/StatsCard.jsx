import React from 'react';

/**
 * Carte statistique pour le dashboard admin
 * @param {string}    title    - Titre de la stat
 * @param {string}    value    - Valeur affichée
 * @param {ReactNode} icon     - Icône Lucide
 * @param {string}    color    - Couleur de fond de l'icône (ex: 'bg-blue-100')
 * @param {string}    iconColor - Couleur de l'icône (ex: 'text-blue-600')
 * @param {string}    sub      - Texte secondaire optionnel
 * @param {boolean}   loading  - État de chargement
 */
function StatsCard({ title, value, icon: Icon, color = 'bg-slate-100',
                     iconColor = 'text-slate-600', sub, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                    hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 mb-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default StatsCard;
