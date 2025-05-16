import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

interface Notification {
  id: number;
  type: "order" | "invoice" | "system";
  title: string;
  message: string;
  read: boolean;
  date: Date;
  link?: string;
  orderId?: number;
  invoiceId?: number;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();

  // Dohvati najnovije narudžbe
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Simuliraj notifikacije na temelju narudžbi
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Uzmi zadnjih 5 narudžbi
      const latestOrders = [...orders].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }).slice(0, 5);
      
      // Generiraj notifikacije za svaku narudžbu
      const newNotifications: Notification[] = latestOrders.map((order, index) => {
        return {
          id: order.id,
          type: "order",
          title: `${t("admin.notification.newOrder")} #${order.id}`,
          message: `${t("admin.notification.orderReceived")} ${order.total} EUR`,
          read: index > 1, // prve dvije notifikacije su nepročitane
          date: new Date(order.createdAt),
          link: `/admin/orders/${order.id}`,
          orderId: order.id
        };
      });
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    }
  }, [orders]);

  // Označi sve notifikacije kao pročitane kada se otvori popover
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    }
  };

  const formatDate = (date: Date) => {
    // Lokalizacija datuma prema trenutnom jeziku
    const localeMap: Record<string, string> = {
      'de': 'de-DE',
      'hr': 'hr-HR',
      'en': 'en-US',
      'it': 'it-IT',
      'sl': 'sl-SI'
    };
    
    const locale = localeMap[language] || 'de-DE';
    
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-lg">{t("admin.notification.title")}</CardTitle>
            <CardDescription>
              {unreadCount > 0 
                ? t("admin.notification.unreadCount").replace("{count}", unreadCount.toString())
                : t("admin.notification.noNew")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <a 
                      key={notification.id}
                      href={notification.link} 
                      className={`block px-4 py-3 hover:bg-muted transition-colors cursor-pointer ${
                        !notification.read ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {notification.title}
                            {!notification.read && (
                              <Badge variant="outline" className="ml-2 bg-primary text-primary-foreground">
                                {t("admin.notification.new")}
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.date)}</p>
                        </div>
                        {notification.type === "order" && (
                          <Badge variant="outline" className="ml-2">{t("admin.notification.order")}</Badge>
                        )}
                        {notification.type === "invoice" && (
                          <Badge variant="outline" className="ml-2">{t("admin.notification.invoice")}</Badge>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">{t("admin.notification.noNotifications")}</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotifications;