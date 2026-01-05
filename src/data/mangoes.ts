import { Mango } from '@/contexts/CartContext';
import mangoRoyal from '@/assets/mango-royal.jpg';
import mangoClassic from '@/assets/mango-classic.jpg';
import mangoGiftbox from '@/assets/mango-giftbox.jpg';
import mangoFamily from '@/assets/mango-family.jpg';
import mangoAamras from '@/assets/mango-aamras.jpg';

export const mangoes: Mango[] = [
  {
    id: 'royal-hapus',
    name: 'Royal Hapus',
    nameMarathi: 'रॉयल हापूस',
    description: 'Our premium grade Alphonso mangoes. Extra large size with intense sweetness and rich golden color. Perfect for gifting.',
    descriptionMarathi: 'आमचे प्रीमियम दर्जाचे हापूस आंबे. अतिशय मोठा आकार, तीव्र गोडवा आणि समृद्ध सोनेरी रंग. भेटवस्तूसाठी उत्तम.',
    price: 1800,
    weight: '12 pieces (3-3.5 kg)',
    image: mangoRoyal
  },
  {
    id: 'classic-hapus',
    name: 'Classic Hapus',
    nameMarathi: 'क्लासिक हापूस',
    description: 'Traditional Devgad Alphonso with perfect balance of sweetness and tanginess. The authentic family favorite.',
    descriptionMarathi: 'गोडवा आणि आंबटपणाचा परिपूर्ण समतोल असलेला पारंपारिक देवगड हापूस. खरा कुटुंबाचा आवडता.',
    price: 1500,
    weight: '12 pieces (2.5-3 kg)',
    image: mangoClassic
  },
  {
    id: 'premium-box',
    name: 'Premium Gift Box',
    nameMarathi: 'प्रीमियम गिफ्ट बॉक्स',
    description: 'Elegantly packed selection of our finest mangoes in a beautiful gift box. Ideal for corporate gifting and special occasions.',
    descriptionMarathi: 'सुंदर गिफ्ट बॉक्समध्ये आमच्या उत्कृष्ट आंब्यांचे सुंदर पॅकेज. कॉर्पोरेट भेटवस्तू आणि विशेष प्रसंगांसाठी आदर्श.',
    price: 2500,
    weight: '12 pieces (4 kg)',
    image: mangoGiftbox
  },
  {
    id: 'family-pack',
    name: 'Family Pack',
    nameMarathi: 'फॅमिली पॅक',
    description: 'Value pack perfect for families. Medium-sized mangoes with the same authentic Devgad taste at a great price.',
    descriptionMarathi: 'कुटुंबांसाठी उत्तम व्हॅल्यू पॅक. उत्तम किमतीत समान खरी देवगड चव असलेले मध्यम आकाराचे आंबे.',
    price: 1200,
    weight: '12 pieces (2-2.5 kg)',
    image: mangoFamily
  },
  {
    id: 'aam-ras-special',
    name: 'Aam Ras Special',
    nameMarathi: 'आमरस स्पेशल',
    description: 'Perfectly ripe mangoes ideal for making the most delicious Aamras. Soft, sweet, and extremely flavorful.',
    descriptionMarathi: 'सर्वात स्वादिष्ट आमरस बनवण्यासाठी आदर्श असे परिपूर्ण पिकलेले आंबे. मऊ, गोड आणि अत्यंत चवदार.',
    price: 1100,
    weight: '12 pieces (2-2.5 kg)',
    image: mangoAamras
  }
];
