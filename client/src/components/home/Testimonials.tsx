import { Star, StarHalf, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { queryClient } from "@/lib/queryClient";

type ReviewWithUser = {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  product: {
    id: number;
    name: string;
  };
};

export default function Testimonials() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  
  // Dohvati sve recenzije
  const { data: reviews, isLoading, isError } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/reviews"],
    retry: 3,
    staleTime: 60000,
  });
  
  // Log za debugiranje
  console.log('Reviews loaded:', reviews);
  
  // Filtriraj recenzije s tekstom i ograniči na 6 najnovijih
  const recentReviews = reviews?.filter(review => review.comment && review.comment.length > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
    
  console.log('Recent reviews:', recentReviews);
  
  // Mutation za brisanje recenzije
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Neuspješno brisanje recenzije');
      }
      
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Recenzija izbrisana",
        description: "Recenzija je uspješno izbrisana",
      });
      // Osvježi podatke
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      setReviewToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Greška",
        description: `Neuspješno brisanje recenzije: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Stvaranje inicijala iz imena korisnika
  const getInitials = (review: ReviewWithUser) => {
    if (review.user.firstName && review.user.lastName) {
      return `${review.user.firstName[0]}${review.user.lastName[0]}`;
    } else {
      return review.user.username.slice(0, 2).toUpperCase();
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading text-3xl md:text-4xl font-bold text-foreground">{t('testimonials.title')}</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{t('testimonials.subtitle')}</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : recentReviews && recentReviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentReviews.map((review) => (
                <div key={review.id} className="bg-card p-6 rounded-lg shadow-md relative">
                  {user?.isAdmin && (
                    <div className="absolute top-2 right-2">
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
                            <AlertDialogTitle>{t('dialog.areYouSure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('dialog.cannotUndo')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setReviewToDelete(null)}>
                              {t('dialog.cancel')}
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
                              {t('dialog.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                
                  <div className="flex text-warning mb-4">
                    {Array.from({ length: 5 }).map((_, i) => {
                      if (i < Math.floor(review.rating)) {
                        return <Star key={i} className="fill-warning text-warning" size={18} />;
                      } else if (i === Math.floor(review.rating) && review.rating % 1 > 0) {
                        return <StarHalf key={i} className="fill-warning text-warning" size={18} />;
                      } else {
                        return <Star key={i} className="text-warning" size={18} />;
                      }
                    })}
                  </div>
                  <p className="text-muted-foreground italic mb-2">{review.comment}</p>
                  <p className="text-xs text-primary mb-6">
                    <Link href={`/products/${review.productId}`}>
                      {review.product.name}
                    </Link>
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                      {getInitials(review)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-foreground">{review.user.firstName && review.user.lastName 
                        ? `${review.user.firstName} ${review.user.lastName}` 
                        : review.user.username}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('hr-HR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button asChild variant="outline">
                <Link href="/products">{t('testimonials.browseProducts')}</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-card p-8 rounded-lg shadow-md text-center">
            <p className="text-muted-foreground mb-6">{t('testimonials.empty')}</p>
            
            {user ? (
              <Button asChild>
                <Link href="/products">{t('testimonials.browseProducts')}</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth">{t('testimonials.loginToReview')}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
