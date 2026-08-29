import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../../components/Icons.jsx';
import useSettings from '../../hooks/useSettings.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function Contact() {
  const { settings, loading } = useSettings();

  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`
    : '#';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactez-nous</h1>
          <p className="text-gray-500">Nous sommes disponibles pour répondre à toutes vos questions.</p>
        </div>

        {/* Cartes de contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">

          {settings?.phone && (
            <a href={`tel:${settings.phone}`}
              className="flex items-start gap-4 bg-white rounded-3xl p-6 border border-gray-100
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Téléphone</p>
                <p className="text-gray-900 font-medium group-hover:text-slate-700 transition">{settings.phone}</p>
              </div>
            </a>
          )}

          {settings?.whatsapp_number && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-4 bg-white rounded-3xl p-6 border border-gray-100
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <WhatsAppIcon className="w-7 h-7 text-white" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">WhatsApp</p>
                <p className="text-green-600 font-medium">Envoyer un message</p>
              </div>
            </a>
          )}

          {settings?.email && (
            <a href={`mailto:${settings.email}`}
              className="flex items-start gap-4 bg-white rounded-3xl p-6 border border-gray-100
                         hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-gray-900 font-medium break-all group-hover:text-blue-600 transition">{settings.email}</p>
              </div>
            </a>
          )}

          {settings?.address && (
            <div className="flex items-start gap-4 bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Adresse</p>
                <p className="text-gray-900 font-medium">{settings.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA vers le catalogue */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-2">Prêt à commander ?</h3>
          <p className="text-slate-400 text-sm mb-5">Parcourez notre catalogue et commandez facilement.</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-white text-slate-900
                       font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition">
            Voir les produits <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Contact;
