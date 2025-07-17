'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardStats, Violation } from '@/types';

interface ChartsSectionProps {
  stats: DashboardStats;
  violations: Violation[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ChartsSection({ stats, violations }: ChartsSectionProps) {
  // Prepare pie chart data
  const pieData = Object.entries(stats.violations_by_type).map(([type, count]) => ({
    name: type,
    value: count
  }));

  // Prepare time series data (violations by date)
  const violationsByDate = violations.reduce((acc, violation) => {
    const date = violation.date;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeSeriesData = Object.entries(violationsByDate).map(([date, count]) => ({
    date,
    violations: count
  }));

  return (
    <div className="space-y-8">
      {/* Pie Chart - Violation Types */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Violations by Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent || 0 * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Violations Over Time */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Violations Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="violations" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Violations List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Violations</h3>
        <div className="space-y-3">
          {stats.recent_violations.slice(0, 5).map((violation, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  violation.type === 'Fire Detected' ? 'bg-red-500' :
                  violation.type === 'Unauthorized Person' ? 'bg-orange-500' :
                  violation.type === 'No PPE Kit' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{violation.type}</p>
                  <p className="text-sm text-gray-600">{violation.drone_id} - {violation.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{violation.date}</p>
                <p className="text-sm text-gray-500">{violation.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 