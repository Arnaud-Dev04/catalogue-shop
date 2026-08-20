/**
 * Formate un prix en devise locale (BIF par défaut)
 * @param {number} price
 * @param {string} currency
 * @returns {string}
 */
export function formatPrice(price, currency = 'BIF') {
  return new Intl.NumberFormat('fr-BI', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Retourne le statut du stock avec label et couleur
 */
export function getStockStatus(stock) {
  if (stock === 0)       return { label: 'Rupture de stock', color: 'red',    bg: 'bg-red-100',    text: 'text-red-700'    };
  if (stock <= 10)       return { label: 'Stock faible',     color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700' };
  return                        { label: 'Disponible',       color: 'green',  bg: 'bg-green-100',  text: 'text-green-700'  };
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

/**
 * Génère un message WhatsApp formaté à partir des articles du panier
 */
export function generateWhatsAppMessage(items, total, currency = 'BIF') {
  const lines = items.map((item, i) =>
    `${i + 1}. ${item.quantity} × ${item.name}\n   Prix unitaire : ${formatPrice(item.price, currency)}\n   Sous-total : ${formatPrice(item.price * item.quantity, currency)}`
  );

  return `Bonjour,\n\nJe souhaite passer une commande :\n\n${lines.join('\n\n')}\n\n*Total : ${formatPrice(total, currency)}*\n\nMerci.`;
}

/**
 * Génère le contenu d'un email de commande
 */
export function generateEmailBody(items, total, currency = 'BIF') {
  const lines = items.map((item, i) =>
    `${i + 1}. ${item.quantity} × ${item.name} — ${formatPrice(item.price * item.quantity, currency)}`
  );

  return `Bonjour,\n\nJe souhaite passer la commande suivante :\n\n${lines.join('\n')}\n\nTotal : ${formatPrice(total, currency)}\n\nMes coordonnées :\nNom : \nTéléphone : \nEmail : \n\nMerci.`;
}
