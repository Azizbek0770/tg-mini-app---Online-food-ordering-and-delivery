import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Eye, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  userId: string;
  status: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  customerNotes?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: string;
    specialInstructions?: string;
    menuItem?: {
      id: number;
      name: string;
      price: string;
    };
  }>;
}

export default function AdminOrders() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const { data: orders, isLoading: ordersLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders", statusFilter ? { status: statusFilter } : undefined],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
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
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'preparing':
        return <Badge className="bg-warning text-warning-foreground"><RefreshCw className="w-3 h-3 mr-1" />Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-info text-info-foreground"><CheckCircle className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar activeSection="orders" onSectionChange={() => {}} />
        
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Orders Management</h2>
              <p className="text-muted-foreground">Track and manage customer orders</p>
            </div>
            <div className="flex space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders?.length ? orders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-foreground">#{order.orderNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-medium mr-3">
                                {order.user?.firstName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {order.user?.firstName} {order.user?.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {order.user?.email || 'Telegram User'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.items?.slice(0, 2).map(item => item.menuItem?.name).join(', ')}
                              {(order.items?.length || 0) > 2 && '...'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-foreground">
                            ${parseFloat(order.total).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
                            <p className="text-muted-foreground">
                              {statusFilter ? `No orders with status "${statusFilter}"` : 'No orders have been placed yet'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Details - #{selectedOrder.orderNumber}</CardTitle>
                    <Button variant="ghost" onClick={() => setSelectedOrder(null)}>✕</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">
                        {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.user?.email || 'Telegram User'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-medium text-lg text-primary">
                        ${parseFloat(selectedOrder.total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.menuItem?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${parseFloat(item.price).toFixed(2)} × {item.quantity}
                            </p>
                            {item.specialInstructions && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <p className="font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>${parseFloat(selectedOrder.deliveryFee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total</span>
                        <span className="text-primary">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.customerNotes && (
                    <div>
                      <h4 className="font-semibold mb-2">Customer Notes</h4>
                      <p className="text-sm bg-muted/30 p-3 rounded-lg">
                        {selectedOrder.customerNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
