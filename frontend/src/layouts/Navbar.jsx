import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import useSettings from '../hooks/useSettings.js';

function Navbar() {
  const { totalItems } = useCart();
  const { settings }   = useSettings();
  const navigate        = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled]     = useState(false);

  // Ombre au scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/',          label: 'Accueil'   },
    { to: '/products',  label: 'Produits'  },
    { to: '/contact',   label: 'Contact'   },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'}`;

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100
                        transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.jpg" alt="Logo Clopofeco" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-slate-900 text-base tracking-tight">
              {settings?.business_name || 'Clopofeco'}
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-1">

            {/* Recherche desktop */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-56 px-3 py-1.5 text-sm border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button type="button" onClick={() => setSearchOpen(false)}
                  className="ml-1 p-1.5 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                className="hidden md:flex p-2 text-gray-500 hover:text-slate-900 hover:bg-gray-100
                           rounded-lg transition">
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Panier */}
            <Link to="/cart"
              className="relative p-2 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                                 bg-slate-800 text-white text-[10px] font-bold rounded-full
                                 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Menu hamburger mobile */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="md:hidden p-2 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 pb-4 space-y-1">

            {/* Recherche mobile */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 px-1 pb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button type="submit"
                className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${isActive ? 'bg-gray-100 text-slate-900' : 'text-gray-600 hover:bg-gray-50 hover:text-slate-900'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
