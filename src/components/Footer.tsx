import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🥭</span>
              <span className="font-display text-2xl font-bold">
                Devgad<span className="text-primary">Hapus</span>
              </span>
            </div>
            <p className="text-background/70 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">{t('footer.contact')}</h4>
            <div className="space-y-3 text-sm">
              <a href="tel:+919876543210" className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </a>
              <a href="mailto:info@devgadhapus.com" className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                info@devgadhapus.com
              </a>
              <div className="flex items-center gap-3 text-background/70">
                <Clock className="h-4 w-4" />
                {t('footer.hours')}
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Delivery Area</h4>
            <p className="text-background/70 text-sm leading-relaxed">
              We currently deliver only within Mumbai. 
              Free delivery on all orders above ₹1500.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium">
              <span>📍</span>
              Mumbai Only
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          © 2024 DevgadHapus. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
