import { useLanguage } from '@/contexts/LanguageContext';
import { mangoes } from '@/data/mangoes';
import MangoCard from './MangoCard';

const ProductsSection = () => {
  const { t } = useLanguage();

  return (
    <section id="products" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('products.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {mangoes.map((mango, index) => (
            <div 
              key={mango.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <MangoCard mango={mango} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
