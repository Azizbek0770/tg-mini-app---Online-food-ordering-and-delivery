import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <Card className="w-full max-w-md mx-4 card-shadow">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">🍔</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Durger King
          </h1>
          
          <p className="text-muted-foreground mb-8 text-lg">
            Fast & Fresh Delivery 🚀
          </p>

          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 text-lg font-semibold"
              size="lg"
            >
              🔑 Login to Order
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Browse our delicious menu and place your order!
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Powered by Telegram Mini Apps ⚡
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
