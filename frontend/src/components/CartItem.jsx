import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/helpers.js';

/**
 * Ligne d'article dans le panier
 */
function CartItem({ item, currency = 'BIF', onUpdateQty, onRemove }) {
  const imgSrc = item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80';

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">

      {/* Image */}
      <Link to={`/products/${item.slug || item.id}`} className="flex-shrink-0">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80'; }}
        />
      </Link>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${item.slug || item.id}`}
          className="font-semibold text-gray-900 text-sm hover:text-slate-700 transition line-clamp-2"
        >
          {item.name}
        </Link>

        <p className="text-sm text-gray-500 mt-0.5">
          Prix unitaire : <span className="font-medium text-gray-700">{formatPrice(item.price, currency)}</span>
        </p>

        {/* Contrôles quantité + suppression */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">

          {/* Quantité */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQty(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center text-sm font-semibold text-gray-900">
              {item.quantity}
            </span>

            <button
              onClick={() => onUpdateQty(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200
                         text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sous-total */}
            <span className="text-sm font-bold text-slate-800">
              {formatPrice(item.price * item.quantity, currency)}
            </span>

            {/* Supprimer */}
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
