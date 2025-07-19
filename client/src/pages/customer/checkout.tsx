import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { CustomerHeader } from "@/components/customer/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { telegram } from "@/lib/telegram";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getTotalPrice, getSubtotal, getDeliveryFee, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerNotes, setCustomerNotes] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        order: {
          subtotal: getSubtotal().toString(),
          deliveryFee: getDeliveryFee().toString(),
          total: getTotalPrice().toString(),
          customerNotes: customerNotes.trim() || null,
          status: 'pending',
        },
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.price,
          specialInstructions: item.specialInstructions || null,
        })),
      };

      // Check if we're in Telegram WebApp
      if (telegram.isAvailable()) {
        const telegramUser = telegram.getUser();
        const telegramOrderData = {
          userId: telegramUser?.id.toString(),
          items: orderData.items,
          customerNotes: customerNotes.trim() || null,
          telegramChatId: telegramUser?.id.toString(),
        };
        
        const response = await apiRequest("POST", "/api/orders/telegram", telegramOrderData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/orders", orderData);
        return response.json();
      }
    },
    onSuccess: (order) => {
      setOrderNumber(order.order?.orderNumber || order.orderNumber);
      setIsOrderPlaced(true);
      
      // Send order confirmation to Telegram bot if in WebApp
      if (telegram.isAvailable()) {
        telegram.sendData({
          type: 'order_placed',
          orderNumber: order.order?.orderNumber || order.orderNumber,
        });
        telegram.hapticFeedback('success');
      }
      clearCart();
      
      // Haptic feedback
      telegram.hapticFeedback('success');
      
      // Show Telegram main button
      telegram.showMainButton("View Order Status", () => {
        setLocation('/');
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      
      toast({
        title: "Order Placed! 🎉",
        description: `Your order ${order.orderNumber} has been confirmed`,
      });
    },
    onError: (error) => {
      telegram.hapticFeedback('error');
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect if cart is empty and order not placed
  if (items.length === 0 && !isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CustomerHeader />
        
        <div className="p-4">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No items to checkout
              </h3>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart first!
              </p>
              <Link href="/">
                <Button className="bg-primary hover:bg-primary-dark">
                  Browse Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Order confirmation screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CustomerHeader />
        
        <div className="p-4 max-w-md mx-auto">
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success-foreground" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Order Confirmed! 🎉
              </h2>
              
              <p className="text-muted-foreground mb-4">
                Thank you for your order!
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="text-xl font-bold text-primary">#{orderNumber}</p>
              </div>
              
              <div className="space-y-3 text-left mb-6">
                <p className="text-sm text-muted-foreground">
                  🕒 Estimated delivery: 20-30 minutes
                </p>
                <p className="text-sm text-muted-foreground">
                  📱 You'll receive updates via Telegram
                </p>
                <p className="text-sm text-muted-foreground">
                  💳 Total: ${getTotalPrice().toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    Continue Browsing
                  </Button>
                </Link>
                
                <Link href="/mini/orders">
                  <Button variant="outline" className="w-full">
                    Track Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Checkout form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CustomerHeader />
      
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/mini/cart">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Checkout</h1>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(item.menuItem.price).toFixed(2)} × {item.quantity}
                    </p>
                    {item.specialInstructions && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.specialInstructions}
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium">
                    ${(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={getDeliveryFee() === 0 ? 'text-success' : ''}>
                    {getDeliveryFee() === 0 ? 'Free' : `$${getDeliveryFee().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */}
          {isAuthenticated && user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  {user.email && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                  <p className="text-sm text-info">
                    📱 Updates will be sent via Telegram
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests or notes for your order..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">Pay on Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Cash or Card accepted
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={() => placeOrderMutation.mutate()}
            disabled={placeOrderMutation.isPending}
            className="w-full bg-primary hover:bg-primary-dark py-4 text-lg font-semibold"
            size="lg"
          >
            {placeOrderMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Placing Order...
              </>
            ) : (
              <>
                Place Order - ${getTotalPrice().toFixed(2)} 🎉
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
