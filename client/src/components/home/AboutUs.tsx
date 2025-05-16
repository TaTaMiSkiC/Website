import { Link } from "wouter";
import { Leaf, HeartHandshake, Recycle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function AboutUs() {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="/uploads/nasa-radionica-nova.jpg" 
              alt={t('home.aboutUs')} 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="heading text-3xl md:text-4xl font-bold text-foreground mb-6">{t('home.ourStory')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('home.storyDescription')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/20 p-3 rounded-full">
                  <Leaf className="text-primary" size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="heading font-semibold text-lg text-foreground">{t('home.naturalIngredients')}</h3>
                  <p className="text-muted-foreground text-sm">{t('home.naturalIngredientsDesc')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-primary/20 p-3 rounded-full">
                  <HeartHandshake className="text-primary" size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="heading font-semibold text-lg text-foreground">{t('home.handmade')}</h3>
                  <p className="text-muted-foreground text-sm">{t('home.handmadeDesc')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-accent p-3 rounded-full">
                  <Recycle className="text-primary" size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="heading font-semibold text-lg text-foreground">{t('home.sustainability')}</h3>
                  <p className="text-muted-foreground text-sm">{t('home.sustainabilityDesc')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-accent p-3 rounded-full">
                  <Home className="text-primary" size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="heading font-semibold text-lg text-foreground">{t('home.homeComfort')}</h3>
                  <p className="text-muted-foreground text-sm">{t('home.homeComfortDesc')}</p>
                </div>
              </div>
            </div>
            
            <Link href="/about">
              <Button size="lg">
                {t('home.learnMore')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
