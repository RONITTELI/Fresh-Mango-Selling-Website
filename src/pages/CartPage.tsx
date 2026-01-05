import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { language, t } = useLanguage();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {t('cart.title')}
          </h1>

          {items.length === 0 ? (
            <Card className="bg-card shadow-soft">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-6">{t('cart.empty')}</p>
                <Link to="/">
                  <Button className="bg-gradient-hero text-primary-foreground">
                    {t('hero.cta')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <Card key={item.id} className="bg-card shadow-soft overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-lg flex items-center justify-center text-4xl">
                          🥭
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {language === 'mr' ? item.nameMarathi : item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.weight}</p>
                          <p className="text-primary font-bold mt-1">₹{item.price}</p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="bg-card shadow-card sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-6">
                      Order Summary
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Items ({totalItems})</span>
                        <span>₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery</span>
                        <span className="text-secondary font-medium">Free</span>
                      </div>
                      <div className="border-t border-border pt-3">
                        <div className="flex justify-between text-lg font-bold text-foreground">
                          <span>{t('cart.total')}</span>
                          <span className="text-primary">₹{totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <Link to="/checkout">
                      <Button className="w-full bg-gradient-hero text-primary-foreground font-semibold py-6">
                        {t('cart.checkout')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {t('checkout.mumbaiOnly')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
