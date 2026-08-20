import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import { formatPrice, getStockStatus, truncate } from '../utils/helpers.js';

/**
 * Carte produit réutilisable
 * @param {object}   product  - données du produit
 * @param {Function} onAddToCart - callback d'ajout au panier
 * @param {string}   currency - devise (défaut BIF)
 */
function ProductCard({ product, onAddToCart, currency = 'BIF' }) {
  const stock   = getStockStatus(product.stock);
  const imgSrc  = product.primary_image || product.images?.[0]?.image_url
                  || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80';

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                    hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col">

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80'; }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-400 text-amber-900 rounded-full">
              Vedette
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
              Rupture
            </span>
          )}
        </div>

        {/* Overlay bouton détail */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-4 gap-2">

        {/* Catégorie */}
        {product.category_name && (
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {product.category_name}
          </span>
        )}

        {/* Nom */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Description courte */}
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {truncate(product.description, 80)}
          </p>
        )}

        {/* Prix + Stock */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-base font-bold text-slate-800">
            {formatPrice(product.price, currency)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stock.bg} ${stock.text}`}>
            {stock.label}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            to={`/products/${product.slug || product.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl
                       border border-gray-200 text-gray-700 text-xs font-medium
                       hover:bg-gray-50 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            Détails
          </Link>

          <button
            onClick={() => onAddToCart && onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl
                       bg-slate-800 text-white text-xs font-medium
                       hover:bg-slate-700 transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Indisponible' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
