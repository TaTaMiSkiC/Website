import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

// Validacijska shema za obrazac
const pageFormSchema = z.object({
  title: z.string().min(2, {
    message: "Naslov mora imati najmanje 2 znaka.",
  }),
  content: z.string().min(10, {
    message: "Sadržaj mora imati najmanje 10 znakova.",
  }),
});

type PageFormValues = z.infer<typeof pageFormSchema>;

// Props za PageSettingsForm komponentu
interface PageSettingsFormProps {
  pageType: string;
  title: string;
  description: string;
}

export default function PageSettingsForm({ pageType, title, description }: PageSettingsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dohvati postojeće postavke stranice
  const { data: pageData, isLoading } = useQuery({
    queryKey: [`/api/pages/${pageType}`],
    queryFn: async () => {
      try {
        // Pokušaj dohvatiti stranicu, a ako ne postoji vrati undefined
        const response = await fetch(`/api/pages/${pageType}`);
        if (response.status === 404) {
          return undefined;
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching page:", error);
        return undefined;
      }
    },
  });

  // Mutacija za spremanje postavki stranice
  const mutation = useMutation({
    mutationFn: async (data: PageFormValues) => {
      const response = await apiRequest("POST", `/api/pages/${pageType}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${pageType}`] });
      toast({
        title: "Postavke spremljene",
        description: "Postavke stranice su uspješno spremljene.",
      });
    },
    onError: (error) => {
      toast({
        title: "Greška pri spremanju",
        description: error.message || "Došlo je do greške pri spremanju postavki.",
        variant: "destructive",
      });
    },
  });

  // Inicijaliziraj form s react-hook-form
  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: pageData?.title || "",
      content: pageData?.content || "",
    },
    values: pageData ? {
      title: pageData.title,
      content: pageData.content,
    } : undefined,
  });

  // Funkcija za spremanje podataka
  const onSubmit = (data: PageFormValues) => {
    mutation.mutate(data);
  };

  // Ako se podaci još učitavaju, prikaži loading stanje
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-5">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-gray-500">{description}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naslov</FormLabel>
                  <FormControl>
                    <Input placeholder="Unesite naslov stranice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sadržaj</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Unesite sadržaj stranice"
                      className="min-h-[200px] resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Spremanje..." : "Spremi postavke"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}