import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutPage() {
  // Dohvati sadržaj "O nama" stranice iz baze
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ["/api/pages/about"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/pages/about");
        
        if (!response.ok) {
          if (response.status === 404) {
            return { title: "O nama", content: "Sadržaj stranice još nije unesen." };
          }
          throw new Error("Neuspješno dohvaćanje sadržaja stranice");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Greška pri dohvaćanju stranice:", error);
        return { title: "O nama", content: "Došlo je do greške pri dohvaćanju sadržaja." };
      }
    }
  });

  return (
    <>
      <Helmet>
        <title>{pageData?.title || "O nama"} | Kerzenwelt by Dani</title>
        <meta 
          name="description" 
          content="Upoznajte Kerzenwelt by Dani - trgovinu ručno izrađenih svijeća. Saznajte više o našoj strasti za kvalitetom i prirodnim materijalima."
        />
      </Helmet>
      
      <Layout>
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            {isLoading ? <Skeleton className="h-10 w-[250px] mx-auto" /> : pageData?.title || "O nama"}
          </h1>
          
          <Card className="mx-auto max-w-4xl">
            <CardContent className="pt-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-4/5 mb-4" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                </>
              ) : (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: pageData?.content 
                      ? pageData.content.replace(/\n/g, '<br />') 
                      : "Sadržaj stranice još nije unesen."
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}