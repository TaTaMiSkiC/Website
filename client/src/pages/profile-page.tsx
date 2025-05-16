import { useState } from "react";
import { Helmet } from 'react-helmet';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Order } from "@shared/schema";
import { Link } from "wouter";

// Validacijska shema za promjenu lozinke
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Trenutna lozinka je obavezna"),
  newPassword: z.string().min(6, "Nova lozinka mora imati najmanje 6 znakova"),
  confirmPassword: z.string().min(6, "Potrebno je potvrditi lozinku"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Lozinke se ne podudaraju",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Validacijska shema za profil
const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Unesite ispravnu email adresu"),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [tab, setTab] = useState("profil");

  // Dohvaćanje narudžbi korisnika
  const { data: userOrders, isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Forma za ažuriranje profila
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      address: user?.address || "",
      city: user?.city || "",
      postalCode: user?.postalCode || "",
      country: user?.country || "",
      phone: user?.phone || "",
    },
  });

  // Forma za promjenu lozinke
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mutacija za ažuriranje profila
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("Korisnik nije prijavljen");
      const response = await apiRequest("PUT", `/api/users/${user.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Uspjeh",
        description: "Vaš profil je uspješno ažuriran.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Greška",
        description: `Došlo je do greške prilikom ažuriranja profila: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutacija za promjenu lozinke
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      if (!user) throw new Error("Korisnik nije prijavljen");
      const response = await apiRequest("PUT", `/api/users/${user.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Uspjeh",
        description: "Vaša lozinka je uspješno promijenjena.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Greška",
        description: `Došlo je do greške prilikom promjene lozinke: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handler za slanje forme profila
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handler za slanje forme lozinke
  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Pristup nije dozvoljen</h1>
            <p className="text-muted-foreground mb-6">Morate biti prijavljeni da biste pristupili ovoj stranici.</p>
            <Link href="/auth">
              <Button>Prijava</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{t('profile.myProfile')} | Kerzenwelt by Dani</title>
        <meta name="description" content={t('profile.meta.description')} />
      </Helmet>

      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">{t('profile.myProfile')}</h1>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="profil">{t('profile.profile')}</TabsTrigger>
            <TabsTrigger value="narudzbe">{t('profile.orders')}</TabsTrigger>
            <TabsTrigger value="lozinka">{t('profile.password')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.personalInfo')}</CardTitle>
                <CardDescription>
                  {t('profile.updateInfo')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.firstName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('profile.firstNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.lastName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('profile.lastNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.email')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.phone')}</FormLabel>
                            <FormControl>
                              <Input placeholder="+385..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>{t('profile.address')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('profile.addressPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.city')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('profile.cityPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.postalCode')}</FormLabel>
                            <FormControl>
                              <Input placeholder="10000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.country')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('profile.countryPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('profile.saveChanges')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="narudzbe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.myOrders')}</CardTitle>
                <CardDescription>
                  {t('profile.ordersDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isOrdersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : userOrders && userOrders.length > 0 ? (
                  <div className="divide-y">
                    {userOrders.map((order) => (
                      <div key={order.id} className="py-4">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <p className="font-medium">{t('profile.order')} #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                'bg-orange-100 text-orange-800'}`}>
                              {order.status === 'pending' ? t('profile.orderStatus.pending') : 
                               order.status === 'processing' ? t('profile.orderStatus.processing') : 
                               order.status === 'completed' ? t('profile.orderStatus.completed') : 
                               order.status}
                            </div>
                            <p className="mt-1 font-medium">{Number(order.total).toFixed(2)} €</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">{t('profile.orderDetails')}</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('profile.noOrders')}</p>
                    <Link href="/products">
                      <Button variant="outline" className="mt-4">{t('profile.browseProducts')}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lozinka" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.passwordChange')}</CardTitle>
                <CardDescription>
                  {t('profile.passwordChangeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.currentPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.newPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={changePasswordMutation.isPending}>
                      {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('profile.changePassword')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}