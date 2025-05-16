import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { useLanguage } from "@/hooks/use-language";
import { Helmet } from 'react-helmet';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertScentSchema, type InsertScent, type Scent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminScents() {
  const [open, setOpen] = useState(false);
  const [editScent, setEditScent] = useState<Scent | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: scents, isLoading } = useQuery<Scent[]>({
    queryKey: ["/api/scents"],
    queryFn: async () => {
      const response = await fetch("/api/scents");
      if (!response.ok) {
        throw new Error("Failed to fetch scents");
      }
      return response.json();
    },
  });

  const form = useForm<InsertScent>({
    resolver: zodResolver(insertScentSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertScent) => {
      const response = await apiRequest("POST", "/api/scents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scents"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Uspjeh",
        description: "Miris je uspješno dodan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Greška",
        description: `Neuspjelo dodavanje mirisa: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertScent & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/scents/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scents"] });
      setOpen(false);
      setEditScent(null);
      form.reset();
      toast({
        title: "Uspjeh",
        description: "Miris je uspješno ažuriran.",
      });
    },
    onError: (error) => {
      toast({
        title: "Greška",
        description: `Neuspjelo ažuriranje mirisa: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/scents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scents"] });
      toast({
        title: "Uspjeh",
        description: "Miris je uspješno obrisan.",
      });
    },
    onError: (error) => {
      toast({
        title: "Greška",
        description: `Neuspjelo brisanje mirisa: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertScent) => {
    if (editScent) {
      updateMutation.mutate({ ...data, id: editScent.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (scent: Scent) => {
    setEditScent(scent);
    form.reset({
      name: scent.name,
      description: scent.description || "",
      active: scent.active,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditScent(null);
    form.reset();
  };

  return (
    <AdminLayout title={t("admin.scents.title")}>
      <Helmet>
        <title>{t("admin.scents.pageTitle")} | {t("admin.panelTitle")} | Kerzenwelt by Dani</title>
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("admin.scents.title")}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>{t("admin.scents.addScent")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editScent ? t("admin.scents.editScent") : t("admin.scents.addNewScent")}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.scents.nameLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("admin.scents.namePlaceholder")}
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.scents.descriptionLabel")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("admin.scents.descriptionPlaceholder")}
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>{t("admin.scents.active")}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                    >
                      {t("admin.scents.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createMutation.isPending || updateMutation.isPending
                      }
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editScent ? t("admin.scents.saveChanges") : t("admin.scents.save")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.scents.id")}</TableHead>
                  <TableHead>{t("admin.scents.name")}</TableHead>
                  <TableHead>{t("admin.scents.description")}</TableHead>
                  <TableHead>{t("admin.scents.status")}</TableHead>
                  <TableHead>{t("admin.scents.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scents && scents.length > 0 ? (
                  scents.map((scent) => (
                    <TableRow key={scent.id}>
                      <TableCell>{scent.id}</TableCell>
                      <TableCell className="font-medium">{scent.name}</TableCell>
                      <TableCell>
                        {scent.description
                          ? scent.description.length > 80
                            ? `${scent.description.slice(0, 80)}...`
                            : scent.description
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            scent.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {scent.active ? t("admin.scents.active") : t("admin.scents.inactive")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(scent)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("admin.scents.deleteScent")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("admin.scents.deleteConfirmation").replace("{name}", scent.name)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.scents.cancelDelete")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(scent.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {t("admin.scents.confirmDelete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      {t("admin.scents.noScents")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}