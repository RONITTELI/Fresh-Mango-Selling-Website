import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { database, ref, onValue, update, query, orderByChild, limitToLast } from '@/lib/firebase';
import { CheckCircle, Clock, Package, User, MapPin, Phone, Loader2, AlertCircle, Shield, ShieldOff, Ban, RotateCcw, MessageCircle, X, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface OrderMessage {
  timestamp: string;
  senderType: 'admin' | 'user';
  message: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    pincode: string;
    notes?: string;
  };
  items: Array<{
    id: string;
    name: string;
    nameMarathi: string;
    price: number;
    quantity: number;
    weight: string;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected';
  messages?: OrderMessage[];
  createdAt: string;
}

interface AppUser {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pincode: string;
  createdAt?: string;
}

type RoleRecord = {
  admin?: boolean;
  suspended?: boolean;
};

const AdminPage = () => {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<Record<string, RoleRecord>>({});
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const ordersQuery = query(
      ref(database, 'orders'),
      orderByChild('createdAt'),
      limitToLast(50)
    );

    const unsubscribe = onValue(ordersQuery, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const ordersArray = Object.entries(data).map(([id, order]) => ({
            id,
            ...(order as Omit<Order, 'id'>)
          }));
          ordersArray.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(ordersArray);
        } else {
          setOrders([]);
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error loading orders:', err);
        setError('Failed to load orders');
        setLoading(false);
      }
    }, (err) => {
      if (import.meta.env.DEV) console.error('Firebase error:', err);
      setError('Connection error');
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const usersUnsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.entries(data).map(([id, user]) => ({ id, ...(user as Omit<AppUser, 'id'>) }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    const rolesRef = ref(database, 'userRoles');
    const rolesUnsub = onValue(rolesRef, (snapshot) => {
      const data = snapshot.val();
      setRoles(data || {});
    });

    return () => {
      usersUnsub();
      rolesUnsub();
    };
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await update(ref(database, `orders/${orderId}`), {
        status: 'confirmed'
      });
      toast.success(language === 'mr' ? 'ऑर्डर पुष्टी केली!' : 'Order confirmed!');
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error(language === 'mr' ? 'ऑर्डर पुष्टी अयशस्वी' : 'Failed to confirm order');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await update(ref(database, `orders/${orderId}`), {
        status: 'rejected'
      });
      toast.success(language === 'mr' ? 'ऑर्डर नाकारलेला!' : 'Order rejected!');
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error(language === 'mr' ? 'ऑर्डर नाकारणे अयशस्वी' : 'Failed to reject order');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleSendMessage = async (orderId: string) => {
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingMessage(true);
    try {
      const order = orders.find(o => o.id === orderId);
      const messages = order?.messages || [];
      
      const newMessage: OrderMessage = {
        timestamp: new Date().toISOString(),
        senderType: 'admin',
        message: messageText.trim()
      };

      await update(ref(database, `orders/${orderId}`), {
        messages: [...messages, newMessage]
      });

      setMessageText('');
      setSelectedOrderId(null);
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');
  const rejectedOrders = orders.filter(o => o.status === 'rejected');

  const adminEmailAllowlist = useMemo(() => (
    (import.meta.env.VITE_ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean)
  ), []);

  const isAdminEmail = (email?: string | null) => {
    if (!email) return false;
    return adminEmailAllowlist.includes(email.toLowerCase());
  };

  const userRole = (uid?: string) => {
    if (!uid) return { admin: false, suspended: false };
    const dbRole = roles[uid] || {};
    const user = users.find(u => u.uid === uid);
    return {
      admin: dbRole.admin === true || isAdminEmail(user?.email),
      suspended: dbRole.suspended === true,
    };
  };

  const handleRoleUpdate = async (uid: string, payload: RoleRecord, successMessage: string) => {
    setUpdatingUserId(uid);
    try {
      await update(ref(database, `userRoles/${uid}`), payload);
      toast.success(successMessage);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Role update error:', err);
      toast.error('Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="bg-card shadow-soft mb-4 overflow-hidden">
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
          <Badge 
            variant={order.status === 'confirmed' ? 'default' : 'secondary'}
            className={order.status === 'confirmed' 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-primary/20 text-primary'
            }
          >
            {order.status === 'confirmed' ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> {t('admin.confirmed')}</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" /> {t('admin.pending')}</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {/* Customer Info */}
        <div className="mb-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('admin.customer')}
          </h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{order.customer.name}</p>
            <p className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {order.customer.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              {order.customer.phone}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="h-3 w-3 mt-1" />
              {order.customer.address}, {order.customer.pincode}
            </p>
            {order.customer.notes && (
              <p className="italic">Note: {order.customer.notes}</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">{t('admin.items')}</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {language === 'mr' ? item.nameMarathi : item.name} 
                  <span className="text-muted-foreground"> x {item.quantity}</span>
                </span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
          <span>{t('cart.total')}</span>
          <span className="text-primary">₹{order.totalPrice}</span>
        </div>

        {/* Accept Button */}
        {order.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => handleAcceptOrder(order.id)}
              disabled={acceptingId === order.id}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {acceptingId === order.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('admin.accept')}
                </>
              )}
            </Button>
            <Button
              onClick={() => handleRejectOrder(order.id)}
              disabled={acceptingId === order.id}
              variant="destructive"
              className="flex-1"
            >
              {acceptingId === order.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        )}

        {/* Messaging Section */}
        {selectedOrderId === order.id && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Send Message to Customer
            </h4>
            <Textarea
              placeholder="Type your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="mb-2 resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleSendMessage(order.id)}
                disabled={sendingMessage || !messageText.trim()}
                size="sm"
                className="flex-1"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </Button>
              <Button
                onClick={() => {
                  setSelectedOrderId(null);
                  setMessageText('');
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {selectedOrderId !== order.id && (order.status === 'confirmed' || order.status === 'rejected') && (
          <Button
            onClick={() => setSelectedOrderId(order.id)}
            variant="outline"
            size="sm"
            className="w-full mt-4 gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Send Message
          </Button>
        )}

        {/* Messages Display */}
        {order.messages && order.messages.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3">Messages</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {order.messages.map((msg, idx) => (
                <div key={idx} className="bg-white p-2 rounded text-sm border-l-2 border-primary">
                  <p className="text-xs text-muted-foreground mb-1">
                    {msg.senderType === 'admin' ? '🔒 Admin' : '👤 Customer'} • {new Date(msg.timestamp).toLocaleString()}
                  </p>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {t('admin.title')}
            </h1>
            <div className="flex gap-3">
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <Clock className="h-3 w-3 mr-1.5" />
                {pendingOrders.length} {t('admin.pending')}
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <CheckCircle className="h-3 w-3 mr-1.5" />
                {confirmedOrders.length} {t('admin.confirmed')}
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                <X className="h-3 w-3 mr-1.5" />
                {rejectedOrders.length} Rejected
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                {language === 'mr' ? 'ऑर्डर्स लोड होत आहेत...' : 'Loading orders...'}
              </p>
            </div>
          ) : error ? (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  {language === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Try Again'}
                </Button>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">{t('admin.noOrders')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {language === 'mr' 
                    ? 'जेव्हा ग्राहक ऑर्डर देतील तेव्हा ते येथे दिसतील'
                    : 'Orders will appear here when customers place them'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-6">
                <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {t('admin.pending')} ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                  {t('admin.confirmed')} ({confirmedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                  Rejected ({rejectedOrders.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
                  Users ({users.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pendingOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {pendingOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'mr' ? 'प्रलंबित ऑर्डर नाहीत' : 'No pending orders'}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="confirmed">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {confirmedOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {confirmedOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'mr' ? 'पुष्टी केलेले ऑर्डर नाहीत' : 'No confirmed orders yet'}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="rejected">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {rejectedOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {rejectedOrders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No rejected orders
                  </p>
                )}
              </TabsContent>

              <TabsContent value="users">
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      User Admin Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    {users.length === 0 ? (
                      <p className="text-muted-foreground">No users yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {users.map((user) => {
                          const role = userRole(user.uid);
                          return (
                            <div
                              key={user.id}
                              className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                              <div>
                                <p className="font-semibold text-foreground flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  {user.name || 'Unnamed User'}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <Mail className="h-4 w-4" />
                                  {user.email}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone} · {user.pincode}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {role.admin && <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Admin</Badge>}
                                {role.suspended && <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Suspended</Badge>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!role.admin && !role.suspended && user.uid && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleRoleUpdate(user.uid!, { admin: true, suspended: false }, 'Made admin')}
                                    disabled={updatingUserId === user.uid}
                                    className="gap-1"
                                  >
                                    <Shield className="h-4 w-4" /> Make Admin
                                  </Button>
                                )}
                                {role.admin && user.uid && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRoleUpdate(user.uid!, { admin: false }, 'Removed admin access')}
                                    disabled={updatingUserId === user.uid}
                                    className="gap-1"
                                  >
                                    <ShieldOff className="h-4 w-4" /> Remove Admin
                                  </Button>
                                )}
                                {!role.suspended && user.uid && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRoleUpdate(user.uid!, { suspended: true, admin: false }, 'User suspended')}
                                    disabled={updatingUserId === user.uid}
                                    className="gap-1"
                                  >
                                    <Ban className="h-4 w-4" /> Suspend
                                  </Button>
                                )}
                                {role.suspended && user.uid && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleRoleUpdate(user.uid!, { suspended: false }, 'User unsuspended')}
                                    disabled={updatingUserId === user.uid}
                                    className="gap-1"
                                  >
                                    <RotateCcw className="h-4 w-4" /> Unsuspend
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
