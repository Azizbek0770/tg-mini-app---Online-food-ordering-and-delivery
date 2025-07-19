import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  icon: Icon,
  iconColor 
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${
              changeType === 'positive' ? 'text-success' : 'text-destructive'
            }`}>
              {changeType === 'positive' ? '+' : ''}{change}
            </span>
            <span className="text-muted-foreground ml-1">from yesterday</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
