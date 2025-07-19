import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function AdminHeader() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-background dark:bg-card shadow-sm border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🛠️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Durger King Admin</h1>
              <p className="text-sm text-muted-foreground">Restaurant Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-success hover:bg-success text-success-foreground">
              <div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse mr-1" />
              Online
            </Badge>
            
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
