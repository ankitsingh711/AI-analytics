'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { DashboardStats, Violation } from '../types';

interface ChartsSectionProps {
  stats: DashboardStats;
  violations: Violation[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ChartsSection({ stats, violations }: ChartsSectionProps) {
  // Prepare pie chart data
  const pieData = Object.entries(stats.violations_by_type).map(([type, count], index) => ({
    name: type,
    value: count,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare time series data (violations by date)
  const violationsByDate = violations.reduce((acc, violation) => {
    const date = violation.date;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeSeriesData = Object.entries(violationsByDate)
    .map(([date, count]) => ({
      date,
      violations: count,
      formattedDate: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'Fire Detected':
        return '🔥';
      case 'Unauthorized Person':
        return '👤';
      case 'No PPE Kit':
        return '🦺';
      case 'Equipment Malfunction':
        return '⚙️';
      default:
        return '⚠️';
    }
  };

  const getViolationColor = (type: string) => {
    switch (type) {
      case 'Fire Detected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Unauthorized Person':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'No PPE Kit':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Equipment Malfunction':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} violations ({((data.value / stats.total_violations) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} violations
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Pie Chart - Violation Types */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <PieChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Violation Distribution</CardTitle>
                <CardDescription>Breakdown by violation type</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono">
              {stats.total_violations} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getViolationIcon(entry.name)}</span>
                      <span className="font-medium text-sm">{entry.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{entry.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {((entry.value / stats.total_violations) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Violations Over Time */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Violations Timeline</CardTitle>
                <CardDescription>Daily violation counts over time</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">
                {timeSeriesData.length} days
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis 
                  dataKey="formattedDate" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar 
                  dataKey="violations" 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations List */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest violation reports</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recent_violations.slice(0, 5).map((violation, index) => (
              <div key={index} className="group p-4 rounded-lg border bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getViolationIcon(violation.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={getViolationColor(violation.type)}
                        >
                          {violation.type}
                        </Badge>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {violation.drone_id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {violation.location} • {violation.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono text-sm font-medium">
                      {violation.timestamp}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {violation.latitude.toFixed(4)}, {violation.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {stats.recent_violations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent violations found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 