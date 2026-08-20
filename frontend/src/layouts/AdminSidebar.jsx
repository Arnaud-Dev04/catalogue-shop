import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Settings,
  LogOut, ShoppingBag, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/products',    label: 'Produits',     icon: Package         },
  { to: '/admin/categories',  label: 'Catégories',   icon: Tag             },
  { to: '/admin/settings',    label: 'Paramètres',   icon: Settings        },
];

function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
     ${isActive
       ? 'bg-white text-slate-900 shadow-sm'
       : 'text-slate-400 hover:text-white hover:bg-white/10'}`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">Administration</p>
          <p className="text-slate-400 text-xs truncate">{user?.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                     font-medium text-slate-400 hover:text-white hover:bg-red-500/20 transition"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-slate-900 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Header mobile avec menu hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 flex items-center
                      justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-sm">Administration</span>
        </div>
        <button onClick={() => setOpen(p => !p)}
          className="p-1.5 text-slate-400 hover:text-white transition">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50"
               onClick={() => setOpen(false)} />
          <div className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 shadow-2xl">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}

export default AdminSidebar;
