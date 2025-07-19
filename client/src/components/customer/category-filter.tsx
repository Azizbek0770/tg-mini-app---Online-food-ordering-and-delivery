import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="bg-background dark:bg-card px-4 py-3 shadow-sm border-b border-border">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-20 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background dark:bg-card px-4 py-3 shadow-sm border-b border-border">
      <ScrollArea className="w-full">
        <div className="flex space-x-3">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
            className="whitespace-nowrap"
          >
            🍽️ All
          </Button>
          
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category.slug)}
              className="whitespace-nowrap"
            >
              {category.emoji} {category.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
