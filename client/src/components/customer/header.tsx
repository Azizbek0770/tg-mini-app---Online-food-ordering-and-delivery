import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function CustomerHeader() {
  const { toggleCart, getTotalItems } = useCart();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const totalItems = getTotalItems();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-background dark:bg-card shadow-sm sticky top-0 z-40 border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍔</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Durger King</h1>
              <p className="text-xs text-muted-foreground">
                {user ? `Hi ${user.firstName || 'there'}! 👋` : 'Fast & Fresh Delivery'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              onClick={toggleCart}
              className="relative bg-primary hover:bg-primary-dark text-primary-foreground p-3"
              size="sm"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium animate-bounce-in"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
