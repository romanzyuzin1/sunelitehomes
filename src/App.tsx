import { LanguageProvider } from './contexts/LanguageContext';
import { LuxuryNavigation } from './components/LuxuryNavigation';
import { Hero } from '@/components/ui/animated-hero';
import { CollectionSection } from './components/CollectionSection';
import { LifestyleSection } from './components/LifestyleSection';
import { TheFirmSection } from './components/TheFirmSection';
import { OffMarketSection } from './components/OffMarketSection';
import { LuxuryFooter } from './components/LuxuryFooter';

export default function App() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}