import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Contenu principal */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Espace pour le header mobile */}
        <div className="lg:hidden h-14 flex-shrink-0" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
