import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Hand, Truck, Leaf } from 'lucide-react';

const AboutSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MapPin,
      title: t('about.authentic'),
      description: t('about.authenticDesc'),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: Hand,
      title: t('about.handpicked'),
      description: t('about.handpickedDesc'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Truck,
      title: t('about.fresh'),
      description: t('about.freshDesc'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Leaf,
      title: t('about.natural'),
      description: t('about.naturalDesc'),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t('about.title')}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${feature.bgColor} mb-4`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Story Section */}
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto text-center">
          <div className="bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border/50">
            <span className="text-6xl mb-6 block">🥭</span>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              The Devgad Legacy
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              For generations, the Alphonso mango from Devgad has been celebrated as the "King of Mangoes." 
              Our family has been cultivating these golden treasures in the pristine orchards of Konkan, 
              where the perfect combination of coastal breeze, laterite soil, and loving care creates 
              mangoes that are simply unmatched in flavor, aroma, and sweetness.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
