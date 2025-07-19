import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomerHeader } from "@/components/customer/header";
import { CategoryFilter } from "@/components/customer/category-filter";
import { MenuItem } from "@/components/customer/menu-item";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { telegram } from "@/lib/telegram";
import type { MenuItem as MenuItemType } from "@shared/schema";

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isOpen } = useCart();

  const { data: menuItems, isLoading } = useQuery<(MenuItemType & { category: any })[]>({
    queryKey: ["/api/menu", selectedCategory !== 'all' ? { categoryId: selectedCategory } : undefined],
  });

  // Telegram WebApp initialization
  useEffect(() => {
    if (telegram.isAvailable()) {
      telegram.expand();
      
      // Set theme based on Telegram
      const telegramTheme = telegram.getTheme();
      document.documentElement.classList.toggle('dark', telegramTheme === 'dark');
    }
  }, []);

  // Filter menu items by category if needed
  const filteredItems = menuItems?.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category?.slug === selectedCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CustomerHeader />
      
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="px-4 py-6 pb-20">
        {/* Featured Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 card-shadow">
          <img 
            src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300"
            alt="Restaurant banner"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 gradient-overlay flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">🎉 Grand Opening!</h2>
              <p className="text-sm opacity-90">Free delivery on orders over $25</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex">
                  <div className="flex-1 p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-3" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                  <div className="w-24 h-24 m-4">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </div>
                </div>
              </Card>
            ))
          ) : filteredItems.length > 0 ? (
            // Menu items
            filteredItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))
          ) : (
            // Empty state
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No items found
                </h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or check back later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isOpen && <CartSidebar />}
    </div>
  );
}

// Import cart sidebar component
function CartSidebar() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotalPrice, getSubtotal, getDeliveryFee } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background dark:bg-card shadow-xl animate-slide-up">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">🛒 Your Order</h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {item.menuItem.imageUrl ? (
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs">
                          🍔
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm">{item.menuItem.name}</h4>
                      <p className="text-primary font-semibold text-sm">
                        ${parseFloat(item.menuItem.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <span className="font-medium text-foreground w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-success">
                    {getDeliveryFee() === 0 ? 'Free' : `$${getDeliveryFee().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-3">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    // Navigate to checkout
                    window.location.href = '/mini/checkout';
                  }}
                  className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 rounded-xl transition-colors"
                >
                  Proceed to Checkout 🎉
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
