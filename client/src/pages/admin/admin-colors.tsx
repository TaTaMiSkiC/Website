import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertColorSchema, type InsertColor, type Color } from "@shared/schema";
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
import { useLanguage } from "@/hooks/use-language";
import { Helmet } from "react-helmet";

export default function AdminColors() {
  const [open, setOpen] = useState(false);
  const [editColor, setEditColor] = useState<Color | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: colors, isLoading } = useQuery<Color[]>({
    queryKey: ["/api/colors"],
    queryFn: async () => {
      const response = await fetch("/api/colors");
      if (!response.ok) {
        throw new Error("Failed to fetch colors");
      }
      return response.json();
    },
  });

  const form = useForm<InsertColor>({
    resolver: zodResolver(insertColorSchema),
    defaultValues: {
      name: "",
      hexValue: "#FFFFFF",
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertColor) => {
      const response = await apiRequest("POST", "/api/colors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      setOpen(false);
      form.reset();
      toast({
        title: t("admin.common.success"),
        description: t("admin.colors.successCreate"),
      });
    },
    onError: (error) => {
      toast({
        title: t("admin.common.error"),
        description: t("admin.colors.createError") + `: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertColor & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/colors/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      setOpen(false);
      setEditColor(null);
      form.reset();
      toast({
        title: "Uspjeh",
        description: "Boja je uspješno ažurirana.",
      });
    },
    onError: (error) => {
      toast({
        title: t("admin.common.error"),
        description: t("admin.colors.updateError") + `: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/colors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      toast({
        title: t("admin.common.success"),
        description: t("admin.colors.successDelete"),
      });
    },
    onError: (error) => {
      toast({
        title: t("admin.common.error"),
        description: t("admin.colors.deleteError") + `: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertColor) => {
    if (editColor) {
      updateMutation.mutate({ ...data, id: editColor.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (color: Color) => {
    setEditColor(color);
    form.reset({
      name: color.name,
      hexValue: color.hexValue,
      active: color.active,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditColor(null);
    form.reset();
  };

  return (
    <AdminLayout title={t("admin.colors.title")}>
      <Helmet>
        <title>{t("admin.colors.pageTitle")} | {t("admin.panelTitle")} | Kerzenwelt by Dani</title>
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("admin.colors.title")}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>{t("admin.colors.addColor")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editColor ? t("admin.colors.editColor") : t("admin.colors.addNewColor")}
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
                        <FormLabel>{t("admin.colors.nameLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("admin.colors.namePlaceholder")}
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
                    name="hexValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admin.colors.codeLabel")}</FormLabel>
                        <div className="flex items-center gap-3">
                          <FormControl>
                            <Input
                              placeholder={t("admin.colors.codePlaceholder")}
                              autoComplete="off"
                              {...field}
                            />
                          </FormControl>
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                        </div>
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
                          <FormLabel>{t("admin.colors.active")}</FormLabel>
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
                      {t("admin.colors.cancel")}
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
                      {editColor ? t("admin.colors.saveChanges") : t("admin.colors.save")}
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
                  <TableHead>ID</TableHead>
                  <TableHead>{t("admin.colors.colorPreview")}</TableHead>
                  <TableHead>{t("admin.colors.nameLabel")}</TableHead>
                  <TableHead>{t("admin.colors.codeLabel")}</TableHead>
                  <TableHead>{t("admin.colors.active")}</TableHead>
                  <TableHead>{t("admin.colors.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors && colors.length > 0 ? (
                  colors.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>{color.id}</TableCell>
                      <TableCell>
                        <div 
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: color.hexValue }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{color.name}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {color.hexValue}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            color.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {color.active ? t("admin.colors.active") : t("admin.colors.inactive")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(color)}
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
                                  {t("admin.colors.deleteColor")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("admin.colors.deleteConfirmation").replace("{name}", color.name)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("admin.colors.cancelDelete")}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(color.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {t("admin.colors.confirmDelete")}
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
                    <TableCell colSpan={6} className="text-center py-6">
                      {t("admin.colors.noColors")}
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