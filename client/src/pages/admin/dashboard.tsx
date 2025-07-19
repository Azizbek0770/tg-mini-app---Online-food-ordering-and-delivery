import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ShoppingBag, 
  DollarSign, 
  Users, 
  TrendingUp,
  Eye,
  CheckCircle 
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'preparing':
        return <Badge className="bg-warning text-warning-foreground">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-info text-info-foreground">Ready</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar activeSection="dashboard" onSectionChange={() => {}} />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
            <p className="text-muted-foreground">Overview of your restaurant operations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Today's Orders"
              value={statsLoading ? "..." : stats?.todayOrders || 0}
              change={statsLoading ? undefined : "+12%"}
              icon={ShoppingBag}
              iconColor="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            />
            
            <StatsCard
              title="Revenue"
              value={statsLoading ? "..." : `$${parseFloat(stats?.todayRevenue || '0').toFixed(2)}`}
              change={statsLoading ? undefined : "+8%"}
              icon={DollarSign}
              iconColor="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
            />
            
            <StatsCard
              title="Active Users"
              value={statsLoading ? "..." : stats?.activeUsers || 0}
              change={statsLoading ? undefined : "+15%"}
              icon={Users}
              iconColor="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
            />
            
            <StatsCard
              title="Avg. Order"
              value={statsLoading ? "..." : `$${parseFloat(stats?.averageOrder || '0').toFixed(2)}`}
              change={statsLoading ? undefined : "+3%"}
              icon={TrendingUp}
              iconColor="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
            />
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Order ID</th>
                        <th className="text-left p-2">Customer</th>
                        <th className="text-left p-2">Items</th>
                        <th className="text-left p-2">Total</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders?.slice(0, 10).map((order: any) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-2 font-medium">#{order.orderNumber}</td>
                          <td className="p-2">
                            {order.user ? (
                              <div>
                                <div className="font-medium">
                                  {order.user.firstName} {order.user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.user.email || 'Telegram User'}
                                </div>
                              </div>
                            ) : (
                              'Guest'
                            )}
                          </td>
                          <td className="p-2">
                            <div className="text-sm">
                              {order.items?.length || 0} items
                            </div>
                          </td>
                          <td className="p-2 font-medium">
                            ${parseFloat(order.total).toFixed(2)}
                          </td>
                          <td className="p-2">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-800 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
