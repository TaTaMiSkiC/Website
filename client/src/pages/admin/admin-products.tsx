import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Helmet } from 'react-helmet';
import AdminLayout from "@/components/admin/AdminLayout";
import ProductForm from "@/components/admin/ProductForm";
import { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Filter, MoreVertical, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";

export default function AdminProducts() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Fetch products
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Filter products based on search term and category
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? product.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });
  
  // Handle product edit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };
  
  // Handle product delete
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };
  
  // Toggle product activation status
  const toggleActivationMutation = useMutation({
    mutationFn: async ({ productId, active }: { productId: number, active: boolean }) => {
      try {
        console.log(`Sending activation patch with data:`, { productId, active });
        const response = await fetch(`/api/products/${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ active }),
        });
        
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }
        
        const result = await response.text();
        console.log("Raw server response:", result);
        
        try {
          return result ? JSON.parse(result) : { success: true };
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          return { success: true, active: active };
        }
      } catch (error) {
        console.error("Network error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation success data:", data);
      // If data is not defined or doesn't have active field, use default values
      const isActive = data?.active !== false;
      const productName = data?.name || t("admin.product.productDefault");
      
      const statusText = isActive 
        ? t("admin.product.activated") 
        : t("admin.product.deactivated");
        
      toast({
        title: t("admin.product.statusChangeTitle").replace("{status}", statusText),
        description: t("admin.product.statusChangeDescription")
          .replace("{name}", productName)
          .replace("{status}", statusText),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
    },
    onError: (error: Error) => {
      console.error("Activation error:", error);
      toast({
        title: t("common.error"),
        description: t("admin.product.statusChangeError").replace("{error}", error.message),
        variant: "destructive",
      });
    }
  });
  
  // Handle toggling product activation
  const handleToggleActivation = (product: Product) => {
    toggleActivationMutation.mutate({
      productId: product.id,
      active: product.active === false
    });
  };
  
  // Confirm delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/products/${productToDelete.id}`);
      
      toast({
        title: t("admin.product.deleteSuccess"),
        description: t("admin.product.deleteSuccessDescription").replace("{name}", productToDelete.name),
      });
      
      // Refresh products list
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: t("common.error"),
        description: t("admin.product.deleteError").replace("{error}", errorMessage),
        variant: "destructive",
      });
    }
  };
  
  // Reset product form
  const resetProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  return (
    <AdminLayout title={t("admin.productsTitle")}>
      <Helmet>
        <title>{t("admin.productsPageTitle")} | Admin Panel | Kerzenwelt by Dani</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t("admin.productsTitle")}</h1>
            <p className="text-muted-foreground">{t("admin.productsSubtitle")}</p>
          </div>
          
          <Button onClick={() => setShowProductForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t("admin.product.newProduct")}
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("admin.products.searchPlaceholder")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" /> {t("admin.product.category")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter(null)}
                    className={!categoryFilter ? "bg-accent/50" : ""}
                  >
                    {t("admin.product.allCategories")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories?.map((category) => (
                    <DropdownMenuItem 
                      key={category.id} 
                      onClick={() => setCategoryFilter(category.id)}
                      className={categoryFilter === category.id ? "bg-accent/50" : ""}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        
        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.product.productsList")}</CardTitle>
            <CardDescription>
              {filteredProducts 
                ? `${filteredProducts.length} ${t("admin.product.items")}` 
                : t("admin.product.loadingProducts")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-8 text-destructive">
                {t("admin.product.loadingError")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.product.image")}</TableHead>
                      <TableHead>{t("admin.product.name")}</TableHead>
                      <TableHead>{t("admin.product.category")}</TableHead>
                      <TableHead>{t("admin.product.price")}</TableHead>
                      <TableHead>{t("admin.product.stock")}</TableHead>
                      <TableHead>{t("admin.product.status")}</TableHead>
                      <TableHead className="w-[100px]">{t("admin.product.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t("admin.product.noProductsFound")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded overflow-hidden">
                              <img 
                                src={product.imageUrl || "https://placehold.co/100x100/gray/white?text=Nema+slike"} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://placehold.co/100x100/gray/white?text=Greška";
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {product.name}
                              {product.featured && (
                                <Star className="ml-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {categories?.find(c => c.id === product.categoryId)?.name || "-"}
                          </TableCell>
                          <TableCell>{parseFloat(product.price).toFixed(2)} €</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant={product.stock > 0 ? "default" : "destructive"}
                                className={product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : ""}
                              >
                                {product.stock > 10 
                                  ? t("admin.product.inStock") 
                                  : product.stock > 0 
                                    ? t("admin.product.lowStock") 
                                    : t("admin.product.outOfStock")
                                }
                              </Badge>
                              
                              <Badge 
                                variant={product.active !== false ? "outline" : "destructive"}
                                className={product.active !== false ? "border-green-500 text-green-600" : ""}
                              >
                                {product.active !== false 
                                    ? t("admin.product.active") 
                                    : t("admin.product.inactive")
                                }
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("admin.product.actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                  <Edit className="mr-2 h-4 w-4" /> {t("admin.product.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActivation(product)}>
                                  {product.active !== false ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" /> {t("admin.product.deactivate")}
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="mr-2 h-4 w-4" /> {t("admin.product.activate")}
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteProduct(product)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> {t("admin.product.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? t("admin.product.editProduct") : t("admin.product.newProduct")}</DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? t("admin.product.editProductDescription") 
                : t("admin.product.newProductDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] pr-4">
            <ProductForm 
              product={editingProduct || undefined} 
              onSuccess={resetProductForm}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.product.deleteConfirmation")}</DialogTitle>
            <DialogDescription>
              {t("admin.product.deleteConfirmationMessage").replace("{name}", productToDelete?.name || "")}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("admin.product.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
