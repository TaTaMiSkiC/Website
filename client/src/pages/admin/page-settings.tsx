import React from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import AboutPageForm from "@/components/admin/AboutPageForm";
import ContactPageForm from "@/components/admin/ContactPageForm";
import BlogPageForm from "@/components/admin/BlogPageForm";
import HeroSettingsForm from "@/components/admin/HeroSettingsForm";

export default function PageSettingsPage() {
  // Dohvati podatke za sve stranice
  const { data: aboutPage, isLoading: aboutLoading } = useQuery({
    queryKey: ["/api/pages/about"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/pages/about");
        if (!response.ok) {
          if (response.status === 404) {
            return { id: null, type: "about", title: "O nama", content: "" };
          }
          throw new Error("Neuspješno dohvaćanje sadržaja stranice O nama");
        }
        return await response.json();
      } catch (error) {
        console.error("Greška pri dohvaćanju stranice:", error);
        return { id: null, type: "about", title: "O nama", content: "" };
      }
    }
  });

  const { data: contactPage, isLoading: contactLoading } = useQuery({
    queryKey: ["/api/pages/contact"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/pages/contact");
        if (!response.ok) {
          if (response.status === 404) {
            return { id: null, type: "contact", title: "Kontakt", content: "" };
          }
          throw new Error("Neuspješno dohvaćanje sadržaja stranice Kontakt");
        }
        return await response.json();
      } catch (error) {
        console.error("Greška pri dohvaćanju stranice:", error);
        return { id: null, type: "contact", title: "Kontakt", content: "" };
      }
    }
  });

  const { data: blogPage, isLoading: blogLoading } = useQuery({
    queryKey: ["/api/pages/blog"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/pages/blog");
        if (!response.ok) {
          if (response.status === 404) {
            return { id: null, type: "blog", title: "Blog", content: "" };
          }
          throw new Error("Neuspješno dohvaćanje sadržaja stranice Blog");
        }
        return await response.json();
      } catch (error) {
        console.error("Greška pri dohvaćanju stranice:", error);
        return { id: null, type: "blog", title: "Blog", content: "" };
      }
    }
  });
  
  // Fetch hero settings
  const { data: heroSettings, isLoading: heroLoading } = useQuery({
    queryKey: ["/api/settings/hero"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/settings/hero");
        if (!response.ok) {
          throw new Error("Failed to fetch hero settings");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching hero settings:", error);
        return null;
      }
    }
  });

  const isLoading = aboutLoading || contactLoading || blogLoading || heroLoading;

  return (
    <>
      <Helmet>
        <title>Postavke stranica | Admin Panel</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Postavke stranica</h1>
          <p className="text-muted-foreground mb-6">
            Uređivanje sadržaja stranica koje posjetitelji mogu vidjeti.
          </p>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="about">O nama</TabsTrigger>
              <TabsTrigger value="contact">Kontakt</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="hero">Heldenbereich</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Stranica O nama</h2>
                  {!isLoading && aboutPage && (
                    <AboutPageForm 
                      initialData={aboutPage}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Stranica Kontakt</h2>
                  {!isLoading && contactPage && (
                    <ContactPageForm 
                      initialData={contactPage}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="blog">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Stranica Blog</h2>
                  {!isLoading && blogPage && (
                    <BlogPageForm 
                      initialData={blogPage}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hero">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Heldenbereich Einstellungen</h2>
                  {!isLoading && (
                    <HeroSettingsForm 
                      initialData={heroSettings}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
}