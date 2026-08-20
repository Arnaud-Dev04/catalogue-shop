import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import CartItem from '../../components/CartItem.jsx';
import CartSummary from '../../components/CartSummary.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useCart } from '../../context/CartContext.jsx';
import useSettings from '../../hooks/useSettings.js';
import orderService from '../../services/orderService.js';
import { generateWhatsAppMessage, generateEmailBody } from '../../utils/helpers.js';

function Cart() {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { showToast, ToastContainer } = useToast();
  const { settings } = useSettings();

  const [orderSent, setOrderSent] = useState(false);
  const currency = settings?.currency || 'BIF';

  // ── Envoi WhatsApp ────────────────────────────────────────────
  const handleWhatsApp = () => {
    if (!settings?.whatsapp_number) {
      showToast('Numéro WhatsApp non configuré.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Votre panier est vide.', 'error');
      return;
    }

    const message = generateWhatsAppMessage(items, totalPrice, currency);
    const number  = settings.whatsapp_number.replace(/\D/g, '');
    const url     = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    // Enregistre la commande en base (optionnel, non bloquant)
    saveOrderToDb();

    window.open(url, '_blank');
    showToast('Redirection vers WhatsApp...', 'success');
  };

  // ── Envoi Email ───────────────────────────────────────────────
  const handleEmail = () => {
    if (!settings?.email) {
      showToast('Adresse email non configurée.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Votre panier est vide.', 'error');
      return;
    }

    const body    = generateEmailBody(items, totalPrice, currency);
    const subject = encodeURIComponent(`Nouvelle commande — ${settings.business_name || 'Clopofeco'}`);
    const mailBody = encodeURIComponent(body);

    // Enregistre la commande en base (optionnel, non bloquant)
    saveOrderToDb();

    window.location.href = `mailto:${settings.email}?subject=${subject}&body=${mailBody}`;
  };

  // ── Sauvegarde en base (non bloquant) ────────────────────────
  const saveOrderToDb = async () => {
    try {
      await orderService.create({
        customer_name:  'Client WhatsApp/Email',
        customer_phone: settings?.whatsapp_number || '',
        customer_email: settings?.email || '',
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      });
    } catch {
      // Silencieux : l'envoi WhatsApp/Email reste la priorité
    }
  };

  // ── Vider le panier avec confirmation ────────────────────────
  const handleClear = () => {
    if (window.confirm('Vider entièrement le panier ?')) {
      clearCart();
      showToast('Panier vidé.', 'info');
    }
  };

  // ── Panier vide ───────────────────────────────────────────────
  if (items.length === 0 && !orderSent) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <ToastContainer />
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
          <ShoppingCart className="w-9 h-9 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 text-sm mb-8 max-w-xs">
          Ajoutez des produits depuis le catalogue pour commencer votre commande.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700
                     text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Voir le catalogue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) > 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600
                       hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            Vider le panier
          </button>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  currency={currency}
                  onUpdateQty={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Continuer les achats */}
            <div className="mt-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-gray-500
                           hover:text-slate-800 transition font-medium"
              >
                ← Continuer les achats
              </Link>
            </div>
          </div>

          {/* Résumé & commande */}
          <div className="lg:col-span-1">
            <CartSummary
              items={items}
              totalPrice={totalPrice}
              currency={currency}
              onWhatsApp={handleWhatsApp}
              onEmail={handleEmail}
            />

            {/* Aperçu du message WhatsApp */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Aperçu du message
              </h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50
                              rounded-xl p-3 overflow-x-auto max-h-48 overflow-y-auto">
                {generateWhatsAppMessage(items, totalPrice, currency)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
