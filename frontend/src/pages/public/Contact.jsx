import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
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
              className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100
                         hover:shadow-md transition group">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Téléphone</p>
                <p className="text-gray-600 text-sm group-hover:text-slate-800 transition">{settings.phone}</p>
              </div>
            </a>
          )}

          {settings?.whatsapp_number && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100
                         hover:shadow-md transition group">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">WhatsApp</p>
                <p className="text-green-600 text-sm font-medium">Envoyer un message</p>
              </div>
            </a>
          )}

          {settings?.email && (
            <a href={`mailto:${settings.email}`}
              className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100
                         hover:shadow-md transition group">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Email</p>
                <p className="text-gray-600 text-sm break-all group-hover:text-slate-800 transition">{settings.email}</p>
              </div>
            </a>
          )}

          {settings?.address && (
            <div className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">Adresse</p>
                <p className="text-gray-600 text-sm">{settings.address}</p>
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
