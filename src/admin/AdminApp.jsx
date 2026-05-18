import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Dashboard from './Dashboard';
import CategoriesManager from './CategoriesManager';
import ProductsManager from './ProductsManager';
import ConfigManager from './ConfigManager';
import BlogManager from './BlogManager';
import Login from './Login';

// LISTA DE CORREOS AUTORIZADOS
const ALLOWED_EMAILS = [
  'jorgemario224@gmail.com', // desarrollador
  'paulabueno73@gmail.com', // contratante
  'mia.floristeriapereira@gmail.com' // empleados
];

const AdminLayout = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/categories', label: 'Categorías' },
    { path: '/admin/products', label: 'Productos' },
    { path: '/admin/blog', label: 'Blog' },
    { path: '/admin/config', label: 'Configuración' },
  ];

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-lg font-serif font-bold text-florencia-dark leading-tight">Florencia<br />Administrador</h1>
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-6 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path
                    ? 'bg-florencia-gold/10 text-florencia-gold border-r-2 border-florencia-gold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-gray-200" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8">
          <button
            className="md:hidden p-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-xl font-medium text-gray-800 truncate">
            {navItems.find(item => item.path === location.pathname)?.label || 'Panel'}
          </h2>
        </header>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const AdminApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (ALLOWED_EMAILS.includes(currentUser.email)) {
          if (currentUser.emailVerified) {
            setUser(currentUser);
            setError(null);
          } else {
            // Si el correo no está verificado, cerrar sesión
            signOut(auth);
            setError('Tu correo electrónico no ha sido verificado. Por favor, verifícalo para continuar.');
            setUser(null);
          }
        } else {
          // Si el correo no está en la lista, cerrar sesión automáticamente
          signOut(auth);
          setError('Tu cuenta de Google no tiene permisos para acceder a este panel.');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-florencia-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-florencia-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login error={error} />;
  }

  return (
    <AdminLayout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<CategoriesManager />} />
        <Route path="/products" element={<ProductsManager />} />
        <Route path="/blog" element={<BlogManager />} />
        <Route path="/config" element={<ConfigManager />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
