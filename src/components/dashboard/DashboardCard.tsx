import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  subtitle: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient: string;
  children?: ReactNode;
}

export const DashboardCard = ({ 
  title, 
  icon: Icon, 
  value, 
  subtitle, 
  trend, 
  gradient,
  children 
}: DashboardCardProps) => {
  return (
    <Card className={`relative overflow-hidden border-0 shadow-lg transition-smooth hover:shadow-glow ${gradient}`}>
      <div className="absolute inset-0 bg-gradient-card opacity-90" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          {trend && (
            <div className={`text-sm font-medium px-2 py-1 rounded-full ${
              trend.isPositive ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
            }`}>
              {trend.value}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-white/80">{subtitle}</div>
        </div>
        
        {children && (
          <div className="mt-4 pt-4 border-t border-white/20">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};