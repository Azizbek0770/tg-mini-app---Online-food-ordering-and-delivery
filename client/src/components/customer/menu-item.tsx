import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { MenuItem as MenuItemType } from "@shared/schema";
import { Star, Plus } from "lucide-react";
import { useState } from "react";
import { telegram } from "@/lib/telegram";

interface MenuItemProps {
  item: MenuItemType & { category: any };
}

export function MenuItem({ item }: MenuItemProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Haptic feedback for Telegram
    telegram.hapticFeedback('light');
    
    addItem(item);
    
    // Visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-200 card-shadow">
      <div className="flex">
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg mb-1">
                {item.name}
              </h3>
              {item.isPopular && (
                <Badge variant="secondary" className="text-xs mb-2">
                  ⭐ Popular
                </Badge>
              )}
            </div>
            <span className="text-primary font-bold text-lg ml-2">
              ${parseFloat(item.price).toFixed(2)}
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {parseFloat(item.rating || '0') > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {parseFloat(item.rating || '0').toFixed(1)} ({item.ratingCount || 0})
                  </span>
                </div>
              )}
              
              {item.preparationTime && (
                <span className="text-xs text-muted-foreground">
                  🕒 {item.preparationTime}min
                </span>
              )}
              
              {item.calories && (
                <span className="text-xs text-muted-foreground">
                  🔥 {item.calories} cal
                </span>
              )}
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`transition-all duration-200 ${
                isAdding 
                  ? 'bg-success hover:bg-success text-success-foreground' 
                  : 'bg-primary hover:bg-primary-dark text-primary-foreground'
              }`}
              size="sm"
            >
              {isAdding ? (
                '✓ Added!'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
        
        {item.imageUrl && (
          <div className="w-24 h-24 m-4 flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
