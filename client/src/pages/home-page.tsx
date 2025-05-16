import { Helmet } from 'react-helmet';
import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import AboutUs from "@/components/home/AboutUs";
import CollectionBanner from "@/components/home/CollectionBanner";
import Testimonials from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import CategoryCard from "@/components/products/CategoryCard";
import { useLanguage } from '@/hooks/use-language';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Meta podaci prilagođeni trenutnom jeziku
  const metaTitles = {
    de: "Kerzenwelt by Dani | Handgemachte Kerzen",
    hr: "Kerzenwelt by Dani | Ručno izrađene svijeće",
    en: "Kerzenwelt by Dani | Handmade Candles",
    it: "Kerzenwelt by Dani | Candele artigianali",
    sl: "Kerzenwelt by Dani | Ročno izdelane sveče"
  };

  const metaDescriptions = {
    de: "Entdecken Sie unsere Kollektion handgefertigter Kerzen aus natürlichen Inhaltsstoffen. Premium Duft- und Dekorationskerzen für jedes Zuhause.",
    hr: "Otkrijte našu kolekciju ručno izrađenih svijeća od prirodnih sastojaka. Premium mirisne i dekorativne svijeće za svaki dom.",
    en: "Discover our collection of handmade candles made from natural ingredients. Premium scented and decorative candles for every home.",
    it: "Scopri la nostra collezione di candele artigianali realizzate con ingredienti naturali. Candele profumate e decorative premium per ogni casa.",
    sl: "Odkrijte našo kolekcijo ročno izdelanih sveč iz naravnih sestavin. Premium dišeče in dekorativne sveče za vsak dom."
  };

  return (
    <Layout>
      <Helmet>
        <title>{metaTitles[language]}</title>
        <meta name="description" content={metaDescriptions[language]} />
        <meta property="og:title" content={metaTitles[language]} />
        <meta property="og:description" content={metaDescriptions[language]} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Hero />
      
      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading text-3xl md:text-4xl font-bold text-foreground">{t('home.categories')}</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              {t('home.categoriesSubtitle')}
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-muted h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories?.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      <FeaturedProducts />
      <AboutUs />
      <CollectionBanner />
      <Testimonials />
      <Newsletter />
    </Layout>
  );
}
