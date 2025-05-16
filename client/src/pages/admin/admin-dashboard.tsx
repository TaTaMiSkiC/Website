import { useQuery } from "@tanstack/react-query";
import { Helmet } from 'react-helmet';
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Box, DollarSign, Users, PackageOpen, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useLanguage } from "@/hooks/use-language";

const COLORS = ['#8B5A2B', '#D4B996', '#F1E3D3'];

export default function AdminDashboard() {
  const { t } = useLanguage();
  
  // Sales data for chart (mock data to demonstrate UI)
  const salesData = [
    { name: t("month.january"), sales: 4000 },
    { name: t("month.february"), sales: 3000 },
    { name: t("month.march"), sales: 5000 },
    { name: t("month.april"), sales: 2780 },
    { name: t("month.may"), sales: 1890 },
    { name: t("month.june"), sales: 2390 },
    { name: t("month.july"), sales: 3490 },
    { name: t("month.august"), sales: 2900 },
    { name: t("month.september"), sales: 3200 },
    { name: t("month.october"), sales: 4000 },
    { name: t("month.november"), sales: 4500 },
    { name: t("month.december"), sales: 6000 },
  ];

  // Product category distribution
  const categoryData = [
    { name: t("admin.dashboard.scentedCandles"), value: 55 },
    { name: t("admin.dashboard.decorativeCandles"), value: 30 },
    { name: t("admin.dashboard.personalizedCandles"), value: 15 },
  ];
  
  // Fetch summary data
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });
  
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });
  
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Calculate summary metrics
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalUsers = users?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

  return (
    <AdminLayout title={t("admin.dashboard.title")}>
      <Helmet>
        <title>{t("admin.dashboard.title")} | Admin Panel | Kerzenwelt by Dani</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.totalRevenue")}</p>
                  <h3 className="text-2xl font-bold mt-1">{totalRevenue.toFixed(2)} €</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">12%</span>
                <span className="text-muted-foreground ml-1">{t("admin.dashboard.comparedToLastMonth")}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.orders")}</p>
                  <h3 className="text-2xl font-bold mt-1">{totalOrders}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">8%</span>
                <span className="text-muted-foreground ml-1">{t("admin.dashboard.comparedToLastMonth")}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.users")}</p>
                  <h3 className="text-2xl font-bold mt-1">{totalUsers}</h3>
                </div>
                <div className="bg-violet-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-violet-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">5%</span>
                <span className="text-muted-foreground ml-1">{t("admin.dashboard.comparedToLastMonth")}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("admin.dashboard.products")}</p>
                  <h3 className="text-2xl font-bold mt-1">{totalProducts}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Box className="h-6 w-6 text-amber-500" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">3%</span>
                <span className="text-muted-foreground ml-1">{t("admin.dashboard.comparedToLastMonth")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                {t("admin.dashboard.salesOverTime")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8B5A2B" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Product Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PackageOpen className="h-5 w-5 mr-2" />
                {t("admin.dashboard.productCategoryDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders/Activity Row */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("admin.dashboard.recentOrders")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.dashboard.id")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.dashboard.user")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.dashboard.date")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.dashboard.status")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.dashboard.amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders?.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{order.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "completed" 
                              ? "bg-green-100 text-green-800" 
                              : order.status === "pending" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {parseFloat(order.total).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                    {(!orders || orders.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          {t("admin.dashboard.noOrders")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
