import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { database, ref, push } from '@/lib/firebase';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { language, t } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate Mumbai pincode (starts with 400)
    if (!formData.pincode.startsWith('400')) {
      toast.error('Sorry, we only deliver in Mumbai. Please enter a valid Mumbai pincode.');
      return;
    }

    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/auth', { state: { from: '/checkout' } });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId: user.uid,
        customer: {
          ...formData,
          email: user.email,
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          nameMarathi: item.nameMarathi,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
        })),
        totalPrice,
        status: 'pending',
        messages: [],
        createdAt: new Date().toISOString(),
      };

      await push(ref(database, 'orders'), orderData).then(ref => {
        setLastOrderId(ref.key || '');
      });
      
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4 shadow-elevated">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-secondary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t('checkout.success')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('checkout.successMsg')}
              </p>
              
              {lastOrderId && (
                <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {language === 'mr' ? 'ऑर्डर ID' : 'Order ID'}
                  </p>
                  <p className="text-lg font-mono text-primary font-bold">#{lastOrderId.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {language === 'mr' 
                      ? 'तुमचा ऑर्डर प्रलंबित आहे. व्यवस्थापक त्वरीच पुष्टी देईल.'
                      : 'Your order is pending. Admin will confirm shortly.'
                    }
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/orders')}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {language === 'mr' ? 'माझे ऑर्डर पाहा' : 'View My Orders'}
                </Button>
                <Button
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                    }, 100);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {language === 'mr' ? 'होमवर परत जा' : 'Back to Home'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            {t('checkout.title')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card shadow-soft">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">{t('checkout.name')} *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">{t('checkout.address')} *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-2"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="pincode">{t('checkout.pincode')} *</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="400XXX"
                          className="mt-2"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {t('checkout.mumbaiOnly')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">{t('checkout.notes')}</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-2"
                        rows={2}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-hero text-primary-foreground font-semibold py-6 text-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        t('checkout.place')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-card shadow-card sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-6">
                    {t('admin.orderDetails')}
                  </h3>

                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === 'mr' ? item.nameMarathi : item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>{t('cart.total')}</span>
                      <span className="text-primary">₹{totalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
