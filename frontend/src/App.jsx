import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contextes
import { AuthProvider }    from './context/AuthContext.jsx';
import { CartProvider }    from './context/CartContext.jsx';

// Layouts
import PublicLayout        from './layouts/PublicLayout.jsx';
import AdminLayout         from './layouts/AdminLayout.jsx';

// Garde
import ProtectedRoute      from './components/ProtectedRoute.jsx';

// Pages publiques
import Home                from './pages/public/Home.jsx';
import Products            from './pages/public/Products.jsx';
import ProductDetail       from './pages/public/ProductDetail.jsx';
import Cart                from './pages/public/Cart.jsx';
import Contact             from './pages/public/Contact.jsx';
import About               from './pages/public/About.jsx';
import NotFound            from './pages/public/NotFound.jsx';

// Pages admin
import AdminLogin          from './pages/admin/AdminLogin.jsx';
import AdminDashboard      from './pages/admin/AdminDashboard.jsx';
import AdminProducts       from './pages/admin/AdminProducts.jsx';
import AdminProductForm    from './pages/admin/AdminProductForm.jsx';
import AdminCategories     from './pages/admin/AdminCategories.jsx';
import AdminCategoryForm   from './pages/admin/AdminCategoryForm.jsx';
import AdminSettings       from './pages/admin/AdminSettings.jsx';
import AdminUsers          from './pages/admin/AdminUsers.jsx';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* ── Routes publiques (Navbar + Footer) ── */}
            <Route element={<PublicLayout />}>
              <Route path="/"                 element={<Home />} />
              <Route path="/products"         element={<Products />} />
              <Route path="/products/:id"     element={<ProductDetail />} />
              <Route path="/categories/:slug" element={<Products />} />
              <Route path="/cart"             element={<Cart />} />
              <Route path="/contact"          element={<Contact />} />
              <Route path="/about"            element={<About />} />
              <Route path="*"                 element={<NotFound />} />
            </Route>

            {/* ── Page de login (sans layout) ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ── Routes admin protégées (avec AdminLayout) ── */}
            <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin/dashboard"      element={<AdminDashboard />} />
              
              {/* CRUD Produits */}
              <Route path="/admin/products"       element={<AdminProducts />} />
              <Route path="/admin/products/new"   element={<AdminProductForm />} />
              <Route path="/admin/products/:id"   element={<AdminProductForm />} />
              
              {/* CRUD Catégories */}
              <Route path="/admin/categories"       element={<AdminCategories />} />
              <Route path="/admin/categories/new"   element={<AdminCategoryForm />} />
              <Route path="/admin/categories/:id"   element={<AdminCategoryForm />} />
              
              <Route path="/admin/settings"         element={<AdminSettings />} />
              <Route path="/admin/users"            element={<AdminUsers />} />
            </Route>

            {/* Redirection /admin → /admin/dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
