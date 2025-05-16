import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriberSchema } from "@shared/schema";
import { z } from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const translations = {
  title: {
    de: "Abonnieren Sie unseren Newsletter",
    en: "Subscribe to our Newsletter",
    hr: "Pretplatite se na naš bilten",
    it: "Iscriviti alla nostra Newsletter",
    sl: "Naročite se na naš bilten"
  },
  subtitle: {
    de: "Erhalten Sie exklusive Angebote und 10% Rabatt auf Ihre erste Bestellung",
    en: "Get exclusive offers and 10% off your first order",
    hr: "Dobijte ekskluzivne ponude i 10% popusta na prvu narudžbu",
    it: "Ricevi offerte esclusive e il 10% di sconto sul tuo primo ordine",
    sl: "Pridobite ekskluzivne ponudbe in 10% popusta na prvo naročilo"
  },
  email: {
    de: "Ihre E-Mail Adresse",
    en: "Your email address",
    hr: "Vaša email adresa",
    it: "Il tuo indirizzo email",
    sl: "Vaš e-poštni naslov"
  },
  subscribe: {
    de: "Abonnieren",
    en: "Subscribe",
    hr: "Pretplatite se",
    it: "Iscriviti",
    sl: "Naroči se"
  },
  success: {
    de: "Vielen Dank für Ihre Anmeldung! Ihr Rabattcode wurde an Ihre E-Mail gesendet.",
    en: "Thank you for subscribing! Your discount code has been sent to your email.",
    hr: "Hvala vam na pretplati! Vaš kod za popust poslan je na vašu e-poštu.",
    it: "Grazie per l'iscrizione! Il tuo codice sconto è stato inviato alla tua email.",
    sl: "Hvala za naročilo! Vaša koda za popust je bila poslana na vaš e-poštni naslov."
  },
  discountCodeMessage: {
    de: "Ihr 10% Rabattcode ist:",
    en: "Your 10% discount code is:",
    hr: "Vaš 10% kod za popust je:",
    it: "Il tuo codice sconto del 10% è:",
    sl: "Vaša 10% koda za popust je:"
  },
  copyCode: {
    de: "Code kopieren",
    en: "Copy code",
    hr: "Kopiraj kod",
    it: "Copia codice",
    sl: "Kopiraj kodo"
  },
  codeCopied: {
    de: "Code kopiert!",
    en: "Code copied!",
    hr: "Kod kopiran!",
    it: "Codice copiato!",
    sl: "Koda kopirana!"
  }
};

// Extended schema for form validation
const formSchema = subscriberSchema.extend({
  email: z.string().email({
    message: "Gültige E-Mail-Adresse erforderlich"
  }),
});

export function Newsletter() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      language: language
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await apiRequest("POST", "/api/subscribe", {
        ...values,
        language: language
      });
      
      const data = await result.json();
      
      if (data.discountCode) {
        setDiscountCode(data.discountCode);
      }
      
      toast({
        title: translations.success[language],
        variant: "default",
      });
      
      form.reset();
    } catch (error) {
      let errorMessage = "Ein Fehler ist aufgetreten. Bitte versuche es erneut.";
      
      if (error instanceof Response) {
        const data = await error.json();
        errorMessage = data.message || errorMessage;
      }
      
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyDiscountCode = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode)
        .then(() => {
          toast({
            title: translations.codeCopied[language],
            variant: "default",
          });
        })
        .catch((err) => {
          console.error("Failed to copy code:", err);
        });
    }
  };

  return (
    <div className="w-full bg-primary/5 py-12 px-4 sm:px-6 my-12 rounded-lg">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary mb-2">
          {translations.title[language]}
        </h2>
        <p className="text-lg mb-8 text-gray-600">
          {translations.subtitle[language]}
        </p>

        {discountCode ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="font-medium">{translations.discountCodeMessage[language]}</p>
            <div className="relative bg-white px-6 py-3 rounded-md border-2 border-primary/30 text-xl font-bold text-primary">
              {discountCode}
            </div>
            <Button 
              onClick={copyDiscountCode} 
              variant="outline" 
              className="mt-2"
            >
              {translations.copyCode[language]}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <div className="flex-grow">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder={translations.email[language]} 
                          type="email" 
                          {...field} 
                          className="w-full h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white h-11" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translations.subscribe[language]}
                  </span>
                ) : translations.subscribe[language]}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}