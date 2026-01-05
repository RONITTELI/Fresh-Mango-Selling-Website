import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { database, ref, onValue } from '@/lib/firebase';
import { MessageCircle, Package, MapPin, Phone, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface OrderMessage {
  timestamp: string;
  senderType: 'admin' | 'user';
  message: string;
}

interface Order {
  id: string;
  userId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
  };
  items: Array<{
    name: string;
    nameMarathi: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected';
  messages?: OrderMessage[];
  createdAt: string;
}

const UserOrdersPage = () => {
  const { language, t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch orders for this user using userId
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const userOrders = Object.entries(data)
            .map(([id, order]) => ({
              id,
              ...(order as Omit<Order, 'id'>),
            }))
            .filter((order) => order.userId === user.uid)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(userOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error loading orders:', err);
        toast.error(language === 'mr' ? 'ऑर्डर लोड करण्यात अयशस्वी' : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user, language]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return language === 'mr' ? 'पुष्टी केलेले' : 'Confirmed';
      case 'rejected':
        return language === 'mr' ? 'नाकारलेले' : 'Rejected';
      default:
        return language === 'mr' ? 'प्रलंबित' : 'Pending';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-12 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                {language === 'mr' ? 'कृपया आपले ऑर्डर पाहण्यासाठी लॉगिन करा' : 'Please log in to view your orders'}
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              {language === 'mr' ? 'माझे ऑर्डर' : 'My Orders'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'mr' ? 'आपल्या सर्व ऑर्डरचा इतिहास आणि स्थिती' : 'View all your orders and their status'}
            </p>
          </div>

          {orders.length === 0 ? (
            <Card className="bg-card shadow-soft">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'mr' ? 'अजूनही कोणताही ऑर्डर नाही' : 'No orders yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="bg-card shadow-soft overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-display text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          Order #{order.id.slice(-6).toUpperCase()}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5">
                    {/* Order Details */}
                    <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {language === 'mr' ? 'डिलिव्हरी पत्ता' : 'Delivery Address'}
                      </h4>
                      <p className="text-sm font-medium">{order.customer.address}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.pincode}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <Phone className="h-3 w-3" />
                        {order.customer.phone}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <Mail className="h-3 w-3" />
                        {order.customer.email}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">
                        {language === 'mr' ? 'वस्तू' : 'Items'}
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                        <span>{language === 'mr' ? 'एकूण' : 'Total'}</span>
                        <span>₹{order.totalPrice}</span>
                      </div>
                    </div>

                    {/* Messages */}
                    {order.messages && order.messages.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          {language === 'mr' ? 'संदेश' : 'Messages'}
                        </h4>
                        <div className="space-y-3">
                          {order.messages.map((msg, idx) => (
                            <div key={idx} className="bg-white p-3 rounded border-l-4 border-primary">
                              <p className="text-xs text-muted-foreground mb-1">
                                {new Date(msg.timestamp).toLocaleString()} •{' '}
                                {msg.senderType === 'admin'
                                  ? language === 'mr'
                                    ? 'प्रशासक'
                                    : 'Admin'
                                  : language === 'mr'
                                  ? 'तुम्ही'
                                  : 'You'}
                              </p>
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserOrdersPage;
