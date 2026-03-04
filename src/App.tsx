import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { LuxuryNavigation } from './components/LuxuryNavigation';
import { Hero } from '@/components/ui/animated-hero';
import { CollectionSection } from './components/CollectionSection';
import { LifestyleSection } from './components/LifestyleSection';
import { TheFirmSection } from './components/TheFirmSection';
import { OffMarketSection } from './components/OffMarketSection';
import { LuxuryFooter } from './components/LuxuryFooter';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PropertyEditor } from './components/admin/PropertyEditor';
import { XmlImportPage } from './components/admin/XmlImportPage';
import { AdminSettings } from './components/admin/AdminSettings';

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen">
      <LuxuryNavigation />
      <main>
        <Hero />
        <CollectionSection />
        <LifestyleSection />
        <TheFirmSection />
        <OffMarketSection />
      </main>
      <LuxuryFooter />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/inmueble/:id" element={<PropertyDetailPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="propiedades/nueva" element={<PropertyEditor />} />
              <Route path="propiedades/:id" element={<PropertyEditor />} />
              <Route path="importar" element={<XmlImportPage />} />
              <Route path="configuracion" element={<AdminSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}