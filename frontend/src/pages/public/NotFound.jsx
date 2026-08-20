import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-extrabold text-gray-100 select-none mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Page introuvable</h1>
      <p className="text-gray-400 text-sm max-w-sm mb-8">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700
                     font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <Link to="/"
          className="inline-flex items-center gap-2 bg-slate-800 text-white
                     font-medium px-5 py-2.5 rounded-xl hover:bg-slate-700 transition">
          <Home className="w-4 h-4" /> Accueil
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
