# Animated Hero Component Integration

## ✅ Successfully Integrated!

The animated hero component has been successfully added to your luxury real estate website.

## 📁 Files Created

1. **`/src/components/ui/animated-hero.tsx`** - Main animated hero component
2. **`/src/components/HeroDemo.tsx`** - Demo/example usage component

## 📦 Dependencies Installed

- ✅ `framer-motion` - For smooth animations
- ✅ `@radix-ui/react-slot` - Already installed
- ✅ `class-variance-authority` - Already installed  
- ✅ `lucide-react` - Already installed

## 🛠️ Configuration Updates

### Updated Files:
1. **tsconfig.json** - Added path alias mapping:
   ```json
   {
     "baseUrl": ".",
     "paths": {
       "@/*": ["./src/*"]
     }
   }
   ```

2. **vite.config.ts** - Added `@` alias resolution:
   ```typescript
   alias: {
     '@': path.resolve(__dirname, './src'),
     // ... other aliases
   }
   ```

3. **button.tsx** - Fixed import paths to use `@/lib/utils`

## 🎯 How to Use

### Option 1: Use the Demo Component

```tsx
import { HeroDemo } from "@/components/HeroDemo";

function App() {
  return <HeroDemo />;
}
```

### Option 2: Use the Hero Component Directly

```tsx
import { Hero } from "@/components/ui/animated-hero";

function MyPage() {
  return (
    <div>
      <Hero />
      {/* Your other content */}
    </div>
  );
}
```

## 🎨 Customization

### Change the Animated Words

Edit the `titles` array in `/src/components/ui/animated-hero.tsx`:

```tsx
const titles = useMemo(
  () => ["amazing", "new", "wonderful", "beautiful", "smart"],
  []
);
```

Replace with your own words:
```tsx
const titles = useMemo(
  () => ["luxury", "exclusive", "exceptional", "prestigious", "elite"],
  []
);
```

### Customize Colors

The component uses Tailwind CSS classes. Update the color in the component:

```tsx
<span className="text-spektr-cyan-50">This is something</span>
```

Change to your brand colors:
```tsx
<span className="text-brand-gold">This is something</span>
```

### Adjust Animation Speed

Change the timeout duration (currently 2000ms = 2 seconds):

```tsx
const timeoutId = setTimeout(() => {
  // ... animation logic
}, 2000); // Change this value
```

### Modify Text Content

Edit the main heading and description:

```tsx
<h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
  <span className="text-brand-gold">Your Heading Here</span>
  {/* animated words */}
</h1>

<p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
  Your description text here...
</p>
```

### Customize Buttons

The component uses two buttons. Modify them in the component:

```tsx
<Button size="lg" className="gap-4" variant="outline">
  Your CTA Text <PhoneCall className="w-4 h-4" />
</Button>
<Button size="lg" className="gap-4">
  Your Primary CTA <MoveRight className="w-4 h-4" />
</Button>
```

## 🎬 Animation Details

- **Type**: Spring animation with stiffness: 50
- **Direction**: Words slide up/down based on sequence
- **Interval**: 2 seconds between word changes
- **Loop**: Automatically loops through all words infinitely

## 📱 Responsive Design

The component is fully responsive:
- **Mobile**: `text-5xl`, `py-20`
- **Desktop**: `text-7xl`, `py-40`, `lg:py-40`

## 🔧 Integration with Your Luxury Real Estate Site

### Recommended Usage:

You could replace or complement your existing `LuxuryHero` component:

```tsx
// In App.tsx
import { LuxuryNavigation } from './components/LuxuryNavigation';
import { Hero } from '@/components/ui/animated-hero'; // New animated hero
// ... other imports

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <LuxuryNavigation />
        <main>
          <Hero /> {/* Use the new animated hero */}
          <CollectionSection />
          {/* ... other sections */}
        </main>
        <LuxuryFooter />
      </div>
    </LanguageProvider>
  );
}
```

### Customize for Luxury Real Estate:

```tsx
// Modify the titles to match your brand
const titles = useMemo(
  () => ["exceptional", "exclusive", "prestigious", "luxurious", "elite"],
  []
);

// Update the heading
<h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center">
  <span className="text-brand-gold">Architecture for the</span>
  <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
    {/* animated words */}
  </span>
</h1>

// Update the description
<p className="text-lg md:text-xl leading-relaxed tracking-tight text-brand-lightgrey max-w-2xl text-center">
  Curated estates where coastal serenity meets urban sophistication. 
  SunEliteHomes represents the pinnacle of luxury real estate in Europe's 
  most coveted locations.
</p>

// Update buttons
<Button size="lg" className="gap-4 btn-gold-outline" variant="outline">
  Schedule Viewing <PhoneCall className="w-4 h-4" />
</Button>
<Button size="lg" className="gap-4 btn-gold">
  View Collection <MoveRight className="w-4 h-4" />
</Button>
```

## 🌐 Translation Support

To add translation support (matching your existing setup):

```tsx
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  
  const titles = useMemo(
    () => language === 'es' 
      ? ["excepcional", "exclusivo", "prestigioso", "lujoso", "élite"]
      : ["exceptional", "exclusive", "prestigious", "luxurious", "elite"],
    [language]
  );
  
  // Use t.title, t.subtitle, t.cta for text content
}
```

## 🎨 Styling Notes

- Uses Tailwind CSS v4 (already configured in your project)
- Compatible with your existing brand colors (`brand-gold`, `brand-navy`, etc.)
- Follows shadcn/ui component patterns
- Fully responsive with mobile-first approach

## 🚀 Next Steps

1. **Test the component**: Visit your dev server to see it in action
2. **Customize the content**: Update text, colors, and buttons to match your brand
3. **Add translations**: Integrate with your existing `LanguageContext`
4. **Adjust animations**: Tweak timing and animation parameters as needed
5. **Replace or complement**: Decide whether to replace `LuxuryHero` or use alongside it

## 💡 Tips

- The animation runs automatically on mount
- Each word change is smooth and spring-based
- The component is self-contained and reusable
- Works perfectly with your existing Tailwind setup
- Compatible with your bilingual (ES/EN) system

---

**Questions or issues?** The component is ready to use. Simply import and customize!
