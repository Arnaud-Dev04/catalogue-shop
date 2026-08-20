import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'cart_items';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistance automatique dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Nombre total d'articles
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  // Total général
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Ajouter au panier
  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, {
        id:       product.id,
        name:     product.name,
        price:    parseFloat(product.price),
        stock:    product.stock,
        slug:     product.slug,
        image:    product.primary_image || product.images?.[0]?.image_url || null,
        quantity: Math.min(quantity, product.stock),
      }];
    });
  };

  // Retirer du panier
  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  // Modifier la quantité
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity } : i)
    );
  };

  // Vider le panier
  const clearCart = () => setItems([]);

  // Vérifier si un produit est dans le panier
  const isInCart = (productId) => items.some(i => i.id === productId);

  // Quantité d'un produit dans le panier
  const getQuantity = (productId) => items.find(i => i.id === productId)?.quantity || 0;

  return (
    <CartContext.Provider value={{
      items, totalItems, totalPrice,
      addToCart, removeFromCart, updateQuantity, clearCart,
      isInCart, getQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider');
  return ctx;
}

export default CartContext;
