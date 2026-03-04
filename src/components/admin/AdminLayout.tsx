import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Home as HomeIcon,
  Plus,
  FileUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';

export function AdminLayout() {
  const { isAuthenticated, username, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Propiedades' },
    { to: '/admin/propiedades/nueva', icon: Plus, label: 'Nuevo Inmueble' },
    { to: '/admin/importar', icon: FileUp, label: 'Importar XML' },
    { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy transform transition-transform duration-200 lg:translate-x-0 lg:static lg:flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-playfair text-lg text-white font-bold">
                  SunEliteHomes
                </h2>
                <p className="font-montserrat text-xs text-brand-gold mt-0.5">
                  Admin Panel
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 font-montserrat text-sm rounded transition-colors ${
                    isActive
                      ? 'bg-brand-gold/20 text-brand-gold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-brand-gold/30 text-brand-gold flex items-center justify-center rounded-full font-montserrat font-semibold text-sm">
                {(username || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="font-montserrat text-sm text-white/80 truncate">
                {username}
              </span>
            </div>
            <div className="flex gap-2">
              <a
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-xs font-montserrat text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors flex-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Sitio Web
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-xs font-montserrat text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-brand-gold" />
            <span className="font-montserrat text-sm text-gray-500">
              Panel de Administración
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
