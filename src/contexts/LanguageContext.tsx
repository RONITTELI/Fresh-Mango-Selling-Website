import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.mangoes': 'Our Mangoes',
    'nav.about': 'About Us',
    'nav.cart': 'Cart',
    'nav.admin': 'Admin',
    
    // Hero
    'hero.title': 'Taste the Royalty of Devgad',
    'hero.subtitle': 'Premium Alphonso Mangoes',
    'hero.description': 'Experience the authentic taste of Devgad Hapus - the King of Mangoes. Hand-picked from the finest orchards of Konkan, delivered fresh to your doorstep in Mumbai.',
    'hero.cta': 'Shop Now',
    'hero.badge': 'Mumbai Delivery Only',
    
    // Products
    'products.title': 'Our Premium Collection',
    'products.subtitle': 'Each mango is carefully selected for its perfect sweetness, rich aroma, and golden color',
    'products.addToCart': 'Add to Cart',
    'products.added': 'Added!',
    'products.perDozen': 'per dozen',
    
    // About
    'about.title': 'Why Choose Our Mangoes?',
    'about.authentic': 'Authentic Devgad Origin',
    'about.authenticDesc': 'Directly sourced from certified Devgad orchards with GI tag authentication',
    'about.handpicked': 'Hand-Picked Quality',
    'about.handpickedDesc': 'Each mango is carefully selected by experienced farmers for perfect ripeness',
    'about.fresh': 'Farm Fresh Delivery',
    'about.freshDesc': 'From our orchards to your doorstep within 24-48 hours',
    'about.natural': '100% Natural Ripening',
    'about.naturalDesc': 'Carbide-free, naturally ripened for authentic taste and safety',
    
    // Cart
    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'cart.remove': 'Remove',
    'cart.quantity': 'Qty',
    
    // Checkout
    'checkout.title': 'Complete Your Order',
    'checkout.name': 'Full Name',
    'checkout.phone': 'Phone Number',
    'checkout.address': 'Delivery Address (Mumbai Only)',
    'checkout.pincode': 'Pincode',
    'checkout.notes': 'Order Notes (Optional)',
    'checkout.place': 'Place Order',
    'checkout.success': 'Order Placed Successfully!',
    'checkout.successMsg': 'We will contact you shortly to confirm your order.',
    'checkout.mumbaiOnly': 'Delivery available only in Mumbai',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.orders': 'Orders',
    'admin.pending': 'Pending',
    'admin.confirmed': 'Confirmed',
    'admin.accept': 'Accept Order',
    'admin.noOrders': 'No orders yet',
    'admin.orderDetails': 'Order Details',
    'admin.customer': 'Customer',
    'admin.items': 'Items',
    
    // Footer
    'footer.tagline': 'Premium Devgad Hapus Mangoes',
    'footer.contact': 'Contact Us',
    'footer.hours': 'Mon-Sat: 9AM - 7PM',
    'footer.rights': 'All rights reserved',
  },
  mr: {
    // Header
    'nav.home': 'मुख्यपृष्ठ',
    'nav.mangoes': 'आमचे आंबे',
    'nav.about': 'आमच्याबद्दल',
    'nav.cart': 'कार्ट',
    'nav.admin': 'प्रशासक',
    
    // Hero
    'hero.title': 'देवगड च्या राजेशाही चव चाखा',
    'hero.subtitle': 'प्रीमियम हापूस आंबे',
    'hero.description': 'देवगड हापूसची खरी चव अनुभवा - आंब्यांचा राजा. कोकणातील उत्कृष्ट बागांमधून हाताने निवडलेले, मुंबईत तुमच्या दारात ताजे पोहोचवलेले.',
    'hero.cta': 'आता खरेदी करा',
    'hero.badge': 'फक्त मुंबई डिलिव्हरी',
    
    // Products
    'products.title': 'आमचा प्रीमियम संग्रह',
    'products.subtitle': 'प्रत्येक आंबा त्याच्या परिपूर्ण गोडवा, समृद्ध सुगंध आणि सोनेरी रंगासाठी काळजीपूर्वक निवडला जातो',
    'products.addToCart': 'कार्टमध्ये जोडा',
    'products.added': 'जोडले!',
    'products.perDozen': 'प्रति डझन',
    
    // About
    'about.title': 'आमचे आंबे का निवडावे?',
    'about.authentic': 'खरे देवगड मूळ',
    'about.authenticDesc': 'GI टॅग प्रमाणीकरणासह प्रमाणित देवगड बागांमधून थेट स्रोत',
    'about.handpicked': 'हाताने निवडलेली गुणवत्ता',
    'about.handpickedDesc': 'प्रत्येक आंबा अनुभवी शेतकऱ्यांनी परिपूर्ण पिकण्यासाठी काळजीपूर्वक निवडला',
    'about.fresh': 'शेतातून ताजी डिलिव्हरी',
    'about.freshDesc': 'आमच्या बागांमधून तुमच्या दारात २४-४८ तासांत',
    'about.natural': '१००% नैसर्गिक पिकवणे',
    'about.naturalDesc': 'कार्बाइड-मुक्त, खऱ्या चवीसाठी आणि सुरक्षिततेसाठी नैसर्गिकरित्या पिकवलेले',
    
    // Cart
    'cart.title': 'तुमची कार्ट',
    'cart.empty': 'तुमची कार्ट रिकामी आहे',
    'cart.total': 'एकूण',
    'cart.checkout': 'चेकआउट करा',
    'cart.remove': 'काढा',
    'cart.quantity': 'संख्या',
    
    // Checkout
    'checkout.title': 'तुमची ऑर्डर पूर्ण करा',
    'checkout.name': 'पूर्ण नाव',
    'checkout.phone': 'फोन नंबर',
    'checkout.address': 'डिलिव्हरी पत्ता (फक्त मुंबई)',
    'checkout.pincode': 'पिनकोड',
    'checkout.notes': 'ऑर्डर नोट्स (पर्यायी)',
    'checkout.place': 'ऑर्डर द्या',
    'checkout.success': 'ऑर्डर यशस्वीरित्या दिली!',
    'checkout.successMsg': 'तुमची ऑर्डर पुष्टी करण्यासाठी आम्ही लवकरच तुमच्याशी संपर्क साधू.',
    'checkout.mumbaiOnly': 'डिलिव्हरी फक्त मुंबईत उपलब्ध',
    
    // Admin
    'admin.title': 'प्रशासक पॅनेल',
    'admin.orders': 'ऑर्डर्स',
    'admin.pending': 'प्रलंबित',
    'admin.confirmed': 'पुष्टी केलेले',
    'admin.accept': 'ऑर्डर स्वीकारा',
    'admin.noOrders': 'अजून ऑर्डर नाहीत',
    'admin.orderDetails': 'ऑर्डर तपशील',
    'admin.customer': 'ग्राहक',
    'admin.items': 'वस्तू',
    
    // Footer
    'footer.tagline': 'प्रीमियम देवगड हापूस आंबे',
    'footer.contact': 'आमच्याशी संपर्क साधा',
    'footer.hours': 'सोम-शनि: सकाळी ९ - संध्याकाळी ७',
    'footer.rights': 'सर्व हक्क राखीव',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
