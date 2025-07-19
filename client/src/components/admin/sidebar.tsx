import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ShoppingBag,
  Utensils,
  Tags,
  Users,
  UserCheck,
  Settings,
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: 5 },
  { id: 'menu', label: 'Menu', icon: Utensils },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'staff', label: 'Staff', icon: UserCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-background dark:bg-card border-r border-border min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'default' : 'ghost'}
            className={cn(
              "w-full justify-start font-medium",
              activeSection === item.id && "bg-primary text-primary-foreground"
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
            {item.badge && (
              <Badge className="ml-auto bg-destructive text-destructive-foreground">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
