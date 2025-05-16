import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RichTextEditor from "@/components/RichTextEditor";

// Definiranje sheme za validaciju
const formSchema = z.object({
  title: z.string().min(1, { message: "Naslov je obavezan" }),
  content: z.string().min(1, { message: "Sadržaj je obavezan" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ShippingReturnsPageFormProps {
  initialData: {
    id?: number;
    title: string;
    content: string;
    type?: string;
  };
}

export default function ShippingReturnsPageForm({ initialData }: ShippingReturnsPageFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("editor");
  
  // Postavljanje forme s početnim vrijednostima
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title || "Dostava i povrat",
      content: initialData.content || "",
    },
  });

  // Mutacija za spremanje promjena
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Ako stranica već postoji, ažuriramo je, inače kreiramo novu
      if (initialData.id) {
        const res = await apiRequest("PATCH", `/api/pages/${initialData.id}`, values);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/pages", {
          ...values,
          type: "shipping-returns"
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Uspješno spremljeno",
        description: "Stranica Dostava i povrat je uspješno ažurirana.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pages/shipping-returns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Greška",
        description: `Došlo je do greške: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Funkcija za slanje forme
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="editor">Uredi sadržaj</TabsTrigger>
            <TabsTrigger value="preview">Pregled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naslov stranice</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Unesite naslov stranice"
                          {...field}
                        />
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
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          editorId="shipping-returns-editor"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="ml-auto"
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
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="p-4 border rounded-md">
              <h1 className="text-2xl font-bold mb-4">{form.watch("title")}</h1>
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: form.watch("content") }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}