import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MessageCircle, ArrowLeft, Minus, Plus, Mail, Tag } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useCart } from '../../context/CartContext.jsx';
import useSettings from '../../hooks/useSettings.js';
import productService from '../../services/productService.js';
import { formatPrice, getStockStatus, generateWhatsAppMessage, generateEmailBody } from '../../utils/helpers.js';

function ProductDetail() {
  const { id }                        = useParams();
  const navigate                      = useNavigate();
  const { addToCart, getQuantity }    = useCart();
  const { showToast, ToastContainer } = useToast();
  const { settings }                  = useSettings();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]           = useState(1);

  useEffect(() => {
    setLoading(true);
    productService.getById(id)
      .then(data => {
        setProduct(data);
        setActiveImg(0);
        setQty(1);
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-5xl font-bold text-gray-200">404</p>
        <p className="text-xl font-semibold text-gray-700">Produit introuvable</p>
        <p className="text-gray-400 text-sm">Ce produit n'existe pas ou a été supprimé.</p>
        <Link to="/products"
          className="mt-2 inline-flex items-center gap-2 bg-slate-800 text-white
                     font-medium px-5 py-2.5 rounded-xl hover:bg-slate-700 transition">
          <ArrowLeft className="w-4 h-4" /> Retour au catalogue
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80', is_primary: true }];

  const stock    = getStockStatus(product.stock);
  const currency = settings?.currency || 'BIF';
  const inCart   = getQuantity(product.id);

  // Commande directe WhatsApp (produit seul)
  const handleWhatsApp = () => {
    if (!settings?.whatsapp_number) return;
    const item = [{ name: product.name, price: product.price, quantity: qty }];
    const msg  = generateWhatsAppMessage(item, product.price * qty, currency);
    const url  = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Commande directe Email
  const handleEmail = () => {
    if (!settings?.email) return;
    const item = [{ name: product.name, price: product.price, quantity: qty }];
    const body  = generateEmailBody(item, product.price * qty, currency);
    window.location.href = `mailto:${settings.email}?subject=Commande - ${product.name}&body=${encodeURIComponent(body)}`;
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast(`"${product.name}" ajouté au panier !`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700 transition">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-700 transition">Produits</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category_slug}`}
                className="hover:text-gray-700 transition">
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ── Galerie ─────────────────────────────────────── */}
            <div className="p-6 lg:p-8">
              {/* Image principale */}
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                <img
                  src={images[activeImg]?.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80'; }}
                />
              </div>

              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition
                        ${activeImg === idx ? 'border-slate-700' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img.image_url} alt={`Vue ${idx + 1}`}
                        className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Informations ────────────────────────────────── */}
            <div className="p-6 lg:p-8 lg:border-l border-gray-100 flex flex-col">

              {/* Catégorie + Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {product.category_name && (
                  <Link to={`/products?category=${product.category_slug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500
                               bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-full transition">
                    <Tag className="w-3 h-3" />
                    {product.category_name}
                  </Link>
                )}
                {product.is_featured && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                    Vedette
                  </span>
                )}
              </div>

              {/* Nom */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {/* Prix */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatPrice(product.price, currency)}
                </span>
              </div>

              {/* Statut stock */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                               w-fit mb-5 ${stock.bg} ${stock.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
                {stock.label}
                {product.stock > 0 && ` — ${product.stock} en stock`}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantité */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Quantité</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center
                                 hover:bg-gray-50 transition disabled:opacity-40"
                      disabled={qty <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900 text-lg">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center
                                 hover:bg-gray-50 transition disabled:opacity-40"
                      disabled={qty >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400">
                      Sous-total : <strong className="text-gray-700">{formatPrice(product.price * qty, currency)}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700
                             text-white font-semibold py-3 px-5 rounded-xl transition
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {product.stock === 0 ? 'Rupture de stock' : `Ajouter au panier${inCart ? ` (${inCart})` : ''}`}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                {settings?.whatsapp_number && (
                  <button
                    onClick={handleWhatsApp}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500
                               text-white font-medium py-2.5 px-5 rounded-xl transition
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Commander sur WhatsApp
                  </button>
                )}
                {settings?.email && (
                  <button
                    onClick={handleEmail}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200
                               text-gray-700 hover:bg-gray-50 font-medium py-2.5 px-5 rounded-xl transition
                               disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4" />
                    Commander par email
                  </button>
                )}
              </div>

              {/* Retour */}
              <button
                onClick={() => navigate(-1)}
                className="mt-5 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
