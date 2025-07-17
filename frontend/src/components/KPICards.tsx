'use client';

import { AlertTriangle, Drone, MapPin, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { DashboardStats } from '../types';

interface KPICardsProps {
  stats: DashboardStats;
}

export default function KPICards({ stats }: KPICardsProps) {
  const totalPossibleViolations = 100; // Mock value for progress calculation
  const violationProgress = (stats.total_violations / totalPossibleViolations) * 100;

  const kpiData = [
    {
      title: 'Total Violations',
      value: stats.total_violations,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      progress: violationProgress,
      trend: '+12%',
      description: 'Safety incidents detected'
    },
    {
      title: 'Active Drones',
      value: stats.drones.length,
      icon: Drone,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      progress: (stats.drones.length / 10) * 100, // Assuming max 10 drones
      trend: '+2',
      description: 'Currently monitoring'
    },
    {
      title: 'Locations',
      value: stats.locations.length,
      icon: MapPin,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      progress: (stats.locations.length / 5) * 100, // Assuming max 5 locations
      trend: '0%',
      description: 'Areas under surveillance'
    },
    {
      title: 'Violation Types',
      value: Object.keys(stats.violations_by_type).length,
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      progress: (Object.keys(stats.violations_by_type).length / 6) * 100, // Assuming max 6 types
      trend: '+1',
      description: 'Different incident categories'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        const isPositiveTrend = kpi.trend.startsWith('+');
        
        return (
          <Card 
            key={index} 
            className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/20 dark:to-slate-700/20" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${kpi.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {/* Main value */}
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold">
                    {kpi.value}
                  </div>
                  <Badge 
                    variant={isPositiveTrend && kpi.title === 'Total Violations' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {kpi.trend}
                  </Badge>
                </div>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
                
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(kpi.progress)}%</span>
                  </div>
                  <Progress 
                    value={kpi.progress} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </Card>
        );
      })}
    </div>
  );
} 