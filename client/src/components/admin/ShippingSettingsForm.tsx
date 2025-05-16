import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings-api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Definiramo validacijsku shemu za form
const shippingFormSchema = z.object({
  freeShippingThreshold: z.string().min(1, "Obavezno polje"),
  standardShippingRate: z.string().min(1, "Obavezno polje"),
  expressShippingRate: z.string().min(1, "Obavezno polje"),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export default function ShippingSettingsForm() {
  const { toast } = useToast();
  
  // Koristimo useSettings hook umjesto direktnih upita
  const { 
    allSettings, 
    updateSetting 
  } = useSettings();

  // Postavke forme
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      freeShippingThreshold: "0",
      standardShippingRate: "0",
      expressShippingRate: "0",
    },
  });
  
  // Izvlačimo postavke iz allSettings upita
  useEffect(() => {
    if (allSettings.data && allSettings.data.length > 0) {
      // Transformiramo listu u objekt
      const settingsMap = allSettings.data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      // Izvlačimo specifične postavke za dostavu
      const freeThreshold = settingsMap.freeShippingThreshold || "0";
      const standardRate = settingsMap.standardShippingRate || "0";
      const expressRate = settingsMap.expressShippingRate || "0";
      
      console.log("Učitane postavke iz API-ja:", {
        freeShippingThreshold: freeThreshold,
        standardShippingRate: standardRate,
        expressShippingRate: expressRate
      });
      
      // Ažuriramo formu s dohvaćenim vrijednostima
      form.reset({
        freeShippingThreshold: freeThreshold,
        standardShippingRate: standardRate,
        expressShippingRate: expressRate
      });
    }
  }, [allSettings.data, form]);

  // Spremanje svih postavki
  const onSubmit = async (data: ShippingFormValues) => {
    try {
      // Postavka 1: Prag za besplatnu dostavu
      await updateSetting.mutateAsync({
        key: "freeShippingThreshold",
        value: data.freeShippingThreshold
      });
      
      // Postavka 2: Cijena standardne dostave
      await updateSetting.mutateAsync({
        key: "standardShippingRate",
        value: data.standardShippingRate
      });
      
      // Postavka 3: Cijena ekspresne dostave
      await updateSetting.mutateAsync({
        key: "expressShippingRate",
        value: data.expressShippingRate
      });
      
      // Osvježavamo podatke nakon spremanja
      allSettings.refetch();
      
      toast({
        title: "Uspjeh",
        description: "Postavke dostave su uspješno spremljene.",
      });
    } catch (error) {
      console.error("Greška pri spremanju postavki:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom spremanja postavki.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="freeShippingThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prag za besplatnu dostavu (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="standardShippingRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cijena standardne dostave (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expressShippingRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cijena ekspresne dostave (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={allSettings.isLoading || updateSetting.isPending}>
          {updateSetting.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Spremanje...
            </>
          ) : (
            "Spremi postavke"
          )}
        </Button>
      </form>
    </Form>
  );
}