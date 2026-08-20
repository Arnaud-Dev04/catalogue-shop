import React from 'react';
import { MessageCircle, Mail, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/helpers.js';

/**
 * Résumé du panier + boutons de commande
 */
function CartSummary({ items, totalPrice, currency = 'BIF', onWhatsApp, onEmail }) {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">

      <h2 className="text-lg font-bold text-gray-900 mb-5">Récapitulatif</h2>

      {/* Lignes du résumé */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Articles ({itemCount})</span>
          <span className="font-medium">{formatPrice(totalPrice, currency)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Livraison</span>
          <span className="text-green-600 font-medium">À définir</span>
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-gray-100 pt-4 mb-5">
        <div className="flex justify-between items-baseline">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-2xl font-extrabold text-slate-900">
            {formatPrice(totalPrice, currency)}
          </span>
        </div>
      </div>

      {/* Boutons de commande */}
      <div className="space-y-3">
        <button
          onClick={onWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500
                     text-white font-semibold py-3 px-5 rounded-xl transition"
        >
          <MessageCircle className="w-5 h-5" />
          Commander sur WhatsApp
        </button>

        <button
          onClick={onEmail}
          className="w-full flex items-center justify-center gap-2 border border-gray-200
                     text-gray-700 hover:bg-gray-50 font-medium py-3 px-5 rounded-xl transition"
        >
          <Mail className="w-5 h-5" />
          Commander par Email
        </button>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
        Votre commande sera envoyée directement au vendeur via WhatsApp ou Email.
      </p>
    </div>
  );
}

export default CartSummary;
