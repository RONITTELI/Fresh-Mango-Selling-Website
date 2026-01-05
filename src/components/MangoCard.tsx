import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart, Mango } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Check } from 'lucide-react';

interface MangoCardProps {
  mango: Mango;
}

const MangoCard = ({ mango }: MangoCardProps) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(mango);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const name = language === 'mr' ? mango.nameMarathi : mango.name;
  const description = language === 'mr' ? mango.descriptionMarathi : mango.description;

  return (
    <Card className="group overflow-hidden bg-card border-border/50 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2">
      {/* Image Container */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img 
          src={mango.image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg">
          ₹{mango.price}
        </div>
      </div>

      <CardContent className="p-5 md:p-6">
        {/* Name */}
        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
          {name}
        </h3>

        {/* Weight */}
        <p className="text-sm text-muted-foreground mb-3 font-medium">
          {mango.weight} <span className="text-primary">• {t('products.perDozen')}</span>
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-5 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={added}
          className={`w-full font-semibold transition-all ${
            added 
              ? 'bg-secondary hover:bg-secondary text-secondary-foreground' 
              : 'bg-gradient-hero hover:opacity-90 text-primary-foreground'
          }`}
        >
          {added ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t('products.added')}
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('products.addToCart')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MangoCard;
