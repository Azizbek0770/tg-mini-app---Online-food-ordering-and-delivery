import { useCart } from "@/hooks/use-cart";
import { CustomerHeader } from "@/components/customer/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getSubtotal,
    getDeliveryFee,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CustomerHeader />
        
        <div className="p-4">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Shopping Cart</h1>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Add some delicious items to get started!
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CustomerHeader />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Shopping Cart</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    {item.menuItem.imageUrl ? (
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                        🍔
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.menuItem.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      ${parseFloat(item.menuItem.price).toFixed(2)} each
                    </p>
                    
                    {item.specialInstructions && (
                      <Badge variant="outline" className="text-xs">
                        Note: {item.specialInstructions}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        ${(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive p-1 h-auto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="sticky bottom-4">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${getSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={`font-medium ${getDeliveryFee() === 0 ? 'text-success' : ''}`}>
                  {getDeliveryFee() === 0 ? 'Free' : `$${getDeliveryFee().toFixed(2)}`}
                </span>
              </div>
              
              {getDeliveryFee() > 0 && getSubtotal() < 25 && (
                <p className="text-xs text-info">
                  💡 Add ${(25 - getSubtotal()).toFixed(2)} more for free delivery!
                </p>
              )}
              
              <div className="flex justify-between font-semibold text-lg border-t pt-3">
                <span>Total</span>
                <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
              </div>
              
              <Link href="/mini/checkout">
                <Button className="w-full bg-primary hover:bg-primary-dark py-3 text-lg">
                  Proceed to Checkout 🎉
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
