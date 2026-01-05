import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MapPin, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-mangoes.jpg';

const Hero = () => {
  const { t } = useLanguage();

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 mb-6">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{t('hero.badge')}</span>
          </div>

          {/* Subtitle */}
          <p className="text-sm md:text-base uppercase tracking-[0.3em] text-primary mb-4 font-medium">
            {t('hero.subtitle')}
          </p>

          {/* Main Title */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-background">
            {t('hero.title')}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-background/80 max-w-xl mb-10 leading-relaxed">
            {t('hero.description')}
          </p>

          {/* CTA */}
          <Button 
            onClick={scrollToProducts}
            size="lg" 
            className="bg-gradient-hero hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-elevated transition-all hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t('hero.cta')}
          </Button>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap gap-6 text-background/80">
            <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-xl">✓</span>
              <span className="text-sm font-medium">GI Certified</span>
            </div>
            <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-xl">🌿</span>
              <span className="text-sm font-medium">100% Natural</span>
            </div>
            <div className="flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-xl">📦</span>
              <span className="text-sm font-medium">Free Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
