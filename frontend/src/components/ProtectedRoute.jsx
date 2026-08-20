import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protège les routes admin.
 * - Si l'auth est en cours de vérification → spinner
 * - Si non connecté → redirige vers /admin/login (en mémorisant la page tentée)
 * - Si connecté → affiche le contenu
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Mémorise la page tentée pour y rediriger après connexion
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
