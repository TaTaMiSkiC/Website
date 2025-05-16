import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { User, Order } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, PackageOpen, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";

// Component for displaying order status with Badge component
function OrderStatusBadge({ status, t }: { status: string, t: (key: string) => string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status) {
    case "pending":
      variant = "outline";
      return <Badge variant={variant}>{t("orders.pending")}</Badge>;
    case "processing":
      variant = "secondary";
      return <Badge variant={variant}>{t("orders.processing")}</Badge>;
    case "shipped":
      variant = "default";
      return <Badge variant={variant}>{t("orders.shipped")}</Badge>;
    case "completed":
      variant = "default";
      return <Badge variant={variant}>{t("orders.completed")}</Badge>;
    case "cancelled":
      variant = "destructive";
      return <Badge variant={variant}>{t("orders.cancelled")}</Badge>;
    default:
      return <Badge variant={variant}>{status}</Badge>;
  }
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  // Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);
  
  // Fetch user orders
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders/user"],
    enabled: !!user,
  });
  
  if (!user) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>{t("orders.myOrders")} | Kerzenwelt by Dani</title>
        <meta name="description" content={t("orders.myOrders") + " - Kerzenwelt by Dani"} />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{t("orders.myOrders")}</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t("orders.orderHistory")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>{t("orders.loadingError")}</p>
                <p className="text-sm mt-2">{t("orders.tryAgain")}</p>
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("orders.orderNumber")}</TableHead>
                      <TableHead>{t("orders.date")}</TableHead>
                      <TableHead>{t("orders.total")}</TableHead>
                      <TableHead>{t("orders.status")}</TableHead>
                      <TableHead>{t("orders.paymentMethod")}</TableHead>
                      <TableHead>{t("orders.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          {order.createdAt 
                            ? format(new Date(order.createdAt), 'dd.MM.yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {parseFloat(String(order.total)).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} t={t} />
                        </TableCell>
                        <TableCell>
                          {order.paymentMethod === 'bank_transfer' 
                            ? t("orders.bankTransfer")
                            : order.paymentMethod === 'paypal' 
                              ? 'PayPal' 
                              : order.paymentMethod}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.location.href = `/orders/${order.id}`}
                          >
                            {t("orders.details")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t("orders.noOrders")}</h3>
                <p className="text-muted-foreground mt-2 mb-6">
                  {t("orders.startShopping")}
                </p>
                <Button 
                  onClick={() => window.location.href = '/products'}
                  className="mt-2"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t("orders.browseProducts")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}