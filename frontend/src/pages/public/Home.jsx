import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from '../../components/Icons.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../../components/ProductCardSkeleton.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../components/Toast.jsx';
import useSettings from '../../hooks/useSettings.js';
import productService from '../../services/productService.js';
import categoryService from '../../services/categoryService.js';

function Home() {
  const { addToCart }       = useCart();
  const { showToast, ToastContainer } = useToast();
  const { settings }        = useSettings();

  const [featured, setFeatured]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loadingP, setLoadingP]       = useState(true);
  const [loadingC, setLoadingC]       = useState(true);

  useEffect(() => {
    productService.getFeatured()
      .then(d => setFeatured(d.products || []))
      .catch(() => {})
      .finally(() => setLoadingP(false));

    categoryService.getAll()
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoadingC(false));
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`"${product.name}" ajouté au panier !`, 'success');
  };

  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`
    : '#';

  return (
    <div className="min-h-screen">
      <ToastContainer />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative text-white overflow-hidden flex items-center" style={{ minHeight: '600px' }}>
        {/* Image de fond */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop" 
            alt="Clopofeco Background" 
            className="w-full h-full object-cover"
          />
          {/* Overlay sombre pour garder le texte lisible */}
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold
                             rounded-full mb-6 tracking-wider uppercase shadow-xl">
              {settings?.business_name || 'Clopofeco'}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-white drop-shadow-lg">
              Des produits de<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-white">
                qualité pour vous
              </span>
            </h1>
            <p className="text-lg text-slate-200 mb-10 leading-relaxed max-w-lg drop-shadow">
              Découvrez notre sélection et commandez facilement via WhatsApp ou email. Livraison rapide.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold
                           px-7 py-3.5 rounded-xl hover:bg-slate-100 hover:scale-105 transition-all shadow-lg"
              >
                Voir les produits
                <ArrowRight className="w-5 h-5" />
              </Link>
              {settings?.whatsapp_number && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400
                             text-white font-bold px-7 py-3.5 rounded-xl hover:scale-105 transition-all shadow-lg"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES ───────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Catégories</h2>
              <p className="text-gray-500 text-sm mt-1">Explorez par catégorie</p>
            </div>
            <Link to="/products"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 transition">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingC ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune catégorie disponible.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800
                             hover:shadow-lg transition-shadow"
                >
                  {cat.image_url && (
                    <img src={cat.image_url} alt={cat.name} loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-60
                                 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm leading-tight">{cat.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">{cat.product_count} produit{cat.product_count !== 1 ? 's' : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUITS VEDETTES ────────────────────────────────── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Produits vedettes</h2>
              <p className="text-gray-500 text-sm mt-1">Nos meilleures sélections</p>
            </div>
            <Link to="/products"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 transition">
              Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingP ? (
            <ProductGridSkeleton count={4} />
          ) : featured.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun produit vedette disponible.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {featured.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={settings?.currency || 'BIF'}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700
                         font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition"
            >
              Voir tout le catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION PROMO ────────────────────────────────────── */}
      <section className="py-14 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-8 md:p-12
                          flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Commandez en toute simplicité
              </h3>
              <p className="text-slate-300 max-w-md">
                Ajoutez vos articles au panier et envoyez votre commande directement via WhatsApp
                ou email. Rapide, simple et sans friction.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {settings?.whatsapp_number && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500
                             text-white font-semibold px-5 py-3 rounded-xl transition whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  WhatsApp
                </a>
              )}
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100
                           text-slate-900 font-semibold px-5 py-3 rounded-xl transition whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4" />
                Mon panier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Nous contacter</h2>
            <p className="text-gray-500 text-sm mt-1">Disponible pour répondre à vos questions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`}
                className="flex flex-col items-center gap-2 bg-white rounded-3xl p-6
                           border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-2">Téléphone</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-slate-700 transition">{settings.phone}</p>
              </a>
            )}

            {settings?.whatsapp_number && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 bg-white rounded-3xl p-6
                           border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <WhatsAppIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-2">WhatsApp</p>
                <p className="text-sm font-semibold text-green-600">+{settings.whatsapp_number}</p>
              </a>
            )}

            {settings?.email && (
              <a href={`mailto:${settings.email}`}
                className="flex flex-col items-center gap-2 bg-white rounded-3xl p-6
                           border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-2">Email</p>
                <p className="text-sm font-semibold text-gray-900 break-all group-hover:text-blue-600 transition">{settings.email}</p>
              </a>
            )}

            {settings?.address && (
              <div className="flex flex-col items-center gap-2 bg-white rounded-3xl p-6
                              border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-2">Adresse</p>
                <p className="text-sm font-semibold text-gray-900">{settings.address}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
