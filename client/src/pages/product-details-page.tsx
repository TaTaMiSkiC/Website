import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from 'react-helmet';
import Layout from "@/components/layout/Layout";
import { Product, Review, Scent, Color } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import ProductViewModal from "@/components/product/ProductViewModal";
import { useLanguage } from "@/hooks/use-language";
import {
  Minus,
  Plus,
  Star,
  StarHalf,
  ShoppingBag,
  Heart,
  Share2,
  ChevronRight,
  Truck,
  PackageCheck,
  RefreshCw,
  Clock,
  Flame,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

// Koristimo funkciju za stvaranje sheme jer nam treba pristup translateText funkciji
const createReviewSchema = (translateText: (text: string, sourceLanguage: string) => string) => z.object({
  rating: z.number().min(1).max(5),
  comment: z.string()
    .min(10, translateText("Komentar mora sadržavati barem 10 znakova", "hr"))
    .max(500, translateText("Komentar može sadržavati najviše 500 znakova", "hr")),
});

type ReviewFormValues = z.infer<ReturnType<typeof createReviewSchema>>;

export default function ProductDetailsPage() {
  const [, params] = useRoute("/products/:id");
  const productId = parseInt(params?.id || "0");
  const [quantity, setQuantity] = useState(1);
  const [selectedScentId, setSelectedScentId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [productViewModalOpen, setProductViewModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, translateText, translateObject } = useLanguage();
  
  // Fetch product details
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch product reviews
  const { data: reviews, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });
  
  // Fetch product scents
  const { data: productScents, isLoading: scentsLoading } = useQuery<Scent[]>({
    queryKey: [`/api/products/${productId}/scents`],
    enabled: !!productId,
  });
  
  // Fetch product colors
  const { data: productColors, isLoading: colorsLoading } = useQuery<Color[]>({
    queryKey: [`/api/products/${productId}/colors`],
    enabled: !!productId && product?.hasColorOptions,
  });
  
  // Set default scent and color when data is loaded
  useEffect(() => {
    if (productScents && productScents.length > 0 && !selectedScentId) {
      setSelectedScentId(productScents[0].id);
    }
    
    if (productColors && productColors.length > 0 && !selectedColorId && product?.hasColorOptions) {
      setSelectedColorId(productColors[0].id);
    }
  }, [productScents, productColors, product]);
  
  // Review form
  // Kreiramo reviewSchema sa funkcijom translateText
  const reviewSchema = createReviewSchema(translateText);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });
  
  // Add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    // Provjeri jesu li odabrani potrebni mirisi
    if (productScents && productScents.length > 0 && selectedScentId === null) {
      toast({
        title: translateText("Potreban odabir", "hr"),
        description: translateText("Molimo odaberite miris prije dodavanja u košaricu.", "hr"),
        variant: "destructive",
      });
      return;
    }
    
    // Provjeri jesu li odabrane potrebne boje samo ako proizvod ima opcije boja
    if (product.hasColorOptions && productColors && productColors.length > 0 && selectedColorId === null) {
      toast({
        title: translateText("Potreban odabir", "hr"),
        description: translateText("Molimo odaberite boju prije dodavanja u košaricu.", "hr"),
        variant: "destructive",
      });
      return;
    }
    
    // Get translated product name
    const translatedName = translateText(product.name, "de");
    
    addToCart.mutate(
      { 
        productId: product.id, 
        quantity,
        scentId: selectedScentId || undefined,
        colorId: selectedColorId || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: translateText("Dodano u košaricu", "hr"),
            description: translateText(`${translatedName} (${quantity}x) je dodan u vašu košaricu.`, "hr"),
          });
        },
      }
    );
  };
  
  // Submit review
  const onSubmitReview = async (values: ReviewFormValues) => {
    if (!productId || !user) return;
    
    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: values.rating,
          comment: values.comment,
        }),
        credentials: "include",
      });
      
      toast({
        title: translateText("Recenzija poslana", "hr"),
        description: translateText("Hvala na vašoj recenziji!", "hr"),
      });
      
      form.reset();
      refetchReviews();
    } catch (error) {
      toast({
        title: translateText("Greška", "hr"),
        description: translateText("Recenziju nije moguće poslati. Pokušajte ponovno kasnije.", "hr"),
        variant: "destructive",
      });
    }
  };
  
  // Mutation za brisanje recenzije
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(translateText('Neuspješno brisanje recenzije', 'hr'));
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: translateText("Recenzija izbrisana", "hr"),
        description: translateText("Recenzija je uspješno izbrisana", "hr"),
      });
      // Osvježi podatke
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      setReviewToDelete(null);
    },
    onError: (error) => {
      toast({
        title: translateText("Greška", "hr"),
        description: `${translateText("Neuspješno brisanje recenzije", "hr")}: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Increment/decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  // Calculate average rating
  const averageRating = reviews?.length ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length :
    0;
  
  if (productLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/2 bg-gray-200 animate-pulse aspect-square rounded-lg"></div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 animate-pulse rounded w-full"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="heading text-2xl font-bold mb-4">{translateText("Proizvod nije pronađen", "hr")}</h1>
          <p className="mb-6">{translateText("Žao nam je, traženi proizvod ne postoji ili je uklonjen.", "hr")}</p>
          <Button asChild>
            <Link href="/products">{translateText("Natrag na proizvode", "hr")}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{`${product.name} | Kerzenwelt`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} | Kerzenwelt`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.imageUrl || ''} />
      </Helmet>
      
      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/">
              <div className="hover:text-primary cursor-pointer">{translateText("Početna", "hr")}</div>
            </Link>
            <ChevronRight size={14} className="mx-2" />
            <Link href="/products">
              <div className="hover:text-primary cursor-pointer">{translateText("Proizvodi", "hr")}</div>
            </Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-foreground font-medium">{translateText(product.name, "de")}</span>
          </div>
        </div>
      </div>
      
      {/* Product details section */}
      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Product image */}
            <div className="w-full md:w-1/2">
              <div className="bg-neutral rounded-lg overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            
            {/* Product info */}
            <div className="w-full md:w-1/2">
              <h1 className="heading text-3xl font-bold text-foreground mb-2">{translateText(product.name, "de")}</h1>
              
              {/* Ratings */}
              <div className="flex items-center mb-4">
                <div className="flex text-warning mr-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    if (i < Math.floor(averageRating)) {
                      return <Star key={i} className="fill-current" size={16} />;
                    } else if (i === Math.floor(averageRating) && averageRating % 1 > 0) {
                      return <StarHalf key={i} className="fill-current" size={16} />;
                    } else {
                      return <Star key={i} size={16} />;
                    }
                  })}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews?.length || 0} {translateText("recenzija", "hr")})
                </span>
              </div>
              
              {/* Price */}
              <div className="text-xl font-bold text-primary mb-4">
                {parseFloat(product.price).toFixed(2)} €
              </div>
              
              {/* Short description */}
              <p className="text-muted-foreground mb-6">{translateText(product.description, "de")}</p>
              
              {/* Product attributes */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {product.scent && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                      <Flame size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{translateText("Miris", "hr")}</p>
                      <p className="font-medium text-foreground">{translateText(product.scent, "de")}</p>
                    </div>
                  </div>
                )}
                
                {product.color && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                      <div 
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: product.color.toLowerCase() }}
                      ></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{translateText("Boja", "hr")}</p>
                      <p className="font-medium text-foreground">{translateText(product.color, "de")}</p>
                    </div>
                  </div>
                )}
                
                {product.burnTime && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                      <Clock size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{translateText("Trajanje", "hr")}</p>
                      <p className="font-medium text-foreground">{translateText(product.burnTime, "de")}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                    <PackageCheck size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{translateText("Dostupnost", "hr")}</p>
                    <p className="font-medium text-foreground">
                      {product.stock > 0 ? (
                        product.stock > 10 ? (
                          <span className="text-success">{translateText("Na zalihi", "hr")}</span>
                        ) : (
                          <span className="text-warning">{translateText(`Zadnjih ${product.stock} komada`, "hr")}</span>
                        )
                      ) : (
                        <span className="text-destructive">{translateText("Nije na zalihi", "hr")}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Opcije - Informacija */}
              {(productScents && productScents.length > 0) || (product.hasColorOptions && productColors && productColors.length > 0) ? (
                <div className="mb-6 p-4 bg-muted/20 rounded-md">
                  <div className="flex items-center">
                    <div className="mr-2 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{translateText("Ovaj proizvod ima dostupne opcije", "hr")}</p>
                      <p className="text-xs text-muted-foreground">
                        {translateText(`Kliknite na "Odaberi opcije" da biste izabrali željeni ${productScents && productScents.length > 0 ? "miris" : ""}${(productScents && productScents.length > 0) && (product.hasColorOptions && productColors && productColors.length > 0) ? " i " : ""}${(product.hasColorOptions && productColors && productColors.length > 0) ? "boju" : ""} prije dodavanja u košaricu.`, "hr")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Add to cart */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <div className="flex border border-input rounded-md overflow-hidden mr-4">
                    <button 
                      type="button" 
                      className="px-3 py-2 bg-muted hover:bg-muted/80 transition"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      className="w-12 text-center border-none focus:ring-0 bg-background"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0 && val <= product.stock) {
                          setQuantity(val);
                        }
                      }}
                      min={1}
                      max={product.stock}
                    />
                    <button 
                      type="button" 
                      className="px-3 py-2 bg-muted hover:bg-muted/80 transition"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <Button 
                    className="flex-1"
                    onClick={() => setProductViewModalOpen(true)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    Odaberi opcije
                  </Button>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="outline" className="flex-1">
                    <Heart size={18} className="mr-2" />
                    {translateText("Dodaj u favorite", "hr")}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 size={18} className="mr-2" />
                    {translateText("Podijeli", "hr")}
                  </Button>
                </div>
              </div>
              
              {/* Shipping info */}
              <div className="mt-8 pt-6 border-t border-input">
                <div className="flex items-center mb-3">
                  <Truck size={18} className="text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">{translateText("Besplatna dostava za narudžbe iznad 50€", "hr")}</span>
                </div>
                <div className="flex items-center">
                  <RefreshCw size={18} className="text-primary mr-2" />
                  <span className="text-sm text-muted-foreground">{translateText("Povrat u roku od 14 dana", "hr")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product tabs section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="description">
            <TabsList className="w-full flex mb-8 bg-card">
              <TabsTrigger value="description" className="flex-1 py-3">{translateText("Opis", "hr")}</TabsTrigger>
              <TabsTrigger value="details" className="flex-1 py-3">{translateText("Detalji", "hr")}</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 py-3">
                {translateText("Recenzije", "hr")} ({reviews?.length || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="heading text-xl font-semibold mb-4">{translateText("Opis proizvoda", "hr")}</h2>
              <div className="prose max-w-none">
                <p>{translateText(product.description, "hr")}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="heading text-xl font-semibold mb-4">{translateText("Specifikacije proizvoda", "hr")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Accordion type="single" collapsible>
                    {/* Prikazujemo sekciju Dimenzije i težina samo ako postoje ti podaci */}
                    {(product.dimensions || product.weight) && (
                      <AccordionItem value="dimensions">
                        <AccordionTrigger>{translateText("Dimenzije i težina", "hr")}</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            {product.dimensions && <li>{translateText(product.dimensions, "hr")}</li>}
                            {product.weight && <li>{translateText("Težina", "hr")}: {translateText(product.weight, "hr")}</li>}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    
                    {/* Prikazujemo sekciju Materijali samo ako postoje ti podaci */}
                    {product.materials && (
                      <AccordionItem value="materials">
                        <AccordionTrigger>{translateText("Materijali", "hr")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="text-muted-foreground">
                            {translateText(product.materials, "hr")}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
                <div>
                  <Accordion type="single" collapsible>
                    {/* Prikazujemo sekciju Upute za korištenje samo ako postoje ti podaci */}
                    {product.instructions && (
                      <AccordionItem value="usage">
                        <AccordionTrigger>{translateText("Upute za korištenje", "hr")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="text-muted-foreground">
                            {translateText(product.instructions, "hr")}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    
                    {/* Prikazujemo sekciju Održavanje samo ako postoje ti podaci */}
                    {product.maintenance && (
                      <AccordionItem value="care">
                        <AccordionTrigger>{translateText("Održavanje", "hr")}</AccordionTrigger>
                        <AccordionContent>
                          <div className="text-muted-foreground">
                            {translateText(product.maintenance, "hr")}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </div>
              </div>
              
              {/* Ako nema nijednog podatka za prikaz, prikazujemo poruku */}
              {!product.dimensions && !product.weight && !product.materials && !product.instructions && !product.maintenance && (
                <div className="text-center text-muted-foreground py-6">
                  {translateText("Detalji o ovom proizvodu trenutno nisu dostupni.", "hr")}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="bg-card p-6 rounded-lg shadow-sm">
              <h2 className="heading text-xl font-semibold mb-4">{translateText("Recenzije kupaca", "hr")}</h2>
              
              {/* Reviews list */}
              {reviews?.length ? (
                <div className="space-y-6 mb-8">
                  {reviews.map((review) => (
                    <Card key={review.id} className="relative">
                      {user?.isAdmin && (
                        <div className="absolute top-4 right-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setReviewToDelete(review.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{translateText("Jeste li sigurni?", "hr")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {translateText("Ova akcija je nepovratna. Recenzija će biti trajno izbrisana iz sustava.", "hr")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setReviewToDelete(null)}>
                                  {translateText("Odustani", "hr")}
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => {
                                    if (reviewToDelete) {
                                      deleteReviewMutation.mutate(reviewToDelete);
                                    }
                                  }}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  {deleteReviewMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  {translateText("Izbriši", "hr")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex text-warning mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={16} 
                                  className={i < review.rating ? "fill-current" : ""}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="bg-secondary text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center">
                            {review.userId.toString().substring(0, 2)}
                          </div>
                        </div>
                        <p className="text-foreground">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reviewsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{translateText("Učitavanje recenzija...", "hr")}</p>
                </div>
              ) : (
                <div className="text-center py-8 mb-8">
                  <p className="text-muted-foreground">{translateText("Još nema recenzija za ovaj proizvod.", "hr")}</p>
                </div>
              )}
              
              {/* Add review form */}
              {user ? (
                <div>
                  <Separator className="my-8" />
                  <h3 className="heading text-lg font-semibold mb-4">{translateText("Napišite recenziju", "hr")}</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translateText("Ocjena", "hr")}</FormLabel>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => field.onChange(rating)}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    size={24}
                                    className={`${
                                      rating <= field.value ? "text-warning fill-warning" : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translateText("Vaš komentar", "hr")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={translateText("Podijelite svoje iskustvo s ovim proizvodom...", "hr")}
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? translateText("Slanje...", "hr") : translateText("Objavi recenziju", "hr")}
                      </Button>
                    </form>
                  </Form>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">{translateText("Prijavite se kako biste mogli napisati recenziju.", "hr")}</p>
                  <Button asChild>
                    <Link href="/auth">{translateText("Prijava / Registracija", "hr")}</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Product view modal */}
      {product && (
        <ProductViewModal
          isOpen={productViewModalOpen}
          onClose={() => setProductViewModalOpen(false)}
          product={product}
        />
      )}
    </Layout>
  );
}
