import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth, signOut } from '@/lib/firebase';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success(language === 'mr' ? 'यशस्वीरित्या लॉगआउट!' : 'Logged out successfully!');
      navigate('/');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Logout error:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { path: '/', label: t('nav.home'), onClick: () => { setMobileMenuOpen(false); navigate('/'); } },
    { path: '/#products', label: t('nav.mangoes'), onClick: () => scrollToSection('products') },
    { path: '/#about', label: t('nav.about'), onClick: () => scrollToSection('about') },
    ...(user ? [{ path: '/orders', label: language === 'mr' ? 'माझे ऑर्डर' : 'My Orders', onClick: () => { setMobileMenuOpen(false); navigate('/orders'); } }] : []),
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) return false;
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🥭</span>
            <span className="font-display text-xl md:text-2xl font-bold text-foreground">
              Devgad<span className="text-primary">Hapus</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={link.onClick}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('nav.admin')}
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
              className="px-3 py-1.5 text-sm font-medium rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {language === 'en' ? 'मराठी' : 'EN'}
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                  {user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {language === 'mr' ? 'लॉगिन' : 'Login'}
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-slide-up">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={link.onClick}
                className="block w-full text-left py-3 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-3 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.admin')}
              </Link>
            )}
            
            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="block w-full text-left py-3 text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {language === 'mr' ? 'लॉगआउट' : 'Logout'}
              </button>
            ) : (
              <Link
                to="/auth"
                className="block py-3 text-base font-medium text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === 'mr' ? 'लॉगिन / नोंदणी' : 'Login / Register'}
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
