import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import CustomerHome from "@/pages/customer/home";
import Cart from "@/pages/customer/cart";
import Checkout from "@/pages/customer/checkout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminMenu from "@/pages/admin/menu";
import AdminCategories from "@/pages/admin/categories";
import AdminUsers from "@/pages/admin/users";
import AdminStaff from "@/pages/admin/staff";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {/* Public customer routes (Mini App) */}
      <Route path="/mini" component={CustomerHome} />
      <Route path="/mini/cart" component={Cart} />
      <Route path="/mini/checkout" component={Checkout} />
      
      {/* Admin routes require authentication */}
      {isLoading ? (
        <Route path="/admin*">
          {() => (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          )}
        </Route>
      ) : isAuthenticated && user?.isAdmin ? (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/menu" component={AdminMenu} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/staff" component={AdminStaff} />
          <Route path="/admin/settings" component={AdminSettings} />
        </>
      ) : (
        <Route path="/" component={Landing} />
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="durger-king-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
