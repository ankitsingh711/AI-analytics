'use client';

import { AlertTriangle, Drone, MapPin, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/types';

interface KPICardsProps {
  stats: DashboardStats;
}

export default function KPICards({ stats }: KPICardsProps) {
  const kpiData = [
    {
      title: 'Total Violations',
      value: stats.total_violations,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Active Drones',
      value: stats.drones.length,
      icon: Drone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Locations Monitored',
      value: stats.locations.length,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Violation Types',
      value: Object.keys(stats.violations_by_type).length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 