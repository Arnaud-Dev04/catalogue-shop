import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import useSettings from '../hooks/useSettings.js';

function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`
    : '#';

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Colonne 1 : Marque */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">
                {settings?.business_name || 'Clopofeco'}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Votre destination pour des produits de qualité. Commandez facilement via WhatsApp ou email.
            </p>

            {/* WhatsApp CTA */}
            {settings?.whatsapp_number && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600
                           hover:bg-green-500 text-white text-sm font-medium rounded-xl transition"
              >
                <MessageCircle className="w-4 h-4" />
                Commander sur WhatsApp
              </a>
            )}
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/',         label: 'Accueil' },
                { to: '/products', label: 'Produits' },
                { to: '/cart',     label: 'Mon panier' },
                { to: '/contact',  label: 'Contact' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              {settings?.phone && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>{settings.phone}</span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-start gap-2 text-slate-400">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <a href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors break-all">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.whatsapp_number && (
                <li className="flex items-start gap-2 text-slate-400">
                  <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors">
                    WhatsApp
                  </a>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bas du footer */}
        <div className="border-t border-slate-800 mt-10 pt-6 text-xs text-slate-500 text-center">
          &copy; {year} {settings?.business_name || 'Clopofeco'}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
