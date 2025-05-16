import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Product } from "@shared/schema";
import ProductGrid from "../products/ProductGrid";
import { useLanguage } from "@/hooks/use-language";

export default function FeaturedProducts() {
  const { t, translateArray } = useLanguage();
  const { data: rawProducts, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });
  
  // Dodatno filtriranje neaktivnih proizvoda na klijentskoj strani
  const rawActiveProducts = rawProducts?.filter(product => product.active !== false) || [];
  
  // Automatski prevedeni proizvodi na trenutni jezik
  const activeProducts = translateArray(rawActiveProducts, "de");

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="heading text-3xl md:text-4xl font-bold text-foreground">{t('home.featured')}</h2>
            <p className="mt-3 text-muted-foreground">{t('home.featuredSubtitle')}</p>
          </div>
          <Link href="/products">
            <div className="hidden md:inline-flex items-center font-accent text-primary hover:text-opacity-80 transition cursor-pointer">
              {t('home.viewAllProducts')}
              <ArrowRight className="ml-2" size={16} />
            </div>
          </Link>
        </div>
        
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{t('home.errorLoading')}</p>
          </div>
        ) : (
          <ProductGrid 
            products={activeProducts} 
            isLoading={isLoading} 
          />
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/products">
            <div className="inline-flex items-center font-accent text-primary hover:text-opacity-80 transition cursor-pointer">
              {t('home.viewAllProducts')}
              <ArrowRight className="ml-2" size={16} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
