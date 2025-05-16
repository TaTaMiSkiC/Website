import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI komponente
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
import { Loader2 } from "lucide-react";

// Definicija sheme za validaciju
const formSchema = z.object({
  id: z.number().nullable(),
  type: z.string(),
  title: z.string().min(1, { message: "Naslov je obavezan" }),
  content: z.string().min(1, { message: "Sadržaj je obavezan" }),
});

// Tipovi
type FormValues = z.infer<typeof formSchema>;

interface ContactPageFormProps {
  initialData: {
    id: number | null;
    type: string;
    title: string;
    content: string;
  };
}

export default function ContactPageForm({ initialData }: ContactPageFormProps) {
  const { toast } = useToast();
  
  // Postavke forme
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData.id,
      type: initialData.type,
      title: initialData.title,
      content: initialData.content,
    },
  });

  // Mutacija za spremanje podataka
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Odredi odgovarajuću metodu i URL
      const method = values.id ? "PUT" : "POST";
      const url = "/api/pages";
      
      try {
        const response = await apiRequest(method, url, values);
        
        if (!response.ok) {
          throw new Error("Neuspješno spremanje podataka");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Greška pri spremanju:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Uspješno spremljeno",
        description: "Podaci stranice su uspješno ažurirani.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages/contact"] });
    },
    onError: (error) => {
      toast({
        title: "Greška",
        description: `Došlo je do greške prilikom spremanja: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Funkcija za spremanje forme
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naslov stranice</FormLabel>
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
              <FormLabel>Sadržaj stranice</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Unesite sadržaj stranice"
                  className="min-h-[300px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={mutation.isPending || !form.formState.isDirty}
          className="w-full md:w-auto"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Spremanje...
            </>
          ) : (
            "Spremi promjene"
          )}
        </Button>
      </form>
    </Form>
  );
}